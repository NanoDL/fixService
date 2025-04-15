/**
 * Общие скрипты для сайта
 */

import * as bootstrap from 'bootstrap';

/**
 * Инициализация тултипов Bootstrap
 */
export function initTooltips() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl, {
      boundary: document.body
    });
  });
}

/**
 * Инициализация всплывающих подсказок Bootstrap
 */
export function initPopovers() {
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });
}

/**
 * Инициализация отложенной загрузки изображений
 */
export function initLazyLoading() {
  const lazyImages = [].slice.call(document.querySelectorAll('img.lazy'));
  
  if ('IntersectionObserver' in window) {
    let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          if (lazyImage.dataset.srcset) {
            lazyImage.srcset = lazyImage.dataset.srcset;
          }
          lazyImage.classList.remove('lazy');
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(function(lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  } else {
    // Fallback для браузеров без поддержки IntersectionObserver
    let lazyImageLoading = function() {
      let scrollTop = window.pageYOffset;
      lazyImages.forEach(function(lazyImage) {
        if (lazyImage.offsetTop < (window.innerHeight + scrollTop)) {
          lazyImage.src = lazyImage.dataset.src;
          if (lazyImage.dataset.srcset) {
            lazyImage.srcset = lazyImage.dataset.srcset;
          }
          lazyImage.classList.remove('lazy');
        }
      });
      if (lazyImages.length == 0) { 
        document.removeEventListener('scroll', lazyImageLoading);
        window.removeEventListener('resize', lazyImageLoading);
        window.removeEventListener('orientationChange', lazyImageLoading);
      }
    };

    document.addEventListener('scroll', lazyImageLoading);
    window.addEventListener('resize', lazyImageLoading);
    window.addEventListener('orientationChange', lazyImageLoading);
  }
}

/**
 * Плавная прокрутка к якорям
 */
export function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
} 