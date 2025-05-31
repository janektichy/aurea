document.addEventListener('DOMContentLoaded', () => {
  const headerButtons = document.querySelector('.header_buttons');
  const selectedButton = headerButtons.querySelector('.selected');
  if (!headerButtons) return;

  const buttons = headerButtons.querySelectorAll('a');
  let isExpanded = false;

  function handleButtonClick(e) {
    const clickedButton = e.currentTarget;
    const isSelected = clickedButton.classList.contains('selected');
    const href = clickedButton.getAttribute('href');

    if (window.innerWidth <= 975) {
      e.preventDefault();
      
      if (isSelected) {
        // Toggle expansion when clicking selected button
        isExpanded = !isExpanded;
        headerButtons.classList.toggle('expanded', isExpanded);
      } else if (isExpanded) {
        // Navigate when clicking other buttons in expanded state
        if (href && href !== '#') {
          window.location.href = href;
        }
      }
    }
  }

  // Add click handlers to all buttons
  buttons.forEach(button => {
    button.addEventListener('click', handleButtonClick);
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 975) {
      isExpanded = false;
      headerButtons.classList.remove('expanded');
    }
  });

  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 750) {
        headerButtons.classList.remove('expanded');
        isExpanded = false;
      }
    }, 250);
  });

  // Initialize mobile state
  if (window.innerWidth <= 750) {
    headerButtons.classList.remove('expanded');
    isExpanded = false;
  }

  const selectedBtn = document.querySelector('.header_buttons a.selected');
  if (selectedBtn && !selectedBtn.querySelector('span')) {
    selectedBtn.appendChild(document.createElement('span'));
  }
}); 