function sortProducts() {
    var items = $(".search-whisperer-products li").get();

    items.sort(function(a, b){
        var textA = $(a).find(".p-info .p-availability .p-availability-inner .availability-label").text().trim();
        var textB = $(b).find(".p-info .p-availability .p-availability-inner .availability-label").text().trim();

        var isSoldOutA = textA.includes("Prodáno") || textA.includes("Vyprodáno");
        var isSoldOutB = textB.includes("Prodáno") || textB.includes("Vyprodáno");

        if (isSoldOutA && !isSoldOutB) return 1;
        if (!isSoldOutA && isSoldOutB) return -1;
        return 0; // Keep relative order if both are the same type
    });

    $(".search-whisperer-products").html(items);
}

const targetNode = document.querySelector(".search-input");
// Wait for the .search-whisperer-products element to be added to the DOM
const observer = new MutationObserver((mutations, obs) => {
    if ($(".search-whisperer-products").length) {
        sortProducts();
        //obs.disconnect(); // Stop observing once the element is found and sorted
    }
});

if (targetNode) {
  observer.observe(targetNode, { characterData: true, subtree: true });
}