// JavaScript для страницы регистрации мастера
import '../../../styles/main.scss';
import $ from 'jquery';
import {initTooltips, initPopovers, loadHeader} from '../../../scripts/common.js';
import Inputmask from 'inputmask';
import {initNavigation} from "@scripts/navigation";
import API_CONFIG from "../../../../api.config";

document.addEventListener('DOMContentLoaded', () => {
  console.log('Страница регистрации мастера загружена');
  loadHeader();
  // Инициализация компонентов Bootstrap
  initTooltips();
  initPopovers();
  
  // Инициализация масок для ввода
  initInputMasks();
  
  // Инициализация многошаговой формы
  initMultiStepForm();
  
  // Инициализация проверки сложности пароля
  initPasswordStrengthMeter();
  
  // Инициализация переключателя видимости пароля
  initPasswordToggle();
  
  // Валидация формы
  initFormValidation();
  initNavigation(); // Инициализация навигации
  // Анимация шапки при прокрутке
  $(window).scroll(function() {
    if ($(window).scrollTop() > 50) {
      $('.navbar').addClass('scrolled');
    } else {
      $('.navbar').removeClass('scrolled');
    }
  });
  
  // Анимация секций формы при прокрутке
  animateFormSections();
  
  // Инициализация прогресс-бара опыта работы
  initExperienceProgress();
});

// Функция для инициализации масок ввода
function initInputMasks() {
  // Маска для телефона
  const phoneInput = document.getElementById('phoneNumber');
  if (phoneInput) {
    Inputmask({
      mask: '+7 (999) 999-99-99',
      showMaskOnHover: true,
      showMaskOnFocus: true,
      jitMasking: true
    }).mask(phoneInput);
  }
}

// Инициализация многошаговой формы
function initMultiStepForm() {
  const formSections = document.querySelectorAll('.form-section');
  const progressBar = document.querySelector('.progress-bar');
  const progressSteps = document.querySelectorAll('.progress-step');
  
  // Обработчики для кнопок "Далее"
  document.querySelectorAll('.next-step').forEach(button => {
    button.addEventListener('click', function() {
      const currentSection = this.closest('.form-section');
      const nextSectionId = this.getAttribute('data-next');
      const nextSection = document.getElementById(nextSectionId);
      
      // Проверяем валидность текущей секции
      let isValid = true;
      const inputs = currentSection.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        if (!validateInput(input)) {
          isValid = false;
        }
      });
      
      if (isValid) {
        // Скрываем текущую секцию
        currentSection.classList.add('d-none');
        
        // Показываем следующую секцию
        nextSection.classList.remove('d-none');
        
        // Обновляем индикатор прогресса
        updateProgressBar(nextSectionId);
        
        // Прокручиваем страницу вверх
        window.scrollTo({
          top: document.querySelector('.registration-card').offsetTop - 100,
          behavior: 'smooth'
        });
      } else {
        // Прокрутка к первому полю с ошибкой
        const firstError = currentSection.querySelector('.is-invalid');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstError.focus();
        }
      }
    });
  });
  
  // Обработчики для кнопок "Назад"
  document.querySelectorAll('.prev-step').forEach(button => {
    button.addEventListener('click', function() {
      const currentSection = this.closest('.form-section');
      const prevSectionId = this.getAttribute('data-prev');
      const prevSection = document.getElementById(prevSectionId);
      
      // Скрываем текущую секцию
      currentSection.classList.add('d-none');
      
      // Показываем предыдущую секцию
      prevSection.classList.remove('d-none');
      
      // Обновляем индикатор прогресса
      updateProgressBar(prevSectionId);
      
      // Прокручиваем страницу вверх
      window.scrollTo({
        top: document.querySelector('.registration-card').offsetTop - 100,
        behavior: 'smooth'
      });
    });
  });
  
  // Функция обновления индикатора прогресса
  function updateProgressBar(sectionId) {
    let progress = 0;
    let activeIndex = 0;
    
    switch (sectionId) {
      case 'personal-section':
        progress = 0;
        activeIndex = 0;
        break;
      case 'professional-section':
        progress = 50;
        activeIndex = 1;
        break;
      case 'final-section':
        progress = 100;
        activeIndex = 2;
        break;
    }
    
    // Обновляем прогресс-бар
    progressBar.style.width = progress + '%';
    progressBar.setAttribute('aria-valuenow', progress);
    
    // Обновляем статусы шагов
    progressSteps.forEach((step, index) => {
      step.classList.remove('active', 'completed');
      
      if (index === activeIndex) {
        step.classList.add('active');
      } else if (index < activeIndex) {
        step.classList.add('completed');
      }
    });
  }
}

// Инициализация проверки сложности пароля
function initPasswordStrengthMeter() {
  const passwordInput = document.getElementById('password');
  
  if (passwordInput) {
    passwordInput.addEventListener('input', function() {
      const password = this.value;
      // Здесь можно добавить логику для проверки сложности пароля
      if (password.length < 6) {
        setInvalidFeedback(passwordInput, 'Пароль должен содержать минимум 6 символов');
      } else {
        clearInvalidFeedback(passwordInput);
      }
    });
  }
}

// Инициализация переключателя видимости пароля
function initPasswordToggle() {
  document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
      const passwordInput = this.previousElementSibling;
      const icon = this.querySelector('i');
      
      // Переключаем тип поля
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
      } else {
        passwordInput.type = 'password';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
      }
    });
  });
}

// Функция валидации формы
function initFormValidation() {
  const form = document.getElementById('master-registration-form');
  
  if (form) {
    const formInputs = form.querySelectorAll('input, select, textarea');
    
    // Добавление слушателей событий для всех полей формы
    formInputs.forEach(input => {
      // Проверка при потере фокуса
      input.addEventListener('blur', function() {
        validateInput(this);
      });
      
      // Удаление ошибки при вводе
      input.addEventListener('input', function() {
        if (this.classList.contains('is-invalid')) {
          this.classList.remove('is-invalid');
          const feedbackElement = this.nextElementSibling;
          if (feedbackElement && feedbackElement.classList.contains('invalid-feedback')) {
            feedbackElement.remove();
          }
        }
      });
    });
    
    // Валидация пароля и подтверждения пароля
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('passwordConfirm');
    
    if (passwordInput && passwordConfirmInput) {
      passwordConfirmInput.addEventListener('blur', function() {
        if (passwordInput.value !== passwordConfirmInput.value) {
          setInvalidFeedback(passwordConfirmInput, 'Пароли не совпадают');
        }
      });
      
      passwordInput.addEventListener('input', function() {
        if (passwordConfirmInput.value && passwordInput.value !== passwordConfirmInput.value) {
          setInvalidFeedback(passwordConfirmInput, 'Пароли не совпадают');
        } else if (passwordConfirmInput.value && passwordInput.value === passwordConfirmInput.value) {
          clearInvalidFeedback(passwordConfirmInput);
        }
      });
      
      passwordConfirmInput.addEventListener('input', function() {
        if (passwordInput.value !== passwordConfirmInput.value) {
          setInvalidFeedback(passwordConfirmInput, 'Пароли не совпадают');
        } else {
          clearInvalidFeedback(passwordConfirmInput);
        }
      });
    }
    
    // Обработка отправки формы
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      let isValid = true;
      
      // Проверка всех полей перед отправкой
      formInputs.forEach(input => {
        if (!validateInput(input)) {
          isValid = false;
        }
      });
      
      if (isValid) {
        // Показываем индикатор загрузки
        showLoadingIndicator();
        
        // Отправляем форму с задержкой для демонстрации загрузки
        setTimeout(() => {
          submitForm();
        }, 1500);
      } else {
        // Прокрутка к первому полю с ошибкой
        const firstError = form.querySelector('.is-invalid');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstError.focus();
        }
      }
    });
  }
}

// Функция валидации отдельного поля
function validateInput(input) {
  // Пропускаем скрытые поля и некоторые типы полей
  if (input.type === 'checkbox' || input.type === 'radio' || input.type === 'button' || input.type === 'submit' || input.hidden) {
    if (input.type === 'checkbox' && input.required && !input.checked) {
      setInvalidFeedback(input, 'Необходимо согласие');
      return false;
    }
    return true;
  }
  
  // Проверка обязательного поля
  if (input.required && !input.value.trim()) {
    setInvalidFeedback(input, 'Это поле обязательно для заполнения');
    return false;
  }
  
  // Специфические проверки для различных полей
  if (input.id === 'email' && input.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.value)) {
      setInvalidFeedback(input, 'Введите корректный email адрес');
      return false;
    }
  }
  
  if (input.id === 'username' && input.value) {
    if (input.value.length < 3) {
      setInvalidFeedback(input, 'Логин должен содержать минимум 3 символа');
      return false;
    }
    if (input.value.length > 50) {
      setInvalidFeedback(input, 'Логин должен содержать максимум 50 символов');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(input.value)) {
      setInvalidFeedback(input, 'Логин должен содержать только латинские буквы, цифры и символ подчеркивания');
      return false;
    }
  }
  
  if (input.id === 'password' && input.value) {
    if (input.value.length < 6) {
      setInvalidFeedback(input, 'Пароль должен содержать минимум 6 символов');
      return false;
    }
  }
  
  if (input.id === 'phoneNumber' && input.value) {
    // Проверяем, что введены все цифры (используем Inputmask)
    const unmaskedValue = input.inputmask ? input.inputmask.unmaskedvalue() : input.value.replace(/\D/g, '');
    if (unmaskedValue.length < 10) {
      setInvalidFeedback(input, 'Введите полный номер телефона');
      return false;
    }
  }
  
  if (input.id === 'experienceYears' && input.value) {
    const value = parseInt(input.value);
    if (isNaN(value) || value < 0) {
      setInvalidFeedback(input, 'Опыт работы не может быть отрицательным');
      return false;
    }
  }
  
  if (input.id === 'price' && input.value) {
    const value = parseFloat(input.value);
    if (isNaN(value) || value < 0) {
      setInvalidFeedback(input, 'Цена не может быть отрицательной');
      return false;
    }
  }
  
  if (input.id === 'description' && input.value) {
    if (input.value.length > 1000) {
      setInvalidFeedback(input, 'Описание не должно превышать 1000 символов');
      return false;
    }
  }
  
  return true;
}

// Установить сообщение об ошибке для поля
function setInvalidFeedback(input, message) {
  // Удаление предыдущего сообщения об ошибке
  clearInvalidFeedback(input);
  
  // Добавление нового сообщения
  input.classList.add('is-invalid');
  const feedback = document.createElement('div');
  feedback.className = 'invalid-feedback';
  feedback.textContent = message;
  
  if (input.type === 'checkbox' || input.type === 'radio') {
    input.parentNode.appendChild(feedback);
  } else {
    input.parentNode.insertBefore(feedback, input.nextSibling);
  }
}

// Очистить сообщение об ошибке
function clearInvalidFeedback(input) {
  input.classList.remove('is-invalid');
  let parent = input.parentNode;
  if (input.type === 'checkbox' || input.type === 'radio') {
    const feedback = parent.querySelector('.invalid-feedback');
    if (feedback) feedback.remove();
  } else {
    const feedback = input.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
      feedback.remove();
    }
  }
}

// Показать индикатор загрузки
function showLoadingIndicator() {
  const submitBtn = document.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Регистрация...';
  }
}

// Анимация секций формы при прокрутке
function animateFormSections() {
  const formSections = document.querySelectorAll('.form-section');
  
  formSections.forEach(section => {
    // Применяем анимацию только к видимой первой секции
    if (!section.classList.contains('d-none')) {
      section.style.opacity = '0';
      section.style.transform = 'translateY(20px)';
      section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      
      setTimeout(() => {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
      }, 300);
    }
  });
}

// Инициализация прогресс-бара опыта работы
function initExperienceProgress() {
  const experienceInput = document.getElementById('experienceYears');
  if (experienceInput) {
    // Создаем элементы прогресс-бара
    const progressWrapper = document.createElement('div');
    progressWrapper.className = 'experience-progress mt-2';
    progressWrapper.innerHTML = `
      <div class="progress" style="height: 10px;">
        <div class="progress-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
      <div class="d-flex justify-content-between mt-1">
        <small class="text-muted">Начинающий</small>
        <small class="text-muted">Опытный</small>
        <small class="text-muted">Эксперт</small>
      </div>
    `;
    
    experienceInput.parentNode.appendChild(progressWrapper);
    
    const progressBar = progressWrapper.querySelector('.progress-bar');
    
    // Обновляем прогресс при изменении значения
    function updateProgress() {
      const value = parseInt(experienceInput.value) || 0;
      let width = 0;
      let label = '';
      
      if (value <= 0) {
        width = 0;
        label = 'Начинающий';
        progressBar.className = 'progress-bar bg-secondary';
      } else if (value < 3) {
        width = value * 10;
        label = 'Начинающий';
        progressBar.className = 'progress-bar bg-info';
      } else if (value < 7) {
        width = 30 + (value - 3) * 10;
        label = 'Опытный';
        progressBar.className = 'progress-bar bg-primary';
      } else {
        width = 70 + (Math.min(value, 10) - 7) * 10;
        label = 'Эксперт';
        progressBar.className = 'progress-bar bg-success';
      }
      
      progressBar.style.width = width + '%';
      progressBar.setAttribute('aria-valuenow', width);
      progressBar.textContent = label;
    }
    
    // Инициализация и обработчик событий
    updateProgress();
    experienceInput.addEventListener('input', updateProgress);
  }
}

// Функция отправки формы
function submitForm() {
  const form = document.getElementById('master-registration-form');
  const formData = new FormData(form);
  const formDataObj = {};
  
  formData.forEach((value, key) => {
    formDataObj[key] = value;
  });
  
  // Преобразование данных в соответствии с API и DTO
  const apiData = {
    username: formDataObj.username,
    password: formDataObj.password,
    email: formDataObj.email,
    name: formDataObj.name,
    address: formDataObj.address,
    phoneNumber: formDataObj.phoneNumber,
    specialization: formDataObj.specialization,
    experienceYears: parseInt(formDataObj.experienceYears) || 0,
    price: parseFloat(formDataObj.price) || 0,
    description: formDataObj.description || ''
  };
  
  console.log('Отправка данных на сервер:', apiData);
  
  // Отправка данных на сервер
  fetch(API_CONFIG.getApiUrl('/auth/register/master'), {
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
    
    // Восстановление кнопки отправки
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Отправить заявку';
    }
  });
}

// Показать сообщение об успешной регистрации
function showSuccessMessage() {
  const form = document.getElementById('master-registration-form');
  
  // Создаем контейнер для анимированного сообщения
  const successContainer = document.createElement('div');
  successContainer.className = 'text-center mt-4 animated-message';
  successContainer.innerHTML = `
    <div class="success-icon mb-3">
      <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
    </div>
    <h3 class="text-success mb-3">Регистрация успешно завершена!</h3>
    <p class="mb-3">Ваша заявка на регистрацию принята. После проверки данных вы получите доступ к личному кабинету.</p>
    <div class="progress mt-3" style="height: 10px;">
      <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 0%"></div>
    </div>
  `;
  
  // Добавляем в DOM
  form.innerHTML = '';
  form.appendChild(successContainer);
  
  // Анимация прогресс-бара
  const progressBar = successContainer.querySelector('.progress-bar');
  let width = 0;
  const interval = setInterval(() => {
    width += 5;
    progressBar.style.width = width + '%';
    if (width >= 100) {
      clearInterval(interval);
    }
  }, 100);
}

// Показать сообщение об ошибке
function showErrorMessage(message) {
  // Удаляем существующие сообщения об ошибках
  const existingAlerts = document.querySelectorAll('.alert-danger');
  existingAlerts.forEach(alert => alert.remove());
  
  const form = document.getElementById('master-registration-form');
  const errorMessage = document.createElement('div');
  
  errorMessage.className = 'alert alert-danger mt-3 d-flex align-items-center';
  errorMessage.innerHTML = `
    <i class="bi bi-exclamation-triangle-fill me-2" style="font-size: 1.5rem;"></i>
    <div>
      <strong>Ошибка при регистрации:</strong> ${message}
    </div>
  `;
  
  // Анимация появления
  errorMessage.style.opacity = '0';
  form.insertBefore(errorMessage, form.firstChild);
  
  setTimeout(() => {
    errorMessage.style.transition = 'opacity 0.5s ease';
    errorMessage.style.opacity = '1';
  }, 10);
  
  // Автоматическое скрытие ошибки через 10 секунд
  setTimeout(() => {
    errorMessage.style.opacity = '0';
    setTimeout(() => {
      errorMessage.remove();
    }, 500);
  }, 10000);
} 