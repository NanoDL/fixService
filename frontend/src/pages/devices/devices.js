import '../../styles/main.scss';
import { loadHeader } from '../../scripts/common';
import { initNavigation } from '../../scripts/navigation';
import { isAuthenticated, isAdmin, isMaster } from '../../scripts/userUtils';
import API_CONFIG from '../../../api.config';
import * as bootstrap from 'bootstrap';

// Загрузка хедера
document.addEventListener('DOMContentLoaded', () => {
    loadHeader();
    // Инициализация навигации для корректного отображения меню 
    // в зависимости от статуса авторизации и роли пользователя
    initNavigation();
    initDevicesPage();
});

// Инициализация страницы устройств
function initDevicesPage() {
    loadDeviceTypes();
    loadManufacturers();
    loadDevices();
    
    // Инициализация обработчиков событий
    initFilterHandlers();
    initPaginationHandlers();
    initModalHandlers();
    
    // Проверяем, может ли пользователь добавлять устройства
    checkAddDevicePermissions();
}

// Проверка прав на добавление устройств
function checkAddDevicePermissions() {
    if (isAuthenticated() && (isAdmin() || isMaster())) {
        // Добавляем кнопку для создания нового устройства
        const addDeviceButton = `
            <div class="col-12 text-end mb-4">
                <a href="/devices/add" class="btn btn-primary">
                    <i class="bi bi-plus-circle me-2"></i>Добавить устройство
                </a>
            </div>
        `;
        
        // Вставляем кнопку перед списком устройств
        $('#devices-list').before(addDeviceButton);
    }
}

// Загрузка типов устройств с сервера
async function loadDeviceTypes() {
    try {
        const token = localStorage.getItem('jwt-token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch(API_CONFIG.getApiUrl('/devices/types'), {
            method: 'GET',
            headers: headers
        });
        
        if (response.ok) {
            const deviceTypes = await response.json();
            populateDeviceTypeSelect(deviceTypes);
        } else {
            console.error('Ошибка при загрузке типов устройств:', response.status);
        }
    } catch (error) {
        console.error('Ошибка при загрузке типов устройств:', error);
    }
}

// Заполнение выпадающего списка типов устройств
function populateDeviceTypeSelect(deviceTypes) {
    const selectElement = document.getElementById('deviceType');
    
    // Очистка текущих опций, кроме первого элемента "Все типы"
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }
    
    // Добавление типов устройств в список
    deviceTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = formatDeviceType(type);
        selectElement.appendChild(option);
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

// Загрузка производителей с сервера
async function loadManufacturers() {
    try {
        const token = localStorage.getItem('jwt-token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        // Этот эндпоинт нужно создать на бэкенде
        const response = await fetch(API_CONFIG.getApiUrl('/devices/manufacturers'), {
            method: 'GET',
            headers: headers
        });
        
        if (response.ok) {
            const manufacturers = await response.json();
            populateManufacturerSelect(manufacturers);
        } else {
            console.error('Ошибка при загрузке производителей:', response.status);
        }
    } catch (error) {
        console.error('Ошибка при загрузке производителей:', error);
    }
}

// Заполнение выпадающего списка производителей
function populateManufacturerSelect(manufacturers) {
    const selectElement = document.getElementById('manufacturer');
    
    // Очистка текущих опций, кроме первого элемента "Все производители"
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }
    
    // Добавление производителей в список
    manufacturers.forEach(manufacturer => {
        const option = document.createElement('option');
        option.value = manufacturer;
        option.textContent = manufacturer;
        selectElement.appendChild(option);
    });
}

// Загрузка устройств с сервера
async function loadDevices(page = 0, filters = {}) {
    // page начинается с 0, так как на бэкенде пагинация начинается с 0
    showLoadingState();
    
    try {
        // Получаем токен авторизации
        const token = localStorage.getItem('jwt-token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        // Формирование параметров запроса
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        
        // Добавление фильтров в параметры запроса
        if (filters.type) queryParams.append('type', filters.type);
        if (filters.manufacturer) queryParams.append('manufacturer', filters.manufacturer);
        if (filters.search) queryParams.append('search', filters.search);
        
        // Запрос на сервер с заголовком авторизации
        const response = await fetch(API_CONFIG.getApiUrl(`/devices?${queryParams.toString()}`), {
            method: 'GET',
            headers: headers
        });
        
        if (response.ok) {
            // Данные с сервера:
            // {
            //   content: [...],  // массив устройств
            //   totalPages: 10,  // общее количество страниц
            //   currentPage: 0,  // текущая страница (начинается с 0)
            //   totalElements: 100  // общее количество устройств
            // }
            const data = await response.json();
            
            if (data.content && data.content.length > 0) {
                renderDevices(data.content);
                renderPagination(data.currentPage, data.totalPages);
                hideLoadingState();
            } else {
                showEmptyState();
            }
        } else {
            if (response.status === 403) {
                console.error('Доступ запрещен. Необходима авторизация или повышение прав доступа.');
                showEmptyState('Доступ запрещен. Для просмотра устройств необходимо авторизоваться как мастер или администратор.');
            } else {
                console.error('Ошибка при загрузке устройств:', response.status);
                showEmptyState('Ошибка загрузки устройств');
            }
        }
    } catch (error) {
        console.error('Ошибка при загрузке устройств:', error);
        showEmptyState('Ошибка загрузки устройств');
    }
}

// Отрисовка устройств на странице
function renderDevices(devices) {
    const devicesList = document.getElementById('devices-list');
    
    // Очистка списка устройств
    devicesList.innerHTML = '';
    
    // Отрисовка каждого устройства
    devices.forEach(device => {
        // Создаем элементы программно вместо использования шаблона
        const deviceElement = document.createElement('div');
        deviceElement.className = 'col-lg-4 col-md-6 mb-4';
        
        // Создаем HTML для карточки устройства
        deviceElement.innerHTML = `
            <div class="card h-100 shadow-sm device-card">
                <div class="device-type-badge">
                    <span class="badge bg-primary">${formatDeviceType(device.type)}</span>
                </div>
                <div class="card-body">
                    <h5 class="card-title device-name">${device.name}</h5>
                    <p class="card-text text-muted device-manufacturer">${device.manufacturer}</p>
                    <div class="device-info">
                        <p class="mb-2"><i class="bi bi-file-earmark-code me-2"></i><span class="firmware-count">${device.compatibleFirmwares ? device.compatibleFirmwares.length : 0}</span> доступных прошивок</p>
                    </div>
                </div>
                <div class="card-footer bg-white border-top-0">
                    <div class="d-grid">
                        <button data-device-id="${device.id}" class="btn btn-outline-primary view-device-btn">Подробнее</button>
                    </div>
                </div>
            </div>
        `;
        
        // Добавление карточки устройства в список
        devicesList.appendChild(deviceElement);
    });

    // Добавление обработчиков событий на кнопки "Подробнее"
    document.querySelectorAll('.view-device-btn').forEach(button => {
        button.addEventListener('click', () => {
            const deviceId = button.getAttribute('data-device-id');
            openDeviceDetailsModal(deviceId);
        });
    });
}

// Отрисовка пагинации
function renderPagination(currentPage, totalPages) {
    const paginationElement = document.getElementById('pagination');
    
    // Очистка пагинации
    paginationElement.innerHTML = '';
    
    // Кнопка "Предыдущая"
    const prevButton = createPaginationItem('предыдущая', currentPage > 0, currentPage - 1);
    paginationElement.appendChild(prevButton);
    
    // Номера страниц (для пользователя страницы начинаются с 1, но для бэкенда с 0)
    for (let i = 0; i < totalPages; i++) {
        // Отображаем пользователю номер страницы с 1, но передаем в обработчик индекс с 0
        const displayPageNumber = i + 1;
        const pageItem = createPaginationItem(displayPageNumber.toString(), true, i, i === currentPage);
        paginationElement.appendChild(pageItem);
    }
    
    // Кнопка "Следующая"
    const nextButton = createPaginationItem('следующая', currentPage < totalPages - 1, currentPage + 1);
    paginationElement.appendChild(nextButton);
}

// Создание элемента пагинации
function createPaginationItem(text, enabled, page, active = false) {
    const li = document.createElement('li');
    li.classList.add('page-item');
    
    if (!enabled) li.classList.add('disabled');
    if (active) li.classList.add('active');
    
    const a = document.createElement('a');
    a.classList.add('page-link');
    a.href = '#';
    
    if (text === 'предыдущая') {
        const icon = document.createElement('i');
        icon.classList.add('bi', 'bi-chevron-left');
        a.appendChild(icon);
    } else if (text === 'следующая') {
        const icon = document.createElement('i');
        icon.classList.add('bi', 'bi-chevron-right');
        a.appendChild(icon);
    } else {
        a.textContent = text;
    }
    
    if (enabled) {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            // Передаем индекс страницы (page), который начинается с 0 для бэкенда
            loadDevices(page, getCurrentFilters());
        });
    }
    
    li.appendChild(a);
    return li;
}

// Получение текущих фильтров
function getCurrentFilters() {
    return {
        type: document.getElementById('deviceType').value,
        manufacturer: document.getElementById('manufacturer').value,
        search: document.getElementById('searchQuery').value
    };
}

// Инициализация обработчиков фильтров
function initFilterHandlers() {
    const filterForm = document.getElementById('device-filter-form');
    
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // При применении фильтров всегда начинаем с 0-й страницы
        loadDevices(0, getCurrentFilters());
    });
    
    // Также можно добавить обработчики для фильтрации при изменении select-элементов
    document.getElementById('deviceType').addEventListener('change', () => {
        // При изменении типа устройства начинаем с 0-й страницы
        loadDevices(0, getCurrentFilters());
    });
    
    document.getElementById('manufacturer').addEventListener('change', () => {
        // При изменении производителя начинаем с 0-й страницы
        loadDevices(0, getCurrentFilters());
    });
}

// Инициализация обработчиков пагинации
function initPaginationHandlers() {
    // Обработчики добавляются динамически при рендеринге пагинации
}

// Создание и добавление модального окна в DOM
function createDeviceDetailsModal() {
    const modalHTML = `
    <div class="modal fade" id="deviceDetailsModal" tabindex="-1" aria-labelledby="deviceDetailsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="deviceDetailsModalLabel">Информация об устройстве</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
                </div>
                <div class="modal-body">
                    <div class="device-details-loading d-flex justify-content-center align-items-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Загрузка...</span>
                        </div>
                    </div>
                    <div class="device-details-content d-none">
                        <div class="device-main-info mb-4 p-3 rounded bg-light">
                            <h2 id="device-name" class="device-detail-title mb-3"></h2>
                            <div class="device-info-row row mb-2 align-items-center">
                                <div class="col-4 text-muted fw-bold">Производитель:</div>
                                <div class="col-8 fs-5" id="device-manufacturer"></div>
                            </div>
                            <div class="device-info-row row mb-0 align-items-center">
                                <div class="col-4 text-muted fw-bold">Тип устройства:</div>
                                <div class="col-8"><span class="badge bg-primary fs-6" id="device-type"></span></div>
                            </div>
                        </div>
                        <div class="firmware-container">
                            <div class="firmware-header d-flex justify-content-between align-items-center">
                                <h6 class="fw-bold mb-0"><i class="bi bi-cpu me-2"></i>Доступные прошивки</h6>
                                <span class="badge firmware-count"></span>
                            </div>
                            <div class="firmware-content mt-3">
                                <div id="firmwares-loading" class="text-center py-4 d-none">
                                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                                        <span class="visually-hidden">Загрузка...</span>
                                    </div>
                                </div>
                                <div id="no-firmwares" class="alert alert-info py-3 d-none" role="alert">
                                    <i class="bi bi-info-circle me-2"></i>Для данного устройства нет доступных прошивок
                                </div>
                                <div id="firmwares-list" class="firmware-items-container d-none">
                                    <!-- Список прошивок будет добавлен программно -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // Добавляем модальное окно в конец body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Инициализация обработчиков событий для модального окна
function initModalHandlers() {
    // Создаем модальное окно, если его еще нет в DOM
    if (!document.getElementById('deviceDetailsModal')) {
        createDeviceDetailsModal();
    }
}

// Открытие модального окна с данными устройства
async function openDeviceDetailsModal(deviceId) {
    // Получаем модальное окно
    const deviceModal = document.getElementById('deviceDetailsModal');
    
    // Проверяем, есть ли модальное окно в DOM
    if (!deviceModal) {
        createDeviceDetailsModal();
    }
    
    // Показываем состояние загрузки
    const loadingElement = document.querySelector('.device-details-loading');
    const contentElement = document.querySelector('.device-details-content');
    
    loadingElement.classList.remove('d-none');
    contentElement.classList.add('d-none');
    
    // Открываем модальное окно
    const modal = new bootstrap.Modal(document.getElementById('deviceDetailsModal'));
    modal.show();
    
    try {
        // Загружаем данные устройства
        await loadDeviceDetails(deviceId);
        
        // Загружаем прошивки для устройства
        await loadDeviceFirmwares(deviceId);
        
        // Скрываем загрузку и показываем контент
        loadingElement.classList.add('d-none');
        contentElement.classList.remove('d-none');
    } catch (error) {
        console.error('Ошибка при загрузке данных устройства:', error);
        
        // Отображаем сообщение об ошибке
        contentElement.innerHTML = `
            <div class="alert alert-danger" role="alert">
                Не удалось загрузить информацию об устройстве. Пожалуйста, попробуйте позже.
            </div>
        `;
        loadingElement.classList.add('d-none');
        contentElement.classList.remove('d-none');
    }
}

// Загрузка данных устройства с сервера
async function loadDeviceDetails(deviceId) {
    try {
        const token = localStorage.getItem('jwt-token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch(API_CONFIG.getApiUrl(`/devices/${deviceId}`), {
            method: 'GET',
            headers: headers
        });
        
        if (response.ok) {
            const device = await response.json();
            console.log('Загруженное устройство:', device); // Для отладки
            
            // Заполняем данные устройства в модальном окне
            document.getElementById('device-name').textContent = device.name;
            document.getElementById('device-manufacturer').textContent = device.manufacturer;
            document.getElementById('device-type').textContent = formatDeviceType(device.type);
            
            return device;
        } else {
            throw new Error(`Ошибка загрузки данных устройства: ${response.status}`);
        }
    } catch (error) {
        console.error('Ошибка при загрузке данных устройства:', error);
        throw error;
    }
}

// Загрузка прошивок для устройства
async function loadDeviceFirmwares(deviceId) {
    try {
        const firmwaresLoading = document.getElementById('firmwares-loading');
        const noFirmwares = document.getElementById('no-firmwares');
        const firmwaresList = document.getElementById('firmwares-list');
        
        // Показываем загрузку прошивок
        firmwaresLoading.classList.remove('d-none');
        noFirmwares.classList.add('d-none');
        firmwaresList.classList.add('d-none');
        
        const token = localStorage.getItem('jwt-token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch(API_CONFIG.getApiUrl(`/devices/${deviceId}/firmwares`), {
            method: 'GET',
            headers: headers
        });
        
        if (response.ok) {
            const firmwares = await response.json();
            console.log('Загруженные прошивки:', firmwares); // Для отладки
            
            // Скрываем загрузку
            firmwaresLoading.classList.add('d-none');
            
            // Обновляем счетчик прошивок
            document.querySelector('.firmware-count').textContent = firmwares.length ? `${firmwares.length} шт.` : '0';
            
            if (firmwares && firmwares.length > 0) {
                // Отображаем список прошивок
                firmwaresList.innerHTML = '';
                
                firmwares.forEach(firmware => {
                    const firmwareItem = document.createElement('div');
                    firmwareItem.className = 'firmware-item card mb-3';
                    firmwareItem.setAttribute('data-firmware-id', firmware.id);
                    
                    firmwareItem.innerHTML = `
                        <div class="card-body p-3">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h6 class="fw-bold mb-0 text-dark">Версия ${firmware.version || 'Не указана'}</h6>
                                <span class="badge bg-info text-white rounded-pill">${firmware.firmwareSize ? formatSize(firmware.firmwareSize) : 'Размер не указан'}</span>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">
                                    <i class="bi bi-calendar-date me-1"></i>
                                    ${firmware.uploadDate ? new Date(firmware.uploadDate).toLocaleDateString() : 'Дата не указана'}
                                </small>
                                <button class="btn btn-sm btn-outline-primary rounded-pill view-firmware-btn">
                                    <i class="bi bi-info-circle me-1"></i>Подробнее
                                </button>
                            </div>
                        </div>
                    `;
                    
                    firmwaresList.appendChild(firmwareItem);
                });
                
                // Добавляем обработчики для кнопок просмотра прошивки
                document.querySelectorAll('.view-firmware-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        e.stopPropagation(); // Предотвращаем всплытие события
                        const firmwareId = button.closest('.firmware-item').getAttribute('data-firmware-id');
                        // Здесь можно добавить функционал для просмотра прошивки
                        console.log('Просмотр прошивки:', firmwareId);
                    });
                });
                
                firmwaresList.classList.remove('d-none');
            } else {
                // Показываем сообщение об отсутствии прошивок
                noFirmwares.classList.remove('d-none');
            }
        } else {
            throw new Error(`Ошибка загрузки прошивок: ${response.status}`);
        }
    } catch (error) {
        console.error('Ошибка при загрузке прошивок:', error);
        
        // Отображаем сообщение об ошибке
        document.getElementById('firmwares-loading').classList.add('d-none');
        document.getElementById('firmwares-list').innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                Не удалось загрузить информацию о прошивках. Пожалуйста, попробуйте позже.
            </div>
        `;
        document.getElementById('firmwares-list').classList.remove('d-none');
    }
}

// Форматирование размера файла
function formatSize(bytes) {
    if (bytes === 0) return '0 Байт';
    
    const k = 1024;
    const sizes = ['Байт', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Показать состояние загрузки
function showLoadingState() {
    document.getElementById('loading-state').classList.remove('d-none');
    document.getElementById('empty-state').classList.add('d-none');
    document.getElementById('devices-list').classList.add('d-none');
}

// Скрыть состояние загрузки
function hideLoadingState() {
    document.getElementById('loading-state').classList.add('d-none');
    document.getElementById('devices-list').classList.remove('d-none');
}

// Показать пустое состояние
function showEmptyState(message) {
    const emptyState = document.getElementById('empty-state');
    const messageElement = emptyState.querySelector('p');
    
    if (message && messageElement) {
        messageElement.textContent = message;
    }
    
    document.getElementById('loading-state').classList.add('d-none');
    document.getElementById('devices-list').classList.add('d-none');
    emptyState.classList.remove('d-none');
} 