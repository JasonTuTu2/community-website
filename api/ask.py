#!/usr/bin/env python3
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests
import csv
import io
import sys

# Load environment variables from .env file (if present)
load_dotenv()

# Serve static files from project root (one level up from api/)
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
app = Flask(__name__, static_folder=project_root, static_url_path='')
CORS(app)


def check_quota_error(status_code, response_body):
    """Check if the error is a quota/rate limit error and return a user-friendly message."""
    if status_code == 429:
        return "Rate limit exceeded. GitHub Models API quota limit reached. Please try again later."
    if status_code == 401:
        return "Unauthorized. Check your GITHUB_TOKEN is valid and not expired."
    if status_code == 403:
        return "Access forbidden. Your GitHub token may not have permission to use Models API."
    
    # Check response body for quota-related messages
    if isinstance(response_body, dict):
        error_msg = response_body.get('error', {})
        if isinstance(error_msg, dict):
            msg = error_msg.get('message', '').lower()
        else:
            msg = str(error_msg).lower()
        
        if 'quota' in msg or 'rate limit' in msg or 'out of' in msg or 'exceeded' in msg:
            return f"Quota or rate limit error from GitHub: {error_msg}"
    
    return None

GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
# GitHub inference endpoint and default model (matches your sample)
GITHUB_API_URL = 'https://models.github.ai/inference/chat/completions'
GITHUB_DEFAULT_MODEL = os.getenv('GITHUB_MODEL', 'openai/gpt-4o')
SHEET_CSV_URL = os.getenv('SHEET_CSV_URL')


def fetch_sheet_preview():
    if not SHEET_CSV_URL:
        return ''
    try:
        r = requests.get(SHEET_CSV_URL, timeout=10)
        r.raise_for_status()
        sio = io.StringIO(r.text)
        reader = csv.reader(sio)
        rows = []
        max_rows = 30
        max_cols = 9
        max_cell = 350
        for i, row in enumerate(reader):
            if i >= max_rows:
                break
            truncated = []
            for c in row[:max_cols]:
                if c is None:
                    c = ''
                cell = c.replace('\n', ' ').strip()
                if len(cell) > max_cell:
                    cell = cell[:max_cell] + '...'
                truncated.append(cell)
            rows.append(', '.join(truncated))
        preview = '\n'.join(rows)
        if preview and len(r.text.splitlines()) > max_rows:
            preview += f"\n... (truncated to first {max_rows} rows)"
        return preview
    except Exception as e:
        return f'/* sheet fetch error: {e} */'


@app.route('/api/ask', methods=['POST'])
def ask():
    data = request.get_json(force=True)
    question = (data or {}).get('question', '').strip()
    if not question:
        return jsonify({'error': 'No question provided'}), 400

    # Only GitHub inference supported now. Require GITHUB_TOKEN.
    if not GITHUB_TOKEN:
        return jsonify({'error': 'Server missing GITHUB_TOKEN environment variable'}), 500

    headers = {
        'Authorization': f'Bearer {GITHUB_TOKEN}',
        'Content-Type': 'application/json',
    }

    # Build system message including spreadsheet preview (if configured)
    sheet_preview = fetch_sheet_preview()
    system_message = (
        "You are a helpful, polite assistant for Markham Community Connect Association (MCCA).\n"
        "Your role is to answer questions about MCCA using the provided spreadsheet data (events, programs, dates, locations, descriptions, and links).\n"
        "Rules:\n"
        "- Base answers only on the spreadsheet content; do not invent information.\n"
        "- If information is missing or unclear, say so and suggest contacting MCCA.\n"
        "- Use a friendly, community-focused tone.\n\n"
        "Spreadsheet preview (first rows/columns):\n"
        + (sheet_preview if sheet_preview else '[no sheet data available]')
    )

    payload = {
        'model': GITHUB_DEFAULT_MODEL,
        'messages': [
            {'role': 'system', 'content': system_message},
            {'role': 'user', 'content': question},
        ],
        'max_tokens': 500,
        'temperature': 0.7,
    }

    try:
        r = requests.post(GITHUB_API_URL, headers=headers, json=payload, timeout=30)
    except requests.RequestException as e:
        error_msg = f'GitHub inference request failed: {e}'
        print(f'ERROR: {error_msg}', file=sys.stderr)
        return jsonify({'error': error_msg}), 502

    # If GitHub returns an error status, parse and report quota errors clearly
    if r.status_code >= 400:
        try:
            body = r.json()
        except Exception:
            body = r.text
        
        # Check for quota/rate limit errors specifically
        quota_msg = check_quota_error(r.status_code, body)
        if quota_msg:
            print(f'QUOTA ERROR: {quota_msg}', file=sys.stderr)
            return jsonify({'error': quota_msg}), 429
        
        # Generic error
        error_msg = f'GitHub API returned status {r.status_code}'
        print(f'ERROR: {error_msg} - Response: {body}', file=sys.stderr)
        return jsonify({'error': error_msg, 'details': str(body)}), 502

    # Success - parse assistant reply (expecting GitHub's chat/completions shape similar to OpenAI)
    try:
        resp_json = r.json()
        answer = resp_json['choices'][0]['message']['content']
    except Exception as e:
        # Return parsing error and raw response for debugging
        return jsonify({'error': 'Failed to parse GitHub response', 'details': str(e), 'raw': r.text}), 502

    return jsonify({'answer': answer})


if __name__ == '__main__':
    # For demo purposes run on all interfaces port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)


@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def serve_site(path):
    """Serve static files from the project root so the site is available
    on the same origin as the API (e.g. http://127.0.0.1:5000/ask.html).
    """
    return send_from_directory(app.static_folder, path)
