function applyProdanoLabel() {
    $(".product").each(function () {
      if ($(this).find(".availability-amount").length === 0) {
        // Find the <a> element with class "image" inside the element with data-testid="productItem"
        var anchor = $(this).find('[data-testid="productItem"] a.image');
  
        // Set the initial opacity to 50% and add the transition
        anchor.css({
          opacity: "0.3",
          transition: "opacity 0.3s ease",
        });
  
        // Add hover functionality
        anchor.hover(
          function () {
            // Mouse enter
            $(this).css("opacity", "1");
          },
          function () {
            // Mouse leave
            $(this).css("opacity", "0.3");
          }
        );
  
        // Find the span with text "Prodáno" inside the element with class availability
        $(this)
              .find('.availability span:not(:contains("Skladem"))')
              .css({
                  "color": "black",
                  "background-color": "rgb(255, 0, 0)"
              });
  
      }
    });
  }
  
  function sortProductsBlock() {
      var items = $(".products-block .product").get();
      console.log("Sorted");
  
      items.sort(function (a, b) {
        var textA = $(a)
          .find(".p .p-in .p-bottom div .availability span:first")
          .text()
          .trim();
        var textB = $(b)
          .find(".p .p-in .p-bottom div .availability span:first")
          .text()
          .trim();
  
        var isSoldOutA = !textA.includes("Skladem");
        var isSoldOutB = !textB.includes("Skladem");
  
        if (isSoldOutA && !isSoldOutB) return 1;
        if (!isSoldOutA && isSoldOutB) return -1;
        return 0; // Keep relative order if both are the same type
      });
  
      $(".products-block").html(items);
    }
  
  $(document).ready(function () {
  
    const targetNode = document.querySelector(".products-block");
      sortProductsBlock();
    if (targetNode) {
      const observer = new MutationObserver((mutations) => {
        observer.disconnect(); // 🔸 Temporarily stop observing
        //sortProducts();
        applyProdanoLabel();
        observer.observe(targetNode, { childList: true, subtree: true }); // 🔸 Reattach observer after sorting
      });
  
      observer.observe(targetNode, { childList: true, subtree: true });
    }
  });
  
  $(document).ready(function() {
          let clickedInput = false;
      $("#category-header").on("click", "form", function() {
              console.log("Clicked");
          clickedInput = true;
      });
      
      $(document).ajaxComplete(function() {
              if (clickedInput) {
              sortProductsBlock();
              applyProdanoLabel();
            clickedInput = false;
          }
      })
  });
  