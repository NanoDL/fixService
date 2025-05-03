import '../../styles/main.scss';
import '../../styles/pages/create-order.scss';
import $ from 'jquery';
import { loadHeader } from '@scripts/common';
import { initNavigation } from '@scripts/navigation';
import { isAuthenticated, isCustomer } from '@scripts/userUtils';
import API_CONFIG from '../../../api.config';

// Инициализация страницы
$(document).ready(function() {
  // Проверяем авторизацию и роль
  if (!isAuthenticated()) {
    window.location.href = '/login';
    return;
  }

  if (!isCustomer()) {
    window.location.href = '/profile';
    return;
  }

  // Загружаем хедер
  loadHeader();
  
  // Инициализируем навигацию
  initNavigation();
  
  // Заполняем выпадающий список типов ремонта
  initRepairTypes();
  
  // Загрузка списка моделей устройств
  loadDeviceModels();
  
  // Обработчик формы создания заказа
  $('#create-order-form').on('submit', function(e) {
    e.preventDefault();
    createOrder();
  });
});

// Инициализация выпадающего списка типов ремонта
function initRepairTypes() {
  const repairTypes = [
    { value: 'DIAGNOSTIC', text: 'Диагностика' },
    { value: 'HARDWARE_REPAIR', text: 'Ремонт оборудования' },
    { value: 'SOFTWARE_REPAIR', text: 'Ремонт ПО' },
    { value: 'FIRMWARE_UPDATE', text: 'Обновление прошивки' },
    { value: 'CLEANING', text: 'Чистка' },
    { value: 'REPLACEMENT', text: 'Замена деталей' },
    { value: 'COMPLEX_REPAIR', text: 'Комплексный ремонт' }
  ];
  
  const repairTypeSelect = $('#repairType');
  
  // Очищаем текущие опции
  repairTypeSelect.empty();
  
  // Добавляем опцию по умолчанию
  repairTypeSelect.append($('<option>').val('').text('Выберите тип ремонта').prop('disabled', true).prop('selected', true));
  
  // Добавляем опции типов ремонта
  repairTypes.forEach(type => {
    repairTypeSelect.append($('<option>').val(type.value).text(type.text));
  });
}

// Загрузка моделей устройств с сервера
function loadDeviceModels() {
  const token = localStorage.getItem('jwt-token');
  if (!token) {
    console.error('Токен авторизации не найден');
    window.location.href = '/login';
    return;
  }

  fetch(API_CONFIG.getApiUrl('/devices/models'), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include'
  })
  .then(response => {
    if (!response.ok) {
      // Если ошибка 401, перенаправляем на страницу входа
      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }
      throw new Error('Ошибка при загрузке моделей устройств');
    }
    return response.json();
  })
  .then(data => {
    populateDeviceModels(data);
  })
  .catch(error => {
    console.error('Ошибка при загрузке моделей устройств:', error);
  });
}

// Заполнение селекта моделями устройств
function populateDeviceModels(models) {
  if (!models || models.length === 0) {
    return;
  }
  
  const deviceModelSelect = $('#deviceModelId');
  
  // Сохраняем опцию "Не выбрано"
  const defaultOption = deviceModelSelect.find('option:first');
  
  // Очищаем текущие опции, сохраняя опцию "Не выбрано"
  deviceModelSelect.empty().append(defaultOption);
  
  // Группируем модели по типу устройства
  const deviceGroups = {};
  
  models.forEach(model => {
    const deviceType = model.deviceType || 'Другое';
    
    if (!deviceGroups[deviceType]) {
      deviceGroups[deviceType] = [];
    }
    
    deviceGroups[deviceType].push(model);
  });
  
  // Добавляем опции, сгруппированные по типу устройства
  Object.keys(deviceGroups).forEach(deviceType => {
    const optgroup = $('<optgroup>').attr('label', deviceType);
    
    deviceGroups[deviceType].forEach(model => {
      optgroup.append($('<option>')
        .val(model.id)
        .text(model.name)
      );
    });
    
    deviceModelSelect.append(optgroup);
  });
}

// Создание нового заказа
function createOrder() {
  // Проверяем валидность формы
  if (!validateOrderForm()) {
    return;
  }
  
  // Собираем данные из формы
  const orderData = {
    repairType: $('#repairType').val(),
    description: $('#description').val(),
    price: $('#price').val() ? parseFloat($('#price').val()) : null,
    deviceModelId: $('#deviceModelId').val() ? parseInt($('#deviceModelId').val()) : null
  };
  
  const token = localStorage.getItem('jwt-token');
  if (!token) {
    console.error('Токен авторизации не найден');
    showError('Вы не авторизованы. Пожалуйста, войдите в систему.');
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
    return;
  }
  
  // Отправляем запрос на сервер с использованием fetch API вместо jQuery ajax
  fetch(API_CONFIG.getApiUrl('/orders'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderData),
    credentials: 'include'
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(data => {
        throw new Error(data.message || 'Произошла ошибка при создании заказа');
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('Заказ успешно создан:', data);
    
    // Показываем сообщение об успехе
    showSuccess('Заказ успешно создан');
    
    // Перенаправляем на страницу профиля через 2 секунды
    setTimeout(() => {
      window.location.href = '/profile';
    }, 2000);
  })
  .catch(error => {
    console.error('Ошибка при создании заказа:', error);
    
    let errorMessage = error.message || 'Произошла ошибка при создании заказа';
    
    showError(errorMessage);
    
    // Если ошибка связана с авторизацией, перенаправляем на страницу входа
    if (error.message.includes('401') || error.message.includes('авториз')) {
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
  });
}

// Валидация формы заказа
function validateOrderForm() {
  let isValid = true;
  
  // Проверка выбора типа ремонта
  if (!$('#repairType').val()) {
    showError('Пожалуйста, выберите тип ремонта');
    $('#repairType').addClass('is-invalid');
    isValid = false;
  } else {
    $('#repairType').removeClass('is-invalid');
  }
  
  // Проверка описания
  if (!$('#description').val().trim()) {
    showError('Пожалуйста, опишите проблему');
    $('#description').addClass('is-invalid');
    isValid = false;
  } else {
    $('#description').removeClass('is-invalid');
  }
  
  return isValid;
}

// Отображение сообщения об успехе
function showSuccess(message) {
  const alertHtml = `
    <div class="alert alert-success alert-dismissible fade show" role="alert">
      <strong>Успех!</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  
  $('.create-order-section .container').prepend(alertHtml);
  
  // Прокрутка страницы к верху для отображения сообщения
  window.scrollTo(0, 0);
}

// Отображение сообщения об ошибке
function showError(message) {
  const alertHtml = `
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
      <strong>Ошибка!</strong> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  
  $('.create-order-section .container').prepend(alertHtml);
  
  // Прокрутка страницы к верху для отображения сообщения
  window.scrollTo(0, 0);
} 