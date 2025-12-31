#!/usr/bin/env python3
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import requests

# Serve static files from project root (one level up from api/)
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
app = Flask(__name__, static_folder=project_root, static_url_path='')
CORS(app)

GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
# GitHub inference endpoint and default model (matches your sample)
GITHUB_API_URL = 'https://models.github.ai/inference/chat/completions'
GITHUB_DEFAULT_MODEL = os.getenv('GITHUB_MODEL', 'openai/gpt-4o')


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

    payload = {
        'model': GITHUB_DEFAULT_MODEL,
        'messages': [
            {'role': 'system', 'content': 'You are a helpful assistant for a community association website.'},
            {'role': 'user', 'content': question},
        ],
        'max_tokens': 500,
        'temperature': 0.7,
    }

    try:
        r = requests.post(GITHUB_API_URL, headers=headers, json=payload, timeout=30)
    except requests.RequestException as e:
        return jsonify({'error': 'GitHub inference request failed', 'details': str(e)}), 502

    # If GitHub returns an error status, include the status and body to help debugging
    if r.status_code >= 400:
        try:
            body = r.json()
        except Exception:
            body = r.text
        return jsonify({'error': 'GitHub API returned error', 'status_code': r.status_code, 'response': body}), 502

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
