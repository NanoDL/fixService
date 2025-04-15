// JavaScript для страницы регистрации мастера
import '../../../styles/main.scss';
import $ from 'jquery';
import { initTooltips, initPopovers } from '../../../scripts/common.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Страница регистрации мастера загружена');
  
  // Инициализация компонентов Bootstrap
  initTooltips();
  initPopovers();
  
  // Валидация формы
  initFormValidation();
  
  // Анимация шапки при прокрутке
  $(window).scroll(function() {
    if ($(window).scrollTop() > 50) {
      $('.navbar').addClass('scrolled');
    } else {
      $('.navbar').removeClass('scrolled');
    }
  });
});

// Функция валидации формы
function initFormValidation() {
  const form = document.getElementById('master-registration-form');
  
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (validateForm()) {
        submitForm();
      }
    });
  }
  
  // Валидация подтверждения пароля
  const passwordInput = document.getElementById('password');
  const passwordConfirmInput = document.getElementById('passwordConfirm');
  
  if (passwordConfirmInput) {
    passwordConfirmInput.addEventListener('input', function() {
      if (passwordInput.value !== passwordConfirmInput.value) {
        passwordConfirmInput.setCustomValidity('Пароли не совпадают');
      } else {
        passwordConfirmInput.setCustomValidity('');
      }
    });
  }
}

// Функция проверки валидности формы
function validateForm() {
  const form = document.getElementById('master-registration-form');
  
  if (!form.checkValidity()) {
    // Подсветить невалидные поля
    Array.from(form.elements).forEach(input => {
      if (!input.checkValidity() && input.required) {
        input.classList.add('is-invalid');
        
        input.addEventListener('input', function() {
          if (input.checkValidity()) {
            input.classList.remove('is-invalid');
          }
        });
      }
    });
    
    return false;
  }
  
  return true;
}

// Функция отправки формы
function submitForm() {
  const form = document.getElementById('master-registration-form');
  const formData = new FormData(form);
  const formDataObj = {};
  
  formData.forEach((value, key) => {
    // Обработка массивов (чекбоксы)
    if (key === 'additionalSpecializations') {
      if (!formDataObj[key]) {
        formDataObj[key] = [];
      }
      formDataObj[key].push(value);
    } else {
      formDataObj[key] = value;
    }
  });
  
  // Преобразование данных в соответствии с API
  const apiData = {
    username: formDataObj.username,
    password: formDataObj.password,
    firstName: formDataObj.firstName,
    lastName: formDataObj.lastName,
    phone: formDataObj.phone,
    email: formDataObj.email,
    address: formDataObj.address || '',
    specialization: formDataObj.specialization,
    additionalSpecializations: formDataObj.additionalSpecializations || [],
    experience: formDataObj.experience,
    about: formDataObj.about || '',
    passport: formDataObj.passport,
    inn: formDataObj.inn || ''
  };
  
  console.log('Отправка данных на сервер:', apiData);
  
  // Отправка данных на сервер
  fetch('/api/auth/register/master', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(apiData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Ошибка при регистрации');
    }
    return response.json();
  })
  .then(data => {
    console.log('Успешная регистрация:', data);
    
    // Сохраняем токен
    if (data['jwt-token']) {
      localStorage.setItem('jwt-token', data['jwt-token']);
    }
    
    // Перенаправление на страницу профиля
    showSuccessMessage();
    setTimeout(() => {
      window.location.href = '/profile/master';
    }, 2000);
  })
  .catch(error => {
    console.error('Ошибка:', error);
    showErrorMessage(error.message);
  });
}

// Показать сообщение об успешной регистрации
function showSuccessMessage() {
  const form = document.getElementById('master-registration-form');
  const successMessage = document.createElement('div');
  
  successMessage.className = 'alert alert-success mt-3';
  successMessage.textContent = 'Регистрация успешно завершена. Перенаправление...';
  
  form.appendChild(successMessage);
}

// Показать сообщение об ошибке
function showErrorMessage(message) {
  const form = document.getElementById('master-registration-form');
  const errorMessage = document.createElement('div');
  
  errorMessage.className = 'alert alert-danger mt-3';
  errorMessage.textContent = 'Ошибка при регистрации: ' + message;
  
  form.appendChild(errorMessage);
} 