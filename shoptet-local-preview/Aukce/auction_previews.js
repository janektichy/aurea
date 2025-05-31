document.addEventListener('DOMContentLoaded', () => {
    // Function to create an auction item preview
    function createAuctionPreview(item) {
        return `
            <a href="${item.item_link}" class="auction-item-preview-link">
                <div class="auction-item-preview">
                    <img class="item-preview-image" src="${item.image}" alt="${item.title}" loading="lazy">
                    <div class="item-title"><strong>${item.title}</strong></div>
                    <div class="item-category">${item.category}</div>
                    <div class="item-price"><strong>Vyvolávací cena:</strong> ${item.price}</div>
                </div>
            </a>
        `;
    }

    // Function to initialize the auction previews section
    async function initializeAuctionPreviews() {
        try {
            const response = await fetch('./json/auction_items.json');
            const data = await response.json();
            
            const previewsWrapper = document.querySelector('.carousel-item-content[data-carousel-index="2"] .auction-previews-wrapper');
            if (!previewsWrapper) {
                console.error('Auction previews wrapper not found in carousel');
                return;
            }

            const previewsHTML = data.items
                .slice(0, 3) // Take only first 3 items
                .map(createAuctionPreview)
                .join('');

            previewsWrapper.innerHTML = `
                <div class="auction-main-layout">
                    ${previewsHTML}
                </div>
            `;
        } catch (error) {
            console.error('Error loading auction previews:', error);
        }
    }

    // Initialize the previews
    initializeAuctionPreviews();
}); 