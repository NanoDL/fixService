import $ from 'jquery';
import API_CONFIG from '../../api.config';

// Глобальная инициализация проверки токена
(function() {
  // Настройка глобального перехватчика fetch запросов
  const originalFetch = window.fetch;
  window.fetch = async function(url, options = {}) {
    // Проверяем срок действия токена перед каждым запросом
    if (isTokenExpired() && isAuthenticated()) {
      console.log('Токен истек. Выполняем выход...');
      logout();
      // При автоматическом выходе не продолжаем запрос
      return Promise.reject(new Error('Unauthorized: JWT token expired'));
    }
    
    try {
      const response = await originalFetch(url, options);
      
      // Проверяем ответ на 401 ошибку
      if (response.status === 401 && isAuthenticated()) {
        console.log('Получен ответ 401 Unauthorized. Выполняем выход...');
        logout();
      }
      
      return response;
    } catch (error) {
      // Если ошибка не связана с авторизацией, просто передаем дальше
      throw error;
    }
  };
  
  // Настройка перехватчика для всех AJAX-запросов (для jQuery)
  $(document).ajaxError(function(event, jqXHR, ajaxSettings, thrownError) {
    if (jqXHR.status === 401 && isAuthenticated()) {
      console.log('Получен ответ 401 Unauthorized от AJAX. Выполняем выход...');
      logout();
    }
  });
  
  // Проверяем токен при загрузке страницы
  document.addEventListener('DOMContentLoaded', function() {
    if (isTokenExpired() && isAuthenticated()) {
      console.log('При загрузке страницы обнаружен истекший токен. Выполняем выход...');
      logout();
    }
  });
  
  // Проверяем токен при переходе между страницами
  window.addEventListener('focus', function() {
    if (isTokenExpired() && isAuthenticated()) {
      console.log('При фокусе окна обнаружен истекший токен. Выполняем выход...');
      logout();
    }
  });

  // Настройка интервала для периодической проверки токена (каждую минуту)
  setInterval(() => {
    if (isTokenExpired() && isAuthenticated()) {
      console.log('Токен истек при периодической проверке. Выполняем выход...');
      logout();
    }
  }, 60000); // проверка каждую минуту
})();

/**
 * Получить роль пользователя из JWT токена
 * @returns {string|null} Роль пользователя или null, если пользователь не авторизован
 */
export function getUserRole() {
  const token = localStorage.getItem('jwt-token');
  if (!token) return null;
  
  try {
    // Декодируем JWT токен (берем только payload - вторую часть)
    const payload = parseJwt(token);
    return payload.role || null;
  } catch (e) {
    console.error('Ошибка при декодировании токена:', e);
    return null;
  }
}

/**
 * Декодирует JWT токен и возвращает payload
 * @param {string} token JWT токен
 * @returns {Object} Данные из payload токена
 */
export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Ошибка при разборе JWT токена:', e);
    localStorage.removeItem('jwt-token');
    return {};
  }
}

/**
 * Проверяет, истек ли срок действия токена
 * @returns {boolean} true если токен истек или отсутствует
 */
export function isTokenExpired() {
  const token = localStorage.getItem('jwt-token');
  if (!token) return true;
  
  try {
    const payload = parseJwt(token);
    const currentTime = Date.now() / 1000; // текущее время в секундах
    
    // Проверяем наличие поля exp в токене
    if (!payload.exp) return false;
    
    // Если текущее время больше времени истечения токена
    return currentTime > payload.exp;
  } catch (e) {
    console.error('Ошибка при проверке срока действия токена:', e);
    return true;
  }
}

/**
 * Проверяет, является ли текущий пользователь заказчиком
 * @returns {boolean} true если пользователь является заказчиком
 */
export function isCustomer() {
  return getUserRole() === 'CUSTOMER';
}

/**
 * Проверяет, является ли текущий пользователь мастером
 * @returns {boolean} true если пользователь является мастером
 */
export function isMaster() {
  return getUserRole() === 'MASTER';
}

/**
 * Проверяет, является ли текущий пользователь администратором
 * @returns {boolean} true если пользователь является администратором
 */
export function isAdmin() {
  return getUserRole() === 'ADMIN';
}

/**
 * Проверяет, авторизован ли пользователь
 * @returns {boolean} true если пользователь авторизован
 */
export function isAuthenticated() {
  return localStorage.getItem('jwt-token') !== null;
}

/**
 * Получить данные текущего пользователя
 * @param {Function} onSuccess Callback-функция в случае успеха
 * @param {Function} onError Callback-функция в случае ошибки
 */
export function getCurrentUser(onSuccess, onError) {
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
      if (onSuccess) onSuccess(response);
    },
    error: function(xhr) {
      if (onError) onError(xhr);
    }
  });
}

/**
 * Получает отображаемое название роли пользователя
 * @param {string} role Роль пользователя
 * @returns {string} Отображаемое название роли
 */
export function getRoleDisplayName(role) {
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

/**
 * Выход из системы
 */
export function logout() {
  localStorage.removeItem('jwt-token');
  window.location.href = '/login';
}

// Функция для инициализации глобальной проверки JWT токена (не экспортируется, используется внутри модуля)
function initGlobalTokenCheck() {
    console.log('Инициализация глобальной проверки JWT токена');
    // Уже реализовано в самовызывающейся функции выше
}

// Автоматически инициализируем глобальную проверку токена при загрузке модуля
// initGlobalTokenCheck(); // Уже вызывается в самовызывающейся функции 