// Fetch events from Google Sheets
let eventsData = [];

async function fetchEventsFromSheet() {
  try {
    console.log('Fetching from:', SHEET_URL);
    const response = await fetch(SHEET_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    console.log('Response received, length:', text.length);
    
    // Google Sheets API returns data wrapped in a callback function
    // Extract the JSON part (remove the callback wrapper)
    const jsonText = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const data = JSON.parse(jsonText);
    
    // Extract rows from the response
    const rows = data.table.rows;
    console.log('Total rows found:', rows.length);
    
    // Log all rows to see what we're getting
    console.log('All rows structure:', rows);
    for (let j = 0; j < rows.length; j++) {
      console.log(`Row ${j} (Sheet Row ${j + 1}):`, rows[j]);
      if (rows[j].c) {
        console.log(`  - row.c length: ${rows[j].c.length}`);
        console.log(`  - row.c contents:`, rows[j].c);
      }
    }
    
    // Process all rows as data (Google Sheets may not include header row in response)
    eventsData = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      console.log(`Processing row ${i} (Sheet Row ${i + 1}):`, row);
      
      // Handle sparse arrays - Google Sheets may not include empty cells
      // Check if row.c exists (even if sparse)
      if (row.c) {
        // Log raw cell values for debugging
        console.log(`Row ${i} raw cells:`, row.c.map((cell, idx) => ({ index: idx, value: cell?.v, formatted: cell?.f })));
        // Get raw cell values - Google Sheets API returns dates as Date objects or Date() strings
        const getRawCellValue = (index) => {
          if (row.c[index] && row.c[index].v !== null && row.c[index].v !== undefined) {
            return row.c[index].v;
          }
          return null;
        };
        
        // Get cell value as string
        const getCellValue = (index) => {
          const value = getRawCellValue(index);
          if (value === null) return '';
          
          // If it's a Date object from Google Sheets, format it
          if (value instanceof Object && value.f) {
            // Google Sheets formatted value
            return String(value.f).trim();
          }
          
          return String(value).trim();
        };
        
        // Parse date from Google Sheets format
        const parseGoogleDate = (value) => {
          if (!value) return null;
          
          // If it's already a Date object
          if (value instanceof Date) return value;
          
          // If it's a Date() string like "Date(2024,2,15)"
          if (typeof value === 'string' && value.startsWith('Date(')) {
            const match = value.match(/Date\((\d+),(\d+),(\d+)\)/);
            if (match) {
              const year = parseInt(match[1]);
              const month = parseInt(match[2]); // Google Sheets months are 0-indexed
              const day = parseInt(match[3]);
              return new Date(year, month, day);
            }
          }
          
          // Try parsing as regular date string
          const parsed = new Date(value);
          if (!isNaN(parsed.getTime())) return parsed;
          
          return null;
        };
        
        // Ignore first column (index 0), read from second column onwards
        const rawDate = getRawCellValue(1);      // Column B: Date
        const rawDateSort = getRawCellValue(2);   // Column C: DateSort
        const title = getCellValue(3);            // Column D: Title
        const description = getCellValue(4);      // Column E: Description
        const image = getCellValue(5);           // Column F: Image
        const alt = getCellValue(6);             // Column G: Alt
        const show = getCellValue(7).toLowerCase(); // Column H: Show (yes/no)
        
        // Parse dates
        const dateObj = parseGoogleDate(rawDate);
        const dateSortObj = rawDateSort ? parseGoogleDate(rawDateSort) : dateObj;
        
        // Format date for display
        const formatDate = (date) => {
          if (!date) return '';
          const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
          return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        };
        
        const date = dateObj ? formatDate(dateObj) : getCellValue(0);
        const dateSort = dateSortObj || dateObj || new Date();
        
        console.log(`Row ${i} (Sheet Row ${i + 1}) values: date="${date}", dateSort="${dateSort}", title="${title}", description="${description}"`);
        
        // Only add if we have at least date and title
        if (date && title) {
          eventsData.push({
            date: date,
            dateSort: dateSort,
            title: title,
            description: description,
            image: image || 'images/placeholder.png',
            alt: alt || title,
            show: show === 'yes' // Convert to boolean: true if "yes", false otherwise
          });
          console.log(`Row ${i} (Sheet Row ${i + 1}) ADDED successfully (Show: ${show})`);
        } else {
          console.log(`Row ${i} (Sheet Row ${i + 1}) SKIPPED: missing date (${date}) or title (${title})`);
        }
      } else {
        console.log(`Row ${i} (Sheet Row ${i + 1}) SKIPPED: no row.c property`);
      }
    }
    
    console.log('Events loaded:', eventsData.length);
    
    // Sort events by date (most recent first)
    eventsData.sort((a, b) => b.dateSort - a.dateSort);
    
    return eventsData;
  } catch (error) {
    console.error('Error fetching events from Google Sheets:', error);
    console.error('Error details:', error.message);
    // Return empty array or fallback data
    return [];
  }
}

// Initialize: Fetch events when page loads
async function initializeEvents() {
  await fetchEventsFromSheet();
  // Trigger re-render if renderEvents is already defined
  if (typeof renderEvents === 'function') {
    // Check if there's a container waiting for events
    const homeContainer = document.getElementById('events-container');
    const eventsContainer = document.getElementById('events-container');
    if (homeContainer || eventsContainer) {
      // Will be called by page-specific scripts after this loads
    }
  }
}

