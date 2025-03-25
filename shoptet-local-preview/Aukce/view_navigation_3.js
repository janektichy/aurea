document.addEventListener('DOMContentLoaded', () => {
  const sectionButtons = document.querySelectorAll('.section_buttons a');
  const sectionButtonsContainer = document.querySelector('.section_buttons');
  const auctionBox = document.querySelector('.auction_box');
  const carousel = document.getElementById('carousel');
  const sellContent = document.getElementById('sell-content');
  const bidContent = document.getElementById('bid-content');
  let currentSection = 'upcoming';
  let isDropdownOpen = false;
  
  // Update dropdown positions so non-active buttons appear just below the active button.
  function updateMobileDropdownPositions() {
    const activeBtn = document.querySelector('.section_buttons a.active');
    const activeHeight = activeBtn.offsetHeight;
    const nonActive = Array.from(sectionButtons).filter(btn => !btn.classList.contains('active'));
    nonActive.forEach((btn, index) => {
      btn.style.top = (activeHeight * (index + 1)) + "px";
    });
  }
  
  function openDropdown() {
    isDropdownOpen = true;
    sectionButtonsContainer.classList.add('open');
    updateMobileDropdownPositions();
  }
  
  function closeDropdown() {
    isDropdownOpen = false;
    sectionButtonsContainer.classList.remove('open');
    sectionButtons.forEach(btn => {
      if (!btn.classList.contains('active')) {
        btn.style.top = "";
      }
    });
  }
  
  sectionButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.innerWidth < 1000) {
        if (btn.classList.contains('active')) {
          // Toggle dropdown when clicking the active button.
          if (isDropdownOpen) {
            closeDropdown();
          } else {
            openDropdown();
          }
        } else {
          // Non‑active (dropdown) button clicked.
          document.querySelector('.section_buttons a.active').classList.remove('active');
          btn.classList.add('active');
          closeDropdown();
          const newSection = btn.dataset.section;
          if(newSection === currentSection) return;
          // Force animation: remove slide-down, force reflow, add slide-up.
          auctionBox.classList.remove('slide-down-box');
          void auctionBox.offsetWidth;
          auctionBox.classList.add('slide-up-box');
          auctionBox.addEventListener('animationend', function handler() {
            auctionBox.removeEventListener('animationend', handler);
            // Swap content based on selected section.
            carousel.style.display = 'none';
            sellContent.style.display = 'none';
            bidContent.style.display = 'none';
            if(newSection === 'upcoming'){
              carousel.style.display = 'flex';
              carousel.style.flexDirection = 'column';
            } else if(newSection === 'sell'){
              sellContent.style.display = 'block';
            } else if(newSection === 'bid'){
              bidContent.style.display = 'block';
            }
            auctionBox.classList.remove('slide-up-box');
            void auctionBox.offsetWidth;
            auctionBox.classList.add('slide-down-box');
            currentSection = newSection;
            if(newSection === 'upcoming'){
              animateCarousel(0, 'left');
            }
            resetAutoTimer();
          });
        }
      } else {
        // Desktop behavior.
        if (btn.classList.contains('active')) return;
        sectionButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const newSection = btn.dataset.section;
        auctionBox.classList.remove('slide-down-box');
        void auctionBox.offsetWidth;
        auctionBox.classList.add('slide-up-box');
        auctionBox.addEventListener('animationend', function handler() {
          auctionBox.removeEventListener('animationend', handler);
          carousel.style.display = 'none';
          sellContent.style.display = 'none';
          bidContent.style.display = 'none';
          if(newSection === 'upcoming'){
            carousel.style.display = 'flex';
            carousel.style.flexDirection = 'column';
          } else if(newSection === 'sell'){
            sellContent.style.display = 'block';
          } else if(newSection === 'bid'){
            bidContent.style.display = 'block';
          }
          auctionBox.classList.remove('slide-up-box');
          void auctionBox.offsetWidth;
          auctionBox.classList.add('slide-down-box');
          currentSection = newSection;
          if(newSection === 'upcoming'){
            animateCarousel(0, 'left');
          }
          resetAutoTimer();
        });
      }
    });
  });
  
  // Carousel animation code.
  const items = document.querySelectorAll('.carousel-item');
  const dots = document.querySelectorAll('.dot');
  let currentIndex = 0;
  
  function animateCarousel(newIndex, direction) {
    if (newIndex === currentIndex) return;
    const currentItem = items[currentIndex];
    const newItem = items[newIndex];
    const carouselItemBox = document.querySelector('.carousel-item-box');
    const fixedWidth = carouselItemBox.offsetWidth;
    carouselItemBox.style.width = fixedWidth + 'px';
    newItem.style.display = "flex";
    currentItem.style.position = 'absolute';
    newItem.style.position = 'absolute';
    currentItem.style.top = '0';
    newItem.style.top = '0';
    currentItem.style.left = '0';
    newItem.style.left = '0';
    currentItem.style.width = '100%';
    newItem.style.width = '100%';
    currentItem.style.transform = 'translateX(0)';
    if(direction === 'right'){
      newItem.style.transform = `translateX(${fixedWidth}px)`;
    } else {
      newItem.style.transform = `translateX(-${fixedWidth}px)`;
    }
    newItem.offsetHeight;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === newIndex));
    if(direction === 'right'){
      currentItem.style.transition = 'transform 0.5s ease';
      newItem.style.transition = 'transform 0.5s ease';
      currentItem.style.transform = `translateX(-${fixedWidth}px)`;
      newItem.style.transform = 'translateX(0)';
    } else {
      currentItem.style.transition = 'transform 0.5s ease';
      newItem.style.transition = 'transform 0.5s ease';
      currentItem.style.transform = `translateX(${fixedWidth}px)`;
      newItem.style.transform = 'translateX(0)';
    }
    newItem.addEventListener('transitionend', function handler(e) {
      if(e.propertyName === "transform") {
        newItem.removeEventListener('transitionend', handler);
        currentItem.classList.remove('active');
        currentItem.style.display = 'none';
        currentItem.style.transform = '';
        currentItem.style.transition = '';
        currentItem.style.position = '';
        currentItem.style.left = '';
        currentItem.style.top = '';
        currentItem.style.width = '';
        newItem.classList.add('active');
        newItem.style.transition = '';
        newItem.style.position = '';
        newItem.style.left = '';
        newItem.style.top = '';
        newItem.style.width = '';
        newItem.style.transform = '';
        currentIndex = newIndex;
        carouselItemBox.style.width = '';
      }
    }, { once: true });
  }
  
  let autoTimer = null;
  function startAutoTimer() {
    autoTimer = setInterval(() => {
      if(currentSection === 'upcoming' && getComputedStyle(carousel).display !== 'none'){
        const newIndex = (currentIndex + 1) % items.length;
        animateCarousel(newIndex, 'right');
      }
    }, 10000);
  }
  function resetAutoTimer() {
    if(autoTimer) clearInterval(autoTimer);
    startAutoTimer();
  }
  startAutoTimer();
  
  document.querySelector('.prev').onclick = () => {
    resetAutoTimer();
    const newIndex = (currentIndex + items.length - 1) % items.length;
    animateCarousel(newIndex, 'left');
  };
  
  document.querySelector('.next').onclick = () => {
    resetAutoTimer();
    const newIndex = (currentIndex + 1) % items.length;
    animateCarousel(newIndex, 'right');
  };
  
  dots.forEach(dot => {
    dot.onclick = e => {
      resetAutoTimer();
      const newIndex = +e.target.dataset.index;
      const slideDirection = newIndex > currentIndex ? 'right' : 'left';
      animateCarousel(newIndex, slideDirection);
    };
  });
});