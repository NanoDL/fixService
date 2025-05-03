// Главный входной файл
import './styles/main.scss';
import $ from 'jquery';
import { initTooltips, initPopovers, initLazyLoading, initSmoothScrolling, loadHeader } from './scripts/common.js';
import { initProfile } from './scripts/profile.js';
import { initNavigation } from './scripts/navigation.js';

// Добавляем обработчик событий для отладки
document.addEventListener('headerLoaded', () => {
  console.log('Событие headerLoaded сработало');
});

// Инициализация общих компонентов при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM загружен, начинаем инициализацию компонентов');
  
  // Загрузка хедера
  loadHeader();
  
  // Инициализация общих компонентов
  initTooltips();
  initPopovers();
  initLazyLoading();
  initSmoothScrolling();
  initNavigation(); // Инициализация навигации
  
  // Ждем загрузки документа
  $(document).ready(function() {
    console.log('jQuery ready сработал');
    // Анимация шапки при прокрутке
    $(window).scroll(function() {
      if ($(window).scrollTop() > 50) {
        $('.navbar').addClass('scrolled');
      } else {
        $('.navbar').removeClass('scrolled');
      }
    });
    
    // Плавная прокрутка к якорям
    $('a[href^="#"]').on('click', function(e) {
      e.preventDefault();
      
      const target = $(this.hash);
      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top - 80
        }, 500);
      }
    });
    
    // Анимация счетчиков в блоке статистики
    function animateStats() {
      const statsSection = $('.stats-section');
      if (statsSection.length && isElementInViewport(statsSection[0])) {
        $('.stat-number').each(function() {
          const $this = $(this);
          const count = parseInt($this.data('count'), 10);
          
          if (!$this.hasClass('counted')) {
            $({ countNum: 0 }).animate({ countNum: count }, {
              duration: 2000,
              easing: 'swing',
              step: function() {
                const formattedNum = Math.floor(this.countNum).toLocaleString();
                $this.text(formattedNum + ($this.text().includes('%') ? '%' : '+'));
              },
              complete: function() {
                const formattedNum = count.toLocaleString();
                $this.text(formattedNum + ($this.text().includes('%') ? '%' : '+'));
                $this.addClass('counted');
              }
            });
          }
        });
      }
    }
    
    // Определяем, находится ли элемент в области видимости
    function isElementInViewport(el) {
      const rect = el.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
      );
    }
    
    // Запуск анимации при прокрутке
    $(window).on('scroll', function() {
      animateStats();
    });
    
    // Инициализация слайдера отзывов
    initReviewsSlider();
    
    // Функция для работы со слайдером отзывов
    function initReviewsSlider() {
      const slider = $('.reviews-slider');
      
      if (slider.length) {
        let isDown = false;
        let startX;
        let scrollLeft;
        
        slider.on('mousedown', function(e) {
          isDown = true;
          slider.addClass('active');
          startX = e.pageX - slider.offset().left;
          scrollLeft = slider.scrollLeft();
        });
        
        slider.on('mouseleave mouseup', function() {
          isDown = false;
          slider.removeClass('active');
        });
        
        slider.on('mousemove', function(e) {
          if (!isDown) return;
          e.preventDefault();
          const x = e.pageX - slider.offset().left;
          const walk = (x - startX) * 2;
          slider.scrollLeft(scrollLeft - walk);
        });
      }
    }
    
    // Добавляем анимацию появления для карточек при прокрутке
    function animateOnScroll() {
      $('.process-card, .firmware-card, .review-card, .parts-category').each(function() {
        if (isElementInViewport(this) && !$(this).hasClass('animated')) {
          $(this).addClass('animated').css({
            'animation': 'fadeInUp 0.6s forwards',
            'opacity': '0'
          });
        }
      });
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
      
      .process-card, .firmware-card, .review-card, .parts-category {
        opacity: 0;
      }
      
      .process-card.animated, .firmware-card.animated, .review-card.animated, .parts-category.animated {
        animation-delay: calc(var(--animation-order) * 0.1s);
      }
    `;
    document.head.appendChild(style);
    
    // Установка задержки для элементов
    $('.process-card, .firmware-card, .review-card, .parts-category').each(function(index) {
      $(this).css('--animation-order', index % 4);
    });
    
    // Мобильное меню
    $('.navbar-toggler').on('click', function() {
      $('body').toggleClass('menu-open');
    });
    
    // Запускаем все анимации
    animateStats();
  });
}); 