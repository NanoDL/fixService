import '../../styles/main.scss';
import $ from 'jquery';
import { initTooltips, initPopovers, loadHeader } from '../../scripts/common.js';
import { initNavigation } from "@scripts/navigation";
import API_CONFIG from "../../../api.config";

document.addEventListener('DOMContentLoaded', () => {
    console.log('Страница входа загружена');
    
    // Загружаем хедер
    loadHeader();
    
    // Проверяем, существует ли форма
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('Форма логина найдена:', loginForm);
    } else {
        console.error('Форма логина не найдена! ID формы должен быть "loginForm"');
    }
    
    // Инициализация компонентов Bootstrap
    initTooltips();
    initPopovers();
    
    // Инициализация валидации формы
    initFormValidation();
    
    // Инициализация переключателя видимости пароля
    initPasswordToggle();
    
    // Инициализация навигации
    initNavigation();
    
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
    const form = document.getElementById('loginForm');
    
    if (form) {
        const formInputs = form.querySelectorAll('input');
        
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
                
                // Отправляем форму
                submitForm();
            } else {
                // Прокрутка к первому полю с ошибкой
                const firstError = form.querySelector('.is-invalid');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
            }
        });
    } else {
        console.error('Форма с id "loginForm" не найдена!');
    }
}

// Функция валидации отдельного поля
function validateInput(input) {
    // Пропускаем кнопки
    if (input.type === 'button' || input.type === 'submit') {
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
    
    if (input.id === 'password' && input.value) {
        if (input.value.length < 6) {
            setInvalidFeedback(input, 'Пароль должен содержать минимум 6 символов');
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
    input.parentNode.insertBefore(feedback, input.nextSibling);
}

// Очистить сообщение об ошибке
function clearInvalidFeedback(input) {
    input.classList.remove('is-invalid');
    const feedback = input.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.remove();
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

// Показать индикатор загрузки
function showLoadingIndicator() {
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Вход...';
    } else {
        console.error('Кнопка отправки формы не найдена!');
    }
}

// Функция отправки формы
function submitForm() {
    console.log("Отправка формы...");

    const form = document.getElementById('loginForm');
    if (!form) {
        console.error('Форма с id "loginForm" не найдена!');
        return;
    }

    const formData = new FormData(form);
    const formDataObj = {};
    
    formData.forEach((value, key) => {
        formDataObj[key] = value;
    });
    
    console.log("Данные формы:", formDataObj);
    
    // Отправка данных на сервер
    fetch(API_CONFIG.getApiUrl('/auth/login'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formDataObj)
    })
    .then(response => {
        console.log("Получен ответ от сервера:", response);
        if (!response.ok) {
            throw new Error('Ошибка при входе');
        }
        return response.json();
    })
    .then(data => {
        console.log('Успешный вход:', data);
        
        // Сохраняем токен
        if (data['jwt-token']) {
            localStorage.setItem('jwt-token', data['jwt-token']);
        }
        
        // Перенаправление на страницу профиля
        showSuccessMessage();
        setTimeout(() => {
            window.location.href = data.redirect || '/profile';
        }, 2000);
    })
    .catch(error => {
        console.error('Ошибка:', error);
        showErrorMessage(error.message);
        
        // Восстановление кнопки отправки
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Войти';
        }
    });
}

// Показать сообщение об успешном входе
function showSuccessMessage() {
    const form = document.getElementById('loginForm');
    if (!form) {
        console.error('Форма с id "loginForm" не найдена!');
        return;
    }
    
    // Создаем контейнер для анимированного сообщения
    const successContainer = document.createElement('div');
    successContainer.className = 'text-center mt-4 animated-message';
    successContainer.innerHTML = `
        <div class="success-icon mb-3">
            <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
        </div>
        <h3 class="text-success mb-3">Вход выполнен успешно!</h3>
        <p class="mb-3">Перенаправление на страницу профиля...</p>
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
    
    const form = document.getElementById('loginForm');
    if (!form) {
        console.error('Форма с id "loginForm" не найдена!');
        return;
    }
    
    const errorMessage = document.createElement('div');
    
    errorMessage.className = 'alert alert-danger mt-3 d-flex align-items-center';
    errorMessage.innerHTML = `
        <i class="bi bi-exclamation-triangle-fill me-2" style="font-size: 1.5rem;"></i>
        <div>
            <strong>Ошибка при входе:</strong> ${message}
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