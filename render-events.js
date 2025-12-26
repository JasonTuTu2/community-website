// Function to render events
function renderEvents(containerId, limit = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Get events to display (limited or all)
  const eventsToShow = limit ? eventsData.slice(0, limit) : eventsData;

  // Clear container
  container.innerHTML = '';

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

