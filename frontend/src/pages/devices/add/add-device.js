import '../../../styles/main.scss';
import $ from 'jquery';
import { loadHeader } from '@scripts/common';
import { initNavigation } from '@scripts/navigation';
import { isAuthenticated, isAdmin, isMaster } from '@scripts/userUtils';
import API_CONFIG from '../../../../api.config';

// Инициализация страницы
$(document).ready(function() {
    // Проверяем авторизацию и права доступа
    if (!isAuthenticated()) {
        window.location.href = '/login';
        return;
    }
    
    // Только мастера и администраторы могут добавлять устройства
    if (!isAdmin() && !isMaster()) {
        window.location.href = '/devices';
        return;
    }
    
    // Загружаем хедер
    loadHeader();
    
    // Инициализируем навигацию
    initNavigation();
    
    // Загружаем типы устройств
    loadDeviceTypes();
    
    // Инициализируем валидацию формы
    initFormValidation();
    
    // Обработчик отправки формы
    $('#add-device-form').on('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitForm();
        }
    });
    
    // Обработчик кнопки "Добавить еще устройство"
    $('#add-another-device').on('click', function(e) {
        e.preventDefault();
        resetForm();
    });
    
    // Обработчик кнопки "Попробовать снова"
    $('#try-again-btn').on('click', function(e) {
        e.preventDefault();
        hideErrorMessage();
        $('#add-device-form').show();
    });
});

// Загрузка типов устройств
function loadDeviceTypes() {
    $.ajax({
        url: API_CONFIG.getApiUrl('/devices/types'),
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
        },
        success: function(response) {
            populateDeviceTypeSelect(response);
        },
        error: function(xhr) {
            console.error('Ошибка при загрузке типов устройств:', xhr);
            showErrorMessage('Не удалось загрузить типы устройств. Пожалуйста, обновите страницу.');
        }
    });
}

// Заполнение выпадающего списка типов устройств
function populateDeviceTypeSelect(deviceTypes) {
    const select = $('#deviceType');
    
    // Очищаем текущие опции, кроме первой
    select.find('option:not(:first)').remove();
    
    // Добавляем типы устройств
    deviceTypes.forEach(type => {
        const option = $('<option></option>')
            .attr('value', type)
            .text(formatDeviceType(type));
        
        select.append(option);
    });
}

// Форматирование типа устройства для отображения
function formatDeviceType(type) {
    // Преобразование SMARTPHONE в "Смартфон" и т.д.
    const typeMap = {
        'SMARTPHONE': 'Смартфон',
        'TABLET': 'Планшет',
        'COMPUTER': 'Компьютер',
        'LAPTOP': 'Ноутбук',
        'SMART_DEVICE': 'Умное устройство',
        'NETWORK_EQUIPMENT': 'Сетевое оборудование',
        'INDUSTRIAL_EQUIPMENT': 'Промышленное оборудование',
        'AUTOMOTIVE_ELECTRONICS': 'Автомобильная электроника',
        'SPECIALIZED_EQUIPMENT': 'Специализированное оборудование'
    };
    
    return typeMap[type] || type;
}

// Инициализация валидации формы
function initFormValidation() {
    // Добавляем обработчики для проверки полей при потере фокуса
    $('#deviceName').on('blur', function() {
        validateField($(this));
    });
    
    $('#manufacturer').on('blur', function() {
        validateField($(this));
    });
    
    $('#deviceType').on('change', function() {
        validateField($(this));
    });
}

// Валидация отдельного поля
function validateField(field) {
    const isValid = field.val().trim() !== '';
    
    if (!isValid) {
        field.addClass('is-invalid');
        return false;
    } else {
        field.removeClass('is-invalid').addClass('is-valid');
        return true;
    }
}

// Валидация всей формы
function validateForm() {
    let isValid = true;
    
    // Проверяем каждое обязательное поле
    isValid = validateField($('#deviceName')) && isValid;
    isValid = validateField($('#manufacturer')) && isValid;
    isValid = validateField($('#deviceType')) && isValid;
    
    return isValid;
}

// Отправка формы на сервер
function submitForm() {
    // Показываем индикатор загрузки
    showLoadingIndicator();
    
    // Формируем данные
    const deviceData = {
        name: $('#deviceName').val().trim(),
        manufacturer: $('#manufacturer').val().trim(),
        type: $('#deviceType').val()
    };
    
    // Отправляем запрос
    $.ajax({
        url: API_CONFIG.getApiUrl('/devices'),
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(deviceData),
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
        },
        success: function(response) {
            console.log('Устройство успешно добавлено:', response);
            hideLoadingIndicator();
            showSuccessMessage();
        },
        error: function(xhr) {
            console.error('Ошибка при добавлении устройства:', xhr);
            hideLoadingIndicator();
            
            let errorMsg = 'Произошла ошибка при добавлении устройства.';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMsg += ' ' + xhr.responseJSON.message;
            }
            
            showErrorMessage(errorMsg);
        }
    });
}

// Сброс формы
function resetForm() {
    // Очищаем поля
    $('#deviceName').val('').removeClass('is-valid is-invalid');
    $('#manufacturer').val('').removeClass('is-valid is-invalid');
    $('#deviceType').val('').removeClass('is-valid is-invalid');
    
    // Скрываем сообщения
    hideSuccessMessage();
    hideErrorMessage();
    
    // Показываем форму снова
    $('#add-device-form').show();
    
    // Устанавливаем фокус на первое поле
    $('#deviceName').focus();
}

// Показать индикатор загрузки
function showLoadingIndicator() {
    $('#add-device-form').hide();
    $('#loading-indicator').removeClass('d-none');
}

// Скрыть индикатор загрузки
function hideLoadingIndicator() {
    $('#loading-indicator').addClass('d-none');
}

// Показать сообщение об успехе
function showSuccessMessage() {
    $('#success-message').removeClass('d-none');
}

// Скрыть сообщение об успехе
function hideSuccessMessage() {
    $('#success-message').addClass('d-none');
}

// Показать сообщение об ошибке
function showErrorMessage(message) {
    $('#error-message').removeClass('d-none');
    
    if (message) {
        $('#error-message span').text(message);
    }
}

// Скрыть сообщение об ошибке
function hideErrorMessage() {
    $('#error-message').addClass('d-none');
} 