// Точка входа для страницы мастеров
import '../../styles/main.scss';
import $ from 'jquery';
import { initTooltips, initPopovers, initLazyLoading, initSmoothScrolling } from '../../scripts/common.js';

// Инициализация компонентов страницы мастеров
document.addEventListener('DOMContentLoaded', () => {
  console.log('Страница мастеров загружена');
  
  // Инициализация общих компонентов
  initTooltips();
  initPopovers();
  initLazyLoading();
  initSmoothScrolling();
  
  // Инициализация специфичных для страницы мастеров компонентов
  initMastersFilter();
  initMastersSearch();
  
  // Инициализация анимаций
  initAnimations();
});

/**
 * Инициализация фильтрации мастеров по специализации
 */
function initMastersFilter() {
  $('.masters-filter .filter-item').on('click', function() {
    const specialty = $(this).data('specialty');
    
    $('.masters-filter .filter-item').removeClass('active');
    $(this).addClass('active');
    
    if (specialty === 'all') {
      $('.master-card').fadeIn(300);
    } else {
      $('.master-card').hide();
      $(`.master-card[data-specialty="${specialty}"]`).fadeIn(300);
    }
  });
}

/**
 * Инициализация поиска мастеров
 */
function initMastersSearch() {
  $('#masters-search').on('input', function() {
    const searchValue = $(this).val().toLowerCase();
    
    $('.master-card').each(function() {
      const masterName = $(this).find('.master-name').text().toLowerCase();
      const masterSpecialty = $(this).find('.master-specialty').text().toLowerCase();
      
      if (masterName.includes(searchValue) || masterSpecialty.includes(searchValue)) {
        $(this).fadeIn(300);
      } else {
        $(this).hide();
      }
    });
  });
}

/**
 * Инициализация анимаций на странице мастеров
 */
function initAnimations() {
  // Анимация шапки при прокрутке
  $(window).scroll(function() {
    if ($(window).scrollTop() > 50) {
      $('.navbar').addClass('scrolled');
    } else {
      $('.navbar').removeClass('scrolled');
    }
  });
  
  // Анимация карточек мастеров при прокрутке
  function animateOnScroll() {
    $('.master-card').each(function() {
      if (isElementInViewport(this) && !$(this).hasClass('animated')) {
        $(this).addClass('animated').css({
          'animation': 'fadeInUp 0.6s forwards',
          'opacity': '0'
        });
      }
    });
  }
  
  // Определяем, находится ли элемент в области видимости
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom >= 0
    );
  }
  
  // Запускаем анимацию при загрузке и прокрутке
  animateOnScroll();
  $(window).on('scroll', animateOnScroll);
  
  // Добавляем стили для анимации
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .animated {
      animation-duration: 0.6s;
      animation-fill-mode: both;
    }
    
    .master-card {
      opacity: 0;
    }
    
    .master-card.animated {
      animation-delay: calc(var(--animation-order) * 0.1s);
    }
  `;
  document.head.appendChild(style);
  
  // Установка задержки для элементов
  $('.master-card').each(function(index) {
    $(this).css('--animation-order', index % 4);
  });
  
  // Мобильное меню
  $('.navbar-toggler').on('click', function() {
    $('body').toggleClass('menu-open');
  });
} 