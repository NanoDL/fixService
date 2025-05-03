// JavaScript для страницы выбора типа регистрации
import '../../styles/main.scss';
import $ from 'jquery';
import {initTooltips, initPopovers, loadHeader} from '../../scripts/common.js';
import {initNavigation} from "@scripts/navigation";

document.addEventListener('DOMContentLoaded', () => {
  console.log('Страница выбора типа регистрации загружена');
  
  // Загружаем шапку сайта
  loadHeader();
  
  // Инициализация компонентов Bootstrap
  initTooltips();
  initPopovers();
  
  // Инициализация навигации
  initNavigation();
  
  // Добавляем класс активной страницы для кнопки регистрации в шапке
  document.querySelectorAll('.nav-link.signup-btn').forEach(link => {
    link.classList.add('signup-page-active');
  });
  
  // Анимация шапки при прокрутке
  $(window).scroll(function() {
    if ($(window).scrollTop() > 50) {
      $('.navbar').addClass('scrolled');
    } else {
      $('.navbar').removeClass('scrolled');
    }
  });
  
  // Анимация карточек выбора типа регистрации
  animateRegistrationCards();
});

// Анимация карточек с выбором типа регистрации
function animateRegistrationCards() {
  const cards = document.querySelectorAll('.registration-option-card');
  
  // Добавление класса для карточек с задержкой
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('animate__animated', 'animate__fadeInUp');
    }, 200 * index);
  });
  
  // Анимация при наведении
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.querySelector('.card-icon i').classList.add('animate__animated', 'animate__heartBeat');
    });
    
    card.addEventListener('mouseleave', function() {
      this.querySelector('.card-icon i').classList.remove('animate__animated', 'animate__heartBeat');
    });
  });
} 