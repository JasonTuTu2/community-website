# Google Sheets Setup Instructions

## Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it something like "Community Events" or "Website Events"

## Step 2: Set Up Column Headers

In Row 1, add these exact column headers (one per column):

| Column A | Column B | Column C | Column D | Column E | Column F |
|----------|----------|----------|----------|----------|----------|
| Date | DateSort | Title | Description | Image | Alt |

**Important:** Keep these exact column names in Row 1.

## Step 3: Add Your First Event

Starting from Row 2, add your events. Example:

| Date | DateSort | Title | Description | Image | Alt |
|------|----------|-------|-------------|-------|-----|
| March 15, 2024 | 2024-03-15 | Spring Community Garden Opening | We're excited to announce... | images/community-garden.jpg | Spring Community Garden Opening |

**Notes:**
- **Date**: Display date (e.g., "March 15, 2024")
- **DateSort**: Sortable date in YYYY-MM-DD format (e.g., "2024-03-15")
- **Title**: Event title
- **Description**: Full event description
- **Image**: Image path (e.g., "images/community-garden.jpg")
- **Alt**: Image alt text for accessibility

## Step 4: Make Sheet Public

1. Click the **Share** button (top right)
2. Click **Change to anyone with the link**
3. Set permission to **Viewer**
4. Click **Done**

## Step 5: Get Your Sheet ID

1. Look at your Google Sheet URL in the browser
2. It will look like: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit`
3. Copy the `YOUR_SHEET_ID_HERE` part (the long string between `/d/` and `/edit`)

## Step 6: Update Your Website

1. Open the file `sheet-config.js` in your website folder
2. Find this line: `const SHEET_ID = 'YOUR_SHEET_ID';`
3. Replace `'YOUR_SHEET_ID'` with your actual Sheet ID (keep the quotes)
4. Save the file

Example:
```javascript
const SHEET_ID = '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t';
```

## Step 7: Test

1. Upload your updated files to your website
2. Visit your website - events should load from Google Sheets!
3. Add a new row in your Google Sheet
4. Refresh your website - the new event should appear automatically

## Tips

- **Adding Events**: Just add a new row in your Google Sheet with all the information
- **Editing Events**: Edit the row directly in Google Sheets
- **Deleting Events**: Delete the entire row in Google Sheets
- **Image Paths**: Make sure your images are uploaded to your website's `images/` folder
- **Date Format**: Use YYYY-MM-DD for DateSort column (e.g., 2024-03-15) for proper sorting

## Troubleshooting

- **Events not showing?** Check the browser console (F12) for errors
- **Sheet ID wrong?** Double-check you copied the correct ID from the URL
- **Sheet not public?** Make sure you shared it as "Anyone with the link can view"
- **Wrong column order?** Make sure your headers match exactly: Date, DateSort, Title, Description, Image, Alt

