// Скрипт для управления навигацией и меню
import $ from 'jquery';
import {isAuthenticated, getUserRole, isCustomer, isMaster, logout as userLogout, isAdmin} from './userUtils';

// Инициализация навигации
export function initNavigation() {
  // Обработчик события загрузки хедера
  document.addEventListener('headerLoaded', () => {
    updateNavigation();
  });
  
  // Также вызываем сразу на случай, если хедер уже загружен
  updateNavigation();
}

// Обновление навигации в зависимости от авторизации
function updateNavigation() {
  console.log('Обновление навигации...');
  
  if (isAuthenticated()) {
    console.log('Пользователь авторизован');
    // Пользователь авторизован
    $('.auth-required').show();
    $('.auth-not-required').hide();

    if (isAdmin()) {
      $('.admin-only').show();
    } else  {
      $('.admin-only').hide();
    }

    // Отображаем элементы в зависимости от роли пользователя
    if (isMaster()) {
      $('.master-only').show();
    } else {
      $('.master-only').hide();
    }
    
    // Скрываем кнопки входа и регистрации
    $('.login-btn, .signup-btn').parent('.nav-item').hide();
    
    // Скрываем ссылки "Главная" и "Мастерам"
    $('a.nav-link[href="/"]').parent('.nav-item').hide();
    $('a.nav-link[href="/masters"]').parent('.nav-item').hide();
    
    // Скрываем ссылки на услуги везде
    $('a.nav-link[href="/services"]').parent('.nav-item').hide();
    $('.btn[href="/services"]').hide();
    
    // Удаляем кнопку "Создать заказ", если она уже есть
    $('#createOrderNavItem').remove();
    
    // Удаляем кнопку "Мои заказы", если она уже есть
    $('#myOrdersNavItem').remove();
    
    // Если пользователь мастер или заказчик, добавляем кнопку "Мои заказы"
    if (isCustomer() || isMaster()) {
      const myOrdersItem = `
        <li class="nav-item" id="myOrdersNavItem">
          <a class="nav-link btn btn-outline-primary text-primary" href="/orders/my">
            <i class="bi bi-list-check me-1"></i> Мои заказы
          </a>
        </li>
      `;
      
      $('#navbarNav .navbar-nav').append(myOrdersItem);
    }
    
    // Добавляем кнопку "Создать заказ", если пользователь - заказчик
    if (isCustomer()) {
      const createOrderItem = `
        <li class="nav-item" id="createOrderNavItem">
          <a class="nav-link btn btn-primary text-white" href="/orders">
            <i class="bi bi-plus-circle me-1"></i> Создать заказ
          </a>
        </li>
      `;
      
      // Добавляем в навигацию перед элементом профиля
      if ($('#profileNavItem').length > 0) {
        $(createOrderItem).insertBefore('#profileNavItem');
      } else {
        $('#navbarNav .navbar-nav').append(createOrderItem);
      }
    }
    
    // Добавляем кнопку профиля и выхода, если их нет
    if ($('#profileNavItem').length === 0) {
      const profileItem = `
        <li class="nav-item dropdown" id="profileNavItem">
          <a class="nav-link dropdown-toggle" href="#" id="profileDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-person-circle me-1"></i> Профиль
          </a>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
            <li><a class="dropdown-item" href="/profile"><i class="bi bi-person me-2"></i>Мой профиль</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" id="logoutBtn"><i class="bi bi-box-arrow-right me-2"></i>Выйти</a></li>
          </ul>
        </li>
      `;
      
      // Добавляем в навигацию
      $('#navbarNav .navbar-nav').append(profileItem);
      
      // Обработчик для кнопки выхода
      $('#logoutBtn').on('click', function(e) {
        e.preventDefault();
        logout();
      });
    }
  } else {
    console.log('Пользователь не авторизован');
    // Пользователь не авторизован
    $('.auth-required').hide();
    $('.auth-not-required').show();
    $('.master-only').hide();
    
    // Показываем кнопки входа и регистрации
    $('.login-btn, .signup-btn').parent('.nav-item').show();
    
    // Показываем ссылки "Главная" и "Мастерам"
    $('a.nav-link[href="/"]').parent('.nav-item').show();
    $('a.nav-link[href="/masters"]').parent('.nav-item').show();
    
    // Скрываем ссылки на услуги везде
    $('a.nav-link[href="/services"]').parent('.nav-item').hide();
    $('.btn[href="/services"]').hide();
    
    // Удаляем кнопку "Создать заказ", если она есть
    $('#createOrderNavItem').remove();
    
    // Удаляем кнопку "Мои заказы", если она есть
    $('#myOrdersNavItem').remove();
    
    // Удаляем кнопку профиля, если она есть
    $('#profileNavItem').remove();
  }
}

// Функция выхода из системы
function logout() {
  userLogout();
  
  // Обновляем навигацию
  updateNavigation();
} 