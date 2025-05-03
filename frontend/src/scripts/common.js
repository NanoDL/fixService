/**
 * Общие скрипты для сайта
 */

import * as bootstrap from 'bootstrap';
import $ from 'jquery';
import { Tooltip, Popover, Modal } from 'bootstrap';

/**
 * Инициализация тултипов Bootstrap
 */
export function initTooltips() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new Tooltip(tooltipTriggerEl);
  });
}

/**
 * Инициализация всплывающих подсказок Bootstrap
 */
export function initPopovers() {
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new Popover(popoverTriggerEl);
  });
}

/**
 * Инициализация отложенной загрузки изображений
 */
export function initLazyLoading() {
  const lazyImages = [].slice.call(document.querySelectorAll('img.lazy'));
  
  if ('IntersectionObserver' in window) {
    const lazyImageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          if (lazyImage.dataset.srcset) {
            lazyImage.srcset = lazyImage.dataset.srcset;
          }
          lazyImage.classList.remove('lazy');
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(function(lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  } else {
    // Fallback для браузеров без поддержки IntersectionObserver
    let lazyLoadThrottleTimeout;
    
    function lazyLoad() {
      if(lazyLoadThrottleTimeout) {
        clearTimeout(lazyLoadThrottleTimeout);
      }    

      lazyLoadThrottleTimeout = setTimeout(function() {
        const scrollTop = window.pageYOffset;
        lazyImages.forEach(function(lazyImage) {
          if(lazyImage.offsetTop < (window.innerHeight + scrollTop)) {
            lazyImage.src = lazyImage.dataset.src;
            if (lazyImage.dataset.srcset) {
              lazyImage.srcset = lazyImage.dataset.srcset;
            }
            lazyImage.classList.remove("lazy");
          }
        });
        if(lazyImages.length == 0) { 
          document.removeEventListener("scroll", lazyLoad);
          window.removeEventListener("resize", lazyLoad);
          window.removeEventListener("orientationChange", lazyLoad);
        }
      }, 20);
    }

    document.addEventListener("scroll", lazyLoad);
    window.addEventListener("resize", lazyLoad);
    window.addEventListener("orientationChange", lazyLoad);
  }
}

/**
 * Плавная прокрутка к якорям
 */
export function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;
      
      window.scrollTo({
        top: targetElement.offsetTop - 80, // Отступ для фиксированной шапки
        behavior: 'smooth'
      });
    });
  });
}

/**
 * Инициализация модальных окон с эффектом боке
 */
export function initModals() {
  // Инициализация всех модальных окон на странице
  const modalElements = document.querySelectorAll('.modal');
  
  modalElements.forEach(modalEl => {
    // Создаем экземпляр модального окна Bootstrap
    const modal = new Modal(modalEl);
    
    // Добавляем слушатель на событие show.bs.modal
    modalEl.addEventListener('show.bs.modal', function() {
      // Добавляем класс для анимации при открытии
      document.body.classList.add('modal-animation-in');
    });
    
    // Добавляем слушатель на событие shown.bs.modal
    modalEl.addEventListener('shown.bs.modal', function() {
      // Применяем полный эффект боке когда модальное окно полностью открыто
      document.body.classList.add('modal-backdrop-blur');
    });
    
    // Добавляем слушатель на событие hide.bs.modal
    modalEl.addEventListener('hide.bs.modal', function() {
      // Удаляем классы при закрытии
      document.body.classList.remove('modal-backdrop-blur');
      document.body.classList.add('modal-animation-out');
    });
    
    // Добавляем слушатель на событие hidden.bs.modal
    modalEl.addEventListener('hidden.bs.modal', function() {
      // Удаляем все классы анимации когда модальное окно полностью закрыто
      document.body.classList.remove('modal-animation-in', 'modal-animation-out');
    });
  });
}

// Загрузка хедера
export function loadHeader() {
  const headerContainer = document.querySelector('#headerContainer');
  if (headerContainer) {
    // Используем абсолютный путь к хедеру
    const headerUrl = '/components/header/header.html';
    
    console.log(`Загрузка хедера с: ${headerUrl}`);
    
    // Используем fetch с абсолютным путем
    fetch(headerUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        // Очищаем контейнер перед вставкой (удаляем запасной хедер)
        headerContainer.innerHTML = '';
        headerContainer.innerHTML = html;
        
        // Подсветка текущего пункта меню
        highlightCurrentPage();
        
        // Проверяем авторизацию сразу после загрузки хедера
        const event = new Event('headerLoaded');
        document.dispatchEvent(event);
        
        console.log('Хедер успешно загружен');
      })
      .catch(error => {
        console.error('Ошибка загрузки хедера:', error);
        // Не меняем содержимое, оставляя запасной вариант, уже присутствующий в HTML
        
        // Отправляем событие для обновления навигации с запасным хедером
        const event = new Event('headerLoaded');
        document.dispatchEvent(event);
      });
  }
}

// Определение базового URL для текущей страницы
function getBaseUrl() {
  // Получаем текущий путь
  const path = window.location.pathname;
  
  // Подсчитываем количество сегментов в пути (кроме пустых)
  const segments = path.split('/').filter(segment => segment.length > 0);
  
  // Логируем для отладки
  console.log('Текущий путь:', path);
  console.log('Количество сегментов:', segments.length);
  console.log('Сегменты:', segments);
  
  // Для главной страницы возвращаем "/"
  if (segments.length === 0) {
    console.log('Возвращаем путь для главной: /');
    return '/';
  }
  
  // Проверяем наличие ключевых путей для определения глубины
  if (segments.includes('register')) {
    // Если register/master или register/customer
    if (segments.length >= 2 && (segments.includes('master') || segments.includes('customer'))) {
      console.log('Возвращаем путь для страницы регистрации мастера/клиента: ../../');
      return '../../';
    }
    
    // Если просто register
    console.log('Возвращаем путь для страницы выбора типа регистрации: ../');
    return '../';
  }
  
  // Для страниц первого уровня (/login, /profile и т.д.) возвращаем "/"
  if (segments.length === 1) {
    console.log('Возвращаем путь для страницы первого уровня: ../');
    return '../';
  }
  
  // Для вложенных страниц создаем соответствующий путь с "../"
  const basePath = '../'.repeat(segments.length - 1);
  console.log(`Возвращаем путь для вложенной страницы: ${basePath}`);
  return basePath;
}

// Подсветка текущего пункта меню
function highlightCurrentPage() {
  const currentPath = window.location.pathname;
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath || 
        (currentPath.startsWith(linkPath) && linkPath !== '/')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
} 