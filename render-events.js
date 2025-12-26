// Function to render events
async function renderEvents(containerId, limit = null, showOnly = false) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // If eventsData is empty, fetch from sheet first
  if (eventsData.length === 0) {
    await fetchEventsFromSheet();
  }

  // Filter events based on showOnly parameter
  let filteredEvents = eventsData;
  if (showOnly) {
    // Only show events where show === true (Show column = "yes")
    filteredEvents = eventsData.filter(event => event.show === true);
  }
  // If showOnly is false, show all events (for events page)

  // Get events to display (limited or all)
  const eventsToShow = limit ? filteredEvents.slice(0, limit) : filteredEvents;

  // Clear container
  container.innerHTML = '';

  // Show message if no events
  if (eventsToShow.length === 0) {
    container.innerHTML = '<p>No events available at this time.</p>';
    return;
  }

  // Render each event
  eventsToShow.forEach(event => {
    const article = document.createElement('article');
    article.className = 'post-card';
    
    article.innerHTML = `
      <div class="post-image">
        <img src="${event.image}" alt="${event.alt}">
      </div>
      <div class="post-content">
        <div class="post-date">${event.date}</div>
        <h3>${event.title}</h3>
        <p>${event.description}</p>
      </div>
    `;
    
    container.appendChild(article);
  });
}

