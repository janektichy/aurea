document.addEventListener('DOMContentLoaded', () => {
  console.log("Carousel script loaded");
  
  // Select carousel elements
  const carouselContainer = document.querySelector('.carousel-container');
  const slidesWrapper = document.querySelector('.carousel-slides-wrapper');
  const slides = document.querySelectorAll('.carousel-item-content');
  const prevArrow = document.querySelector('.carousel-arrow-box:first-child');
  const nextArrow = document.querySelector('.carousel-arrow-box:last-child');
  const dots = document.querySelectorAll('.dot');
  const playPauseBtn = document.querySelector('.play-pause-btn');

  // Animation state
  let currentIndex = 0;
  let isAnimating = false;
  let slideInterval;
  let isPlaying = true;
  const SLIDE_INTERVAL = 30000; // 30 seconds

  // Drag state
  let isDragging = false;
  let startPos = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;
  const SWIPE_THRESHOLD = 50; // Minimum distance to trigger slide change

  // Log initial state
  console.log(`Found ${slides.length} slides`);
  
  // Get the height of a slide
  function getSlideHeight(slide) {
    if (!slide) return 0;
    
    // Store original styles
    const originalStyles = {
      position: slide.style.position,
      visibility: slide.style.visibility,
      display: slide.style.display,
      height: slide.style.height,
      transform: slide.style.transform,
      opacity: slide.style.opacity,
      zIndex: slide.style.zIndex
    };
    
    // Make slide visible and measurable
    slide.style.position = 'relative';
    slide.style.visibility = 'visible';
    slide.style.display = 'block';
    slide.style.height = 'auto';
    slide.style.transform = 'none';
    slide.style.opacity = '1';
    slide.style.zIndex = '1';
    
    // Force a reflow to ensure styles are applied
    void slide.offsetHeight;
    
    // Get the height directly from the slide
    const height = slide.offsetHeight;
    
    // Restore original styles
    Object.assign(slide.style, originalStyles);
    
    // Add padding for container and ensure minimum height
    return Math.max(height + 40, 100);
  }

  // Update container height
  function updateContainerHeight(slide) {
    if (!slide) return;
    
    const height = getSlideHeight(slide);
    console.log('Updating container height:', {
      slide: slide === slides[0] ? 'first' : 'other',
      measuredHeight: height,
      currentHeight: carouselContainer.offsetHeight
    });
    
    carouselContainer.style.height = `${height}px`;
  }

  // Wait for all content to be ready
  function waitForContent() {
    return new Promise((resolve) => {
      // Wait for images
      const imagePromises = Array.from(document.querySelectorAll('.carousel-item-content img')).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });

      // Wait for fonts
      if (document.fonts && document.fonts.ready) {
        imagePromises.push(document.fonts.ready);
      }

      // Wait for all promises
      Promise.all(imagePromises).then(() => {
        // Additional delay to ensure all content is rendered
        setTimeout(resolve, 100);
      });
    });
  }

  // Initialize carousel after all content is loaded
  async function initializeCarousel() {
    try {
      // First, set a temporary fixed height to prevent layout shifts
      carouselContainer.style.height = '300px'; // Temporary fixed height
      
      await waitForContent();
      
      // Initial setup
      initCarousel();
      
      // Set initial height with transition disabled
      carouselContainer.style.transition = 'none';
      updateContainerHeight(slides[currentIndex]);
      void carouselContainer.offsetWidth;
      
      // Enable transitions
      carouselContainer.style.transition = 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      
    } catch (error) {
      console.error('Error initializing carousel:', error);
      initCarousel();
    }
  }

  // Show slide with animation based on arrow direction
  function showSlide(targetIndex, direction) {
    console.log(`Showing slide ${targetIndex}, direction: ${direction}`);
    
    if (isAnimating) {
      console.log("Animation in progress, skipping");
      return;
    }
    
    isAnimating = true;
    
    if (targetIndex >= slides.length) targetIndex = 0;
    if (targetIndex < 0) targetIndex = slides.length - 1;
    
    const currentSlide = slides[currentIndex];
    const targetSlide = slides[targetIndex];
    
    // Update dots immediately before animation starts
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === targetIndex);
    });
    
    // Reset all slides except current and target
    slides.forEach((slide, i) => {
      if (i !== currentIndex && i !== targetIndex) {
        slide.style.transition = 'none';
        slide.style.transform = 'translateX(100%)';
        slide.style.opacity = '0';
        slide.style.position = 'absolute';
      }
    });
    
    // Set up initial positions
    currentSlide.style.position = 'relative';
    currentSlide.style.transform = 'translateX(0)';
    currentSlide.style.opacity = '1';
    currentSlide.style.zIndex = '1';
    
    targetSlide.style.position = 'absolute';
    targetSlide.style.top = '0';
    targetSlide.style.left = '0';
    targetSlide.style.width = '100%';
    targetSlide.style.opacity = '1';
    targetSlide.style.zIndex = '2';
    targetSlide.style.transform = direction === 'next' ? 'translateX(100%)' : 'translateX(-100%)';
    
    // Force reflow
    void carouselContainer.offsetWidth;
    
    // Start height transition
    const targetHeight = getSlideHeight(targetSlide);
    carouselContainer.style.transition = 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    carouselContainer.style.height = `${targetHeight}px`;
    
    // Start slide transition after a small delay
    setTimeout(() => {
      // Enable transitions
      currentSlide.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      targetSlide.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      
      // Move slides
      currentSlide.style.transform = direction === 'next' ? 'translateX(-100%)' : 'translateX(100%)';
      targetSlide.style.transform = 'translateX(0)';
      
      // After animation completes
      setTimeout(() => {
        // Reset all slides
        slides.forEach((slide, i) => {
          if (i !== targetIndex) {
            slide.style.transition = 'none';
            slide.style.transform = 'translateX(100%)';
            slide.style.opacity = '0';
            slide.style.position = 'absolute';
            slide.classList.remove('active');
          }
        });
        
        // Set up new active slide
        targetSlide.style.transition = 'none';
        targetSlide.style.position = 'relative';
        targetSlide.style.transform = 'translateX(0)';
        targetSlide.style.opacity = '1';
        targetSlide.classList.add('active');
        
        // Reset state
        currentIndex = targetIndex;
        isAnimating = false;
        
        // Final height check
        updateContainerHeight(targetSlide);
      }, 500);
    }, 50);
  }

  function startSlideInterval() {
    if (slideInterval) {
      clearInterval(slideInterval);
    }
    slideInterval = setInterval(() => {
      showSlide((currentIndex + 1) % slides.length, 'next');
    }, SLIDE_INTERVAL);
  }

  function togglePlayPause() {
    isPlaying = !isPlaying;
    const svg = playPauseBtn.querySelector('svg');
    
    if (isPlaying) {
      // Change to pause icon
      svg.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
      startSlideInterval();
    } else {
      // Change to play icon
      svg.innerHTML = '<path d="M8 5v14l11-7z"/>';
      clearInterval(slideInterval);
    }
  }

  // Touch and mouse event handlers
  function touchStart(event) {
    if (isAnimating) return;
    isDragging = true;
    startPos = getPositionX(event);
    carouselContainer.style.cursor = 'grabbing';
    event.preventDefault(); // Prevent default touch behavior
  }

  function touchMove(event) {
    if (!isDragging) return;
    event.preventDefault(); // Prevent default touch behavior
    
    const currentPosition = getPositionX(event);
    const diff = currentPosition - startPos;
    
    // Add visual feedback by changing cursor
    if (Math.abs(diff) > 20) {
      carouselContainer.style.cursor = diff > 0 ? 'w-resize' : 'e-resize';
    } else {
      carouselContainer.style.cursor = 'grabbing';
    }
  }

  function touchEnd(event) {
    if (!isDragging) return;
    isDragging = false;
    carouselContainer.style.cursor = 'grab';
    
    const endPos = getPositionX(event);
    const diff = endPos - startPos;
    
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        // Swiped right, show previous slide
        showSlide((currentIndex - 1 + slides.length) % slides.length, 'prev');
      } else {
        // Swiped left, show next slide
        showSlide((currentIndex + 1) % slides.length, 'next');
      }
      
      if (isPlaying) {
        startSlideInterval(); // Reset timer on manual navigation
      }
    }
  }

  function getPositionX(event) {
    if (event.type.includes('mouse')) {
      return event.pageX;
    } else if (event.touches && event.touches[0]) {
      return event.touches[0].clientX;
    } else if (event.changedTouches && event.changedTouches[0]) {
      return event.changedTouches[0].clientX;
    }
    return 0;
  }

  // Event listeners for arrows
  if (prevArrow) {
    prevArrow.addEventListener('click', () => {
      showSlide((currentIndex - 1 + slides.length) % slides.length, 'prev');
      if (isPlaying) {
        startSlideInterval(); // Reset timer on manual navigation
      }
    });
  }

  if (nextArrow) {
    nextArrow.addEventListener('click', () => {
      showSlide((currentIndex + 1) % slides.length, 'next');
      if (isPlaying) {
        startSlideInterval(); // Reset timer on manual navigation
      }
    });
  }

  // Event listeners for dots
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      if (index === currentIndex) return;
      const direction = index > currentIndex ? 'next' : 'prev';
      showSlide(index, direction);
      if (isPlaying) {
        startSlideInterval(); // Reset timer on manual navigation
      }
    });
  });

  // Event listener for play/pause button
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', togglePlayPause);
  }

  // Add touch and mouse event listeners
  carouselContainer.style.cursor = 'grab';
  carouselContainer.style.touchAction = 'none'; // Prevent browser handling of touch events
  
  // Mouse events
  carouselContainer.addEventListener('mousedown', touchStart);
  carouselContainer.addEventListener('mousemove', touchMove);
  carouselContainer.addEventListener('mouseup', touchEnd);
  carouselContainer.addEventListener('mouseleave', touchEnd);
  
  // Touch events
  carouselContainer.addEventListener('touchstart', touchStart, { passive: false });
  carouselContainer.addEventListener('touchmove', touchMove, { passive: false });
  carouselContainer.addEventListener('touchend', touchEnd);
  carouselContainer.addEventListener('touchcancel', touchEnd);

  // Initialize carousel
  function initCarousel() {
    console.log("Initializing carousel");
    
    if (!slides.length) {
      console.error("No slides found!");
      return;
    }
    
    // Set first slide as active
    slides[0].classList.add('active');
    slides[0].style.position = 'relative';
    slides[0].style.transform = 'translateX(0)';
    slides[0].style.opacity = '1';
    
    // Hide other slides
    for (let i = 1; i < slides.length; i++) {
      slides[i].classList.remove('active');
      slides[i].style.position = 'absolute';
      slides[i].style.transform = 'translateX(100%)';
      slides[i].style.opacity = '0';
    }
    
    // Set initial height with transition disabled
    carouselContainer.style.transition = 'none';
    updateContainerHeight(slides[0]);
    void carouselContainer.offsetWidth; // Force reflow
    carouselContainer.style.transition = 'height 0.5s ease-in-out';
    
    // Make sure arrows are clickable
    if (prevArrow) prevArrow.style.cursor = 'pointer';
    if (nextArrow) nextArrow.style.cursor = 'pointer';
    
    // Activate first dot
    if (dots.length > 0) {
      dots[0].classList.add('active');
    }

    // Start automatic slideshow
    startSlideInterval();
  }
  
  // Start initialization
  initializeCarousel();
  
  // Debounce function to limit resize calculations
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Handle window resize
  const handleResize = debounce(() => {
    if (slides[currentIndex]) {
      // Temporarily disable transitions during resize
      carouselContainer.style.transition = 'none';
      updateContainerHeight(slides[currentIndex]);
      void carouselContainer.offsetWidth; // Force reflow
      carouselContainer.style.transition = 'height 0.5s ease-in-out';
    }
  }, 100);
  
  window.addEventListener('resize', handleResize);
  
  // Also update height when images load
  slides.forEach(slide => {
    const images = slide.getElementsByTagName('img');
    Array.from(images).forEach(img => {
      img.addEventListener('load', () => {
        if (slide === slides[currentIndex]) {
          updateContainerHeight(slide);
        }
      });
    });
  });

  // --- Countdown Timer Logic ---
  const countDownDate = new Date('2025-05-24T09:30:00+02:00').getTime();

  // Update the countdown every 1 second
  const countdownInterval = setInterval(function() {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const d = document.getElementById('d');
    const h = document.getElementById('h');
    const m = document.getElementById('m');
    const s = document.getElementById('s');
    const countdownElement = document.getElementById('countdown');

    if (!d || !h || !m || !s || !countdownElement) {
      return;
    }

    if (distance < 0) {
      clearInterval(countdownInterval);
      countdownElement.innerHTML = "EXPIRED";
      return;
    }

    d.textContent = String(days).padStart(2, '0');
    h.textContent = String(hours).padStart(2, '0');
    m.textContent = String(minutes).padStart(2, '0');
    s.textContent = String(seconds).padStart(2, '0');
  }, 1000);
}); 