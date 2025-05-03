// Скрипт для управления профилем пользователя
import $ from 'jquery';
import Inputmask from 'inputmask';
import API_CONFIG from "../../api.config";

// Функция для инициализации страницы профиля
export function initProfile() {
  if (!document.querySelector('.profile-header-section')) {
    return; // Не на странице профиля
  }
  
  // Загрузка данных профиля
  loadProfileData();
  
  // Инициализация обработчиков событий
  initEventHandlers();
  
  // Инициализация маски ввода для телефона
  initInputMasks();
}

// Загрузка данных профиля с сервера
function loadProfileData() {
  $.ajax({
    url: API_CONFIG.getApiUrl('/profile'),
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
    },
    crossDomain: true,
    xhrFields: {
      withCredentials: true
    },
    success: function(response) {
      displayProfileData(response);
    },
    error: function(xhr) {
      if (xhr.status === 401) {
        // Неавторизованный доступ
        window.location.href = '/login';
      } else {
        showError('Не удалось загрузить данные профиля');
      }
    }
  });
}

// Отображение данных профиля на странице
function displayProfileData(data) {
  // Определяем текущую роль пользователя
  const userRole = data.role || '';
  
  // Показываем/скрываем блоки в зависимости от роли
  setupUIForRole(userRole);
  
  // Общие данные для всех типов профилей
  $('#userName').text(getUserDisplayName(data, userRole));
  $('#userRating').text(data.rating || '0.0');
  $('#roleBadge').text(getRoleDisplayName(userRole));
  
  const regDate = data.registrationDate ? new Date(data.registrationDate) : null;
  if (regDate) {
    $('#registrationDate').text(regDate.toLocaleDateString('ru-RU'));
  }
  
  // Заполнение полей информации в зависимости от роли
  if (userRole === 'CUSTOMER') {
    displayCustomerProfile(data);
  } else if (userRole === 'MASTER') {
    displayMasterProfile(data);
  } else if (userRole === 'ADMIN') {
    displayAdminProfile(data);
  }
  
  // Загрузка списка заказов, если роль CUSTOMER или MASTER
  if ((userRole === 'CUSTOMER' || userRole === 'MASTER') && data.orders && data.orders.length > 0) {
    $('#completedOrders').text(countCompletedOrders(data.orders));
    displayOrders(data.orders);
  }
}

// Определение отображаемого имени в зависимости от роли
function getUserDisplayName(data, role) {
  if (role === 'CUSTOMER' || role === 'ADMIN') {
    return `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Пользователь';
  } else if (role === 'MASTER') {
    return data.name || 'Мастер';
  }
  return data.username || 'Пользователь';
}

// Получение отображаемого названия роли
function getRoleDisplayName(role) {
  switch (role) {
    case 'CUSTOMER':
      return 'Заказчик';
    case 'MASTER':
      return 'Мастер';
    case 'ADMIN':
      return 'Администратор';
    default:
      return 'Пользователь';
  }
}

// Настройка интерфейса в зависимости от роли
function setupUIForRole(role) {
  // Скрываем все специфичные для роли блоки
  $('.role-specific').hide();
  
  // Показываем блоки в зависимости от роли
  $(`.${role.toLowerCase()}-specific`).show();
  
  // Настраиваем вкладки меню в зависимости от роли
  if (role === 'CUSTOMER') {
    $('#ordersTabTitle').text('Мои заказы');
    $('#createOrderBtn').show();
  } else if (role === 'MASTER') {
    $('#ordersTabTitle').text('Мои выполненные заказы');
    $('#createOrderBtn').hide();
  } else if (role === 'ADMIN') {
    // Для администратора можно показать дополнительные вкладки
    $('.admin-tabs').show();
  }
}

// Отображение профиля заказчика
function displayCustomerProfile(data) {
  // Заполнение блока информации профиля
  $('#fullNameValue').text(`${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Не указано');
  $('#emailValue').text(data.email || 'Не указан');
  $('#phoneValue').text(data.phoneNumber || 'Не указан');
  $('#addressValue').text(data.address || 'Не указан');
  $('#bioValue').text(data.bio || 'Информация не заполнена');
  
  // Заполнение полей формы редактирования
  $('#firstName').val(data.firstName || '');
  $('#lastName').val(data.lastName || '');
  $('#email').val(data.email || '');
  $('#phone').val(data.phoneNumber || '');
  $('#address').val(data.address || '');
  $('#bio').val(data.bio || '');
  
  // Отображение статусов
  updateVerificationStatus(data.isVerified);
}

// Отображение профиля мастера
function displayMasterProfile(data) {
  // Заполнение блока информации профиля
  $('#masterNameValue').text(data.name || 'Не указано');
  $('#emailValue').text(data.email || 'Не указан');
  $('#phoneValue').text(data.phoneNumber || 'Не указан');
  $('#addressValue').text(data.address || 'Не указан');
  $('#specializationValue').text(data.specialization || 'Не указана');
  $('#experienceValue').text(data.experienceYears ? `${data.experienceYears} лет` : 'Не указан');
  $('#priceValue').text(data.price ? `от ${data.price} ₽` : 'Не указана');
  $('#descriptionValue').text(data.description || 'Информация не заполнена');
  
  // Заполнение полей формы редактирования
  $('#masterName').val(data.name || '');
  $('#email').val(data.email || '');
  $('#phone').val(data.phoneNumber || '');
  $('#address').val(data.address || '');
  $('#specialization').val(data.specialization || '');
  $('#experience').val(data.experienceYears || '');
  $('#price').val(data.price || '');
  $('#description').val(data.description || '');
  
  // Обновление рейтинга
  updateMasterRating(data.rating);
}

// Отображение профиля администратора
function displayAdminProfile(data) {
  // Заполнение блока информации профиля
  $('#fullNameValue').text(`${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Не указано');
  $('#emailValue').text(data.email || 'Не указан');
  $('#notesValue').text(data.notes || 'Нет заметок');
  
  // Заполнение полей формы редактирования
  $('#firstName').val(data.firstName || '');
  $('#lastName').val(data.lastName || '');
  $('#email').val(data.email || '');
  $('#notes').val(data.notes || '');
  
  // Отображение статуса суперадмина
  if (data.isSuperAdmin) {
    $('#superAdminBadge').show();
  } else {
    $('#superAdminBadge').hide();
  }
}

// Обновление статуса верификации
function updateVerificationStatus(isVerified) {
  if (isVerified) {
    $('#verificationStatus').html('<span class="badge bg-success">Верифицирован</span>');
  } else {
    $('#verificationStatus').html('<span class="badge bg-warning">Не верифицирован</span>');
  }
}

// Обновление рейтинга мастера
function updateMasterRating(rating) {
  const ratingValue = parseFloat(rating) || 0;
  $('#masterRatingValue').text(ratingValue.toFixed(1));
  
  // Обновляем звезды рейтинга
  const starsContainer = $('#ratingStars');
  starsContainer.empty();
  
  for (let i = 1; i <= 5; i++) {
    let starClass = 'bi-star';
    if (i <= Math.floor(ratingValue)) {
      starClass = 'bi-star-fill';
    } else if (i - 0.5 <= ratingValue) {
      starClass = 'bi-star-half';
    }
    
    starsContainer.append(`<i class="bi ${starClass}"></i>`);
  }
}

// Подсчет завершенных заказов
function countCompletedOrders(orders) {
  if (!orders || !orders.length) return 0;
  return orders.filter(order => order.status === 'COMPLETED').length;
}

// Отображение заказов пользователя
function displayOrders(orders) {
  const activeOrders = orders.filter(order => order.status !== 'COMPLETED' && order.status !== 'CANCELED');
  const completedOrders = orders.filter(order => order.status === 'COMPLETED' || order.status === 'CANCELED');
  
  if (activeOrders.length > 0) {
    const activeOrdersHtml = activeOrders.map(order => createOrderCard(order)).join('');
    $('#activeOrdersList').html(activeOrdersHtml);
  }
  
  if (completedOrders.length > 0) {
    const completedOrdersHtml = completedOrders.map(order => createOrderCard(order)).join('');
    $('#completedOrdersList').html(completedOrdersHtml);
  }
}

// Создание HTML-карточки заказа
function createOrderCard(order) {
  const statusClass = getStatusClass(order.status);
  const statusText = getStatusText(order.status);
  const date = new Date(order.creationDate).toLocaleDateString('ru-RU');
  
  return `
    <div class="order-card" data-order-id="${order.id}">
      <div class="order-header">
        <div class="order-id">№${order.id}</div>
        <div class="order-status ${statusClass}">${statusText}</div>
      </div>
      <h4 class="order-title">${order.title}</h4>
      <div class="order-details">
        <div class="order-detail">
          <i class="bi bi-calendar3"></i> ${date}
        </div>
        <div class="order-detail">
          <i class="bi bi-geo-alt"></i> ${order.location || 'Не указано'}
        </div>
        <div class="order-detail">
          <i class="bi bi-person"></i> ${order.masterName || 'Мастер не назначен'}
        </div>
      </div>
      <div class="order-footer">
        <div class="order-price">${order.price ? order.price + ' ₽' : 'Цена не установлена'}</div>
        <a href="/order/${order.id}" class="btn btn-sm btn-outline-primary">Подробнее</a>
      </div>
    </div>
  `;
}

// Определение класса статуса заказа
function getStatusClass(status) {
  switch (status) {
    case 'NEW':
    case 'WAITING_OFFERS':
    case 'IN_PROGRESS':
      return 'status-active';
    case 'COMPLETED':
      return 'status-completed';
    case 'CANCELED':
      return 'status-canceled';
    default:
      return '';
  }
}

// Определение текста статуса заказа
function getStatusText(status) {
  switch (status) {
    case 'NEW':
      return 'Новый';
    case 'WAITING_OFFERS':
      return 'Ожидает предложений';
    case 'IN_PROGRESS':
      return 'В работе';
    case 'COMPLETED':
      return 'Завершен';
    case 'CANCELED':
      return 'Отменен';
    default:
      return 'Неизвестный статус';
  }
}

// Инициализация обработчиков событий
function initEventHandlers() {
  // Редактирование профиля
  $('#editProfileBtn').on('click', function() {
    $('#profileInfo').hide();
    $('#profileForm').removeClass('d-none');
  });
  
  $('#cancelEditBtn').on('click', function() {
    $('#profileForm').addClass('d-none');
    $('#profileInfo').show();
  });
  
  // Отправка формы профиля заказчика
  $('#customerProfileForm').on('submit', function(e) {
    e.preventDefault();
    
    const profileData = {
      firstName: $('#firstName').val(),
      lastName: $('#lastName').val(),
      phoneNumber: $('#phone').val(),
      address: $('#address').val(),
      bio: $('#bio').val()
    };
    
    updateProfile(profileData);
  });
  
  // Отправка формы профиля мастера
  $('#masterProfileForm').on('submit', function(e) {
    e.preventDefault();
    
    const profileData = {
      name: $('#masterName').val(),
      phoneNumber: $('#phone').val(),
      address: $('#address').val(),
      specialization: $('#specialization').val(),
      experienceYears: parseInt($('#experience').val()) || null,
      price: parseFloat($('#price').val()) || null,
      description: $('#description').val()
    };
    
    updateProfile(profileData);
  });
  
  // Отправка формы профиля администратора
  $('#adminProfileForm').on('submit', function(e) {
    e.preventDefault();
    
    const profileData = {
      firstName: $('#firstName').val(),
      lastName: $('#lastName').val(),
      notes: $('#notes').val()
    };
    
    updateProfile(profileData);
  });
  
  // Смена пароля
  $('#changePasswordForm').on('submit', function(e) {
    e.preventDefault();
    
    const currentPassword = $('#currentPassword').val();
    const newPassword = $('#newPassword').val();
    const confirmPassword = $('#confirmPassword').val();
    
    if (newPassword !== confirmPassword) {
      showError('Пароли не совпадают');
      return;
    }
    
    changePassword(currentPassword, newPassword);
  });
  
  // Удаление аккаунта
  $('#deleteAccountBtn').on('click', function() {
    $('#deleteAccountModal').modal('show');
  });
  
  $('#confirmDeleteBtn').on('click', function() {
    const password = $('#deleteConfirmPassword').val();
    if (!password) {
      showError('Введите пароль для подтверждения');
      return;
    }
    
    deleteAccount(password);
  });
  
  // Кнопка выхода
  $('#logoutBtn').on('click', function() {
    logout();
  });
  
  // Кнопки создания заказа
  $('#createOrderBtn, #createOrderBtnEmpty').on('click', function() {
    window.location.href = '/customers/create-order';
  });
}

// Инициализация масок ввода
function initInputMasks() {
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    Inputmask('+7 (999) 999-99-99').mask(phoneInput);
  }
}

// Обновление профиля
function updateProfile(profileData) {
  $.ajax({
    url: API_CONFIG.getApiUrl('/profile'),
    method: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify(profileData),
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
    },
    crossDomain: true,
    xhrFields: {
      withCredentials: true
    },
    success: function(response) {
      showSuccess('Профиль успешно обновлен');
      $('.profile-form').addClass('d-none');
      $('#profileInfo').show();
      displayProfileData(response);
    },
    error: function(xhr) {
      handleApiError(xhr, 'Не удалось обновить профиль');
    }
  });
}

// Смена пароля
function changePassword(currentPassword, newPassword) {
  $.ajax({
    url: API_CONFIG.getApiUrl('/profile/password'),
    method: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify({
      currentPassword: currentPassword,
      newPassword: newPassword
    }),
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
    },
    crossDomain: true,
    xhrFields: {
      withCredentials: true
    },
    success: function() {
      showSuccess('Пароль успешно изменен');
      $('#changePasswordForm')[0].reset();
    },
    error: function(xhr) {
      handleApiError(xhr, 'Не удалось изменить пароль');
    }
  });
}

// Удаление аккаунта
function deleteAccount(password) {
  $.ajax({
    url: API_CONFIG.getApiUrl('/profile'),
    method: 'DELETE',
    contentType: 'application/json',
    data: JSON.stringify({
      password: password
    }),
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
    },
    crossDomain: true,
    xhrFields: {
      withCredentials: true
    },
    success: function() {
      localStorage.removeItem('jwt-token');
      window.location.href = '/';
    },
    error: function(xhr) {
      handleApiError(xhr, 'Не удалось удалить аккаунт');
    }
  });
}

// Выход из аккаунта
function logout() {
  localStorage.removeItem('jwt-token');
  window.location.href = '/login';
}

// Обработка ошибок API
function handleApiError(xhr, defaultMessage) {
  if (xhr.status === 401) {
    localStorage.removeItem('jwt-token');
    window.location.href = '/login';
    return;
  }
  
  let errorMessage = defaultMessage;
  try {
    const response = JSON.parse(xhr.responseText);
    if (response.message) {
      errorMessage = response.message;
    }
  } catch (e) {
    console.error('Ошибка при разборе ответа сервера', e);
  }
  
  showError(errorMessage);
}

// Показать сообщение об успехе
function showSuccess(message) {
  // Реализация показа уведомления об успехе
  // Можно использовать toast из Bootstrap или другую библиотеку уведомлений
  alert(message);
}

// Показать сообщение об ошибке
function showError(message) {
  // Реализация показа уведомления об ошибке
  alert(message);
} 