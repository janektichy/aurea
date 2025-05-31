document.addEventListener('DOMContentLoaded', () => {
  fetch('/user/documents/ViewScripts/Aukce/json/current_auction_2.json')
    .then(response => response.json())
    .then(data => renderCurrentAuction(data));
});

function renderCurrentAuction(data) {
  const container = document.getElementById('current-auction-content');
  if (!container) return;

  // Header HTML for the auction (title, date, place)
  const header = `
    <div class="auction-header">
      <h3>${data.title}</h3>
      <div class="auction-date"><strong>Datum a čas:</strong> ${data.date}</div>
      <div class="auction-place">
        <strong>Místo konání:</strong> <span class="place-text-value">${data.place_text}</span>
      </div>
    </div>
  `;

  // Auction Program Table HTML
  const programRows = data.auction_program.map(row => `
    <tr>
      <td>${row.program_date}</td>
      <td>${row.program_description}</td>
    </tr>
  `).join('');

  const programTable = `
    <table class="auction-program">
      <thead>
        <tr>
          <th>Čas</th>
          <th>Program</th>
        </tr>
      </thead>
      <tbody>
        ${programRows}
      </tbody>
    </table>
  `;

  // Content for the left side (header + table)
  const leftSideContent = `
    ${header}
    ${programTable}
  `;

  // Link for the left side
  const auctionInfoLinkHref = data.auction_link || '#';

  // Clickable left side
  const clickableLeftSide = `
    <a href="${auctionInfoLinkHref}" class="auction-info-clickable-box">
      ${leftSideContent}
    </a>
  `;

  // Item Preview HTML (right side) - This IS a clickable link
  const preview = data.item_preview;
  const categoryHTML = preview.category ? `<div class="item-category">${preview.category}</div>` : '';
  const itemLinkHref = preview.item_link || '#'; 

  const itemPreview = `
    <a href="${itemLinkHref}" class="auction-item-preview-link">
      <div class="auction-item-preview">
        <img class="item-preview-image" src="./images/current_auction_item_preview.jpg" alt="${preview.title}">
        <div class="item-title"><strong>${preview.title}</strong></div>
        ${categoryHTML}
        <div class="item-price"><strong>Vyvolávací cena:</strong> ${preview.price}</div>
      </div>
    </a>
  `;

  // This content is injected into the #current-auction-content div in index.html
  container.innerHTML = `
    <div class="auction-main-layout">
      <div class="auction-main-left">
        ${clickableLeftSide}
      </div>
      <div class="auction-main-right">
        ${itemPreview}
      </div>
    </div>
  `;
} 