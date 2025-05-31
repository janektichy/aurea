document.addEventListener('DOMContentLoaded', () => {
  fetch('./json/calendar_data.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Check for the new top-level title and the 'months' array
      if (data && data.title && data.months) { 
        renderAuctionCalendar(data);
      } else {
        console.error('Calendar data is not in the expected format. Missing title or months array.');
        const calendarContainer = document.getElementById('auction-calendar-content');
        if (calendarContainer) {
          calendarContainer.innerHTML = '<p class="error-message">Data pro kalendář aukcí nejsou ve správném formátu.</p>';
        }
      }
    })
    .catch(error => {
      console.error('Error fetching or parsing calendar_data.json:', error);
      const calendarContainer = document.getElementById('auction-calendar-content');
      if (calendarContainer) {
        calendarContainer.innerHTML = '<p class="error-message">Chyba při načítání aukčního kalendáře. Zkuste to prosím později.</p>';
      }
    });
});

function renderAuctionCalendar(data) {
  const calendarContainer = document.getElementById('auction-calendar-content');
  if (!calendarContainer) {
    console.error('Error: Target container #auction-calendar-content not found.');
    return;
  }

  // Update the H3 title of the calendar slide using the title from JSON
  const calendarSlide = calendarContainer.closest('.carousel-item-content[data-carousel-index="1"]');
  if (calendarSlide) {
    const titleElement = calendarSlide.querySelector('h3');
    if (titleElement && data.title) {
      titleElement.textContent = data.title; // Use title from JSON for the black H3
    }
  }

  let htmlContent = '<div class="auction-calendar-list">';

  // Iterate over data.months (new array name)
  data.months.forEach(auction => {
    const navigationArrowHTML = auction.link ? '<span class="calendar-navigation-arrow">&rsaquo;</span>' : '<span class="calendar-arrow-placeholder"></span>';
    const noLinkNoteHTML = !auction.link ? '<div class="calendar-auction-no-link-note">Více podrobností bude včas doplněno</div>' : '';

    htmlContent += `
      <div class="calendar-auction-item ${auction.link ? 'clickable' : 'not-clickable'}">
        ${auction.link ? 
          `<a href="${auction.link}" target="_blank" class="calendar-auction-link">` : 
          '<div class="calendar-auction-link-placeholder">'}
          <div class="calendar-auction-content-wrapper">
            <div class="calendar-auction-left">
              <h4 class="calendar-auction-title">${auction.name}</h4>
              ${noLinkNoteHTML}
            </div>
            <div class="calendar-auction-right">
              <div class="calendar-auction-date"><strong>Datum:</strong> ${auction.date}</div>
              <div class="calendar-auction-items"><strong>Položky:</strong> ${auction.items || 'N/A'}</div>
            </div>
            ${navigationArrowHTML} 
          </div>
        ${auction.link ? '</a>' : '</div>'}
      </div>
    `;
  });

  htmlContent += '</div>'; // Close auction-calendar-list
  calendarContainer.innerHTML = htmlContent;
} 