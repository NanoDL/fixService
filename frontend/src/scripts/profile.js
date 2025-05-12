// Скрипт для управления профилем пользователя
import $ from 'jquery';
import Inputmask from 'inputmask';
import API_CONFIG from "../../api.config";

// Функция для инициализации страницы профиля
export function initProfile() {
  if (!document.querySelector('.profile-header-section')) {
    return; // Не на странице профиля
  }
  
  // Инициализация вкладок Bootstrap с правильным очищением предыдущих вкладок
  const tabLinks = document.querySelectorAll('.profile-menu .nav-link');
  
  tabLinks.forEach(tab => {
    tab.addEventListener('click', function (event) {
      event.preventDefault();
      
      // Получаем целевую вкладку
      const targetTabId = this.getAttribute('href');
      
      // Скрываем все вкладки
      document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('show', 'active');
      });
      
      // Показываем целевую вкладку
      const targetTab = document.querySelector(targetTabId);
      if (targetTab) {
        targetTab.classList.add('show', 'active');
      }
      
      // Обновляем активную ссылку в меню
      document.querySelectorAll('.profile-menu .nav-link').forEach(link => {
        link.classList.remove('active');
      });
      this.classList.add('active');
    });
  });
  
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
  
  // Для администратора показываем дополнительные вкладки
  if (role === 'ADMIN') {
    $('.admin-tabs').show();
  }
  
  // Активируем первую вкладку
  $('.profile-menu .nav-link').first().tab('show');
}

// Отображение профиля заказчика
function displayCustomerProfile(data) {
  // Заполнение блока информации профиля
  $('#profile-tab .customer-specific #fullNameValue').text(`${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Не указано');
  $('#profile-tab .customer-specific #emailValue').text(data.email || 'Не указан');
  $('#profile-tab .customer-specific #phoneValue').text(data.phoneNumber || 'Не указан');
  $('#profile-tab .customer-specific #addressValue').text(data.address || 'Не указан');
  $('#profile-tab .customer-specific #bioValue').text(data.bio || 'Информация не заполнена');
  
  // Заполнение полей формы редактирования
  $('#profile-tab .customer-specific #firstName').val(data.firstName || '');
  $('#profile-tab .customer-specific #lastName').val(data.lastName || '');
  $('#profile-tab .customer-specific #email').val(data.email || '');
  $('#profile-tab .customer-specific #phone').val(data.phoneNumber || '');
  $('#profile-tab .customer-specific #address').val(data.address || '');
  $('#profile-tab .customer-specific #bio').val(data.bio || '');
  
  // Отображение статусов
  updateVerificationStatus(data.isVerified);
}

// Отображение профиля мастера
function displayMasterProfile(data) {
  // Заполнение блока информации профиля
  $('#profile-tab .master-specific #masterNameValue').text(data.name || 'Не указано');
  $('#profile-tab .master-specific #emailValue').text(data.email || 'Не указан');
  $('#profile-tab .master-specific #phoneValue').text(data.phoneNumber || 'Не указан');
  $('#profile-tab .master-specific #addressValue').text(data.address || 'Не указан');
  $('#profile-tab .master-specific #specializationValue').text(data.specialization || 'Не указана');
  $('#profile-tab .master-specific #experienceValue').text(data.experienceYears ? `${data.experienceYears} лет` : 'Не указан');
  $('#profile-tab .master-specific #priceValue').text(data.price ? `от ${data.price} ₽` : 'Не указана');
  $('#profile-tab .master-specific #descriptionValue').text(data.description || 'Информация не заполнена');
  
  // Заполнение полей формы редактирования
  $('#profile-tab .master-specific #masterName').val(data.name || '');
  $('#profile-tab .master-specific #email').val(data.email || '');
  $('#profile-tab .master-specific #phone').val(data.phoneNumber || '');
  $('#profile-tab .master-specific #address').val(data.address || '');
  $('#profile-tab .master-specific #specialization').val(data.specialization || '');
  $('#profile-tab .master-specific #experience').val(data.experienceYears || '');
  $('#profile-tab .master-specific #price').val(data.price || '');
  $('#profile-tab .master-specific #description').val(data.description || '');
  
  // Обновление рейтинга
  updateMasterRating(data.rating);
}

// Отображение профиля администратора
function displayAdminProfile(data) {
  // Заполнение блока информации профиля
  $('#profile-tab .admin-specific #fullNameValue').text(`${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Не указано');
  $('#profile-tab .admin-specific #emailValue').text(data.email || 'Не указан');
  $('#profile-tab .admin-specific #notesValue').text(data.notes || 'Нет заметок');
  
  // Заполнение полей формы редактирования
  $('#profile-tab .admin-specific #firstName').val(data.firstName || '');
  $('#profile-tab .admin-specific #lastName').val(data.lastName || '');
  $('#profile-tab .admin-specific #email').val(data.email || '');
  $('#profile-tab .admin-specific #notes').val(data.notes || '');
  
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
  $('#profile-tab .master-specific #masterRatingValue').text(ratingValue.toFixed(1));
  
  // Обновляем звезды рейтинга
  const starsContainer = $('#profile-tab .master-specific #ratingStars');
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

// Инициализация обработчиков событий
function initEventHandlers() {
  // Редактирование профиля заказчика
  $('#editProfileBtn-customer').on('click', function() {
    $('#profileInfo-customer').hide();
    $('#customerProfileForm').removeClass('d-none');
  });
  
  $('#cancelEditBtn-customer').on('click', function() {
    $('#customerProfileForm').addClass('d-none');
    $('#profileInfo-customer').show();
  });

  // Редактирование профиля мастера
  $('#editProfileBtn-master').on('click', function() {
    $('#profileInfo-master').hide();
    $('#masterProfileForm').removeClass('d-none');
  });
  
  $('#cancelEditBtn-master').on('click', function() {
    $('#masterProfileForm').addClass('d-none');
    $('#profileInfo-master').show();
  });

  // Редактирование профиля администратора
  $('#editProfileBtn-admin').on('click', function() {
    $('#profileInfo-admin').hide();
    $('#adminProfileForm').removeClass('d-none');
  });
  
  $('#cancelEditBtn-admin').on('click', function() {
    $('#adminProfileForm').addClass('d-none');
    $('#profileInfo-admin').show();
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
      
      // Скрываем все формы и показываем информацию профиля
      $('.profile-form').addClass('d-none');
      
      // Определяем роль пользователя и показываем соответствующий блок
      const role = response.role || '';
      if (role === 'CUSTOMER') {
        $('#profileInfo-customer').show();
      } else if (role === 'MASTER') {
        $('#profileInfo-master').show();
      } else if (role === 'ADMIN') {
        $('#profileInfo-admin').show();
      }
      
      // Обновляем данные профиля
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