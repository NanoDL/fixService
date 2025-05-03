import '../../styles/main.scss';
import { loadHeader } from '../../scripts/common';

// Загрузка хедера
document.addEventListener('DOMContentLoaded', () => {
    loadHeader();
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
}

// Загрузка типов устройств с сервера
async function loadDeviceTypes() {
    try {
        const response = await fetch('/api/devices/types');
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
        'LAPTOP': 'Ноутбук',
        'TV': 'Телевизор',
        'SMART_WATCH': 'Умные часы',
        'ROUTER': 'Роутер',
        'OTHER': 'Другое'
    };
    
    return typeMap[type] || type;
}

// Загрузка производителей с сервера
async function loadManufacturers() {
    try {
        // Этот эндпоинт нужно создать на бэкенде
        const response = await fetch('/api/devices/manufacturers');
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
async function loadDevices(page = 1, filters = {}) {
    showLoadingState();
    
    try {
        // Формирование параметров запроса
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        
        // Добавление фильтров в параметры запроса
        if (filters.type) queryParams.append('type', filters.type);
        if (filters.manufacturer) queryParams.append('manufacturer', filters.manufacturer);
        if (filters.search) queryParams.append('search', filters.search);
        
        // Запрос на сервер
        const response = await fetch(`/api/devices?${queryParams.toString()}`);
        
        if (response.ok) {
            // Предполагается, что сервер возвращает объект с полями:
            // {
            //   content: [...],  // массив устройств
            //   totalPages: 10,  // общее количество страниц
            //   currentPage: 1,  // текущая страница
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
            console.error('Ошибка при загрузке устройств:', response.status);
            showEmptyState('Ошибка загрузки устройств');
        }
    } catch (error) {
        console.error('Ошибка при загрузке устройств:', error);
        showEmptyState('Ошибка загрузки устройств');
    }
}

// Отрисовка устройств на странице
function renderDevices(devices) {
    const devicesList = document.getElementById('devices-list');
    const template = document.querySelector('.device-card-template');
    
    // Очистка списка устройств
    devicesList.innerHTML = '';
    
    // Отрисовка каждого устройства
    devices.forEach(device => {
        const deviceElement = template.cloneNode(true);
        
        // Удаление класса d-none и template
        deviceElement.classList.remove('d-none', 'device-card-template');
        
        // Заполнение данными устройства
        deviceElement.querySelector('.device-name').textContent = device.name;
        deviceElement.querySelector('.device-manufacturer').textContent = device.manufacturer;
        deviceElement.querySelector('.device-type-badge .badge').textContent = formatDeviceType(device.type);
        
        // Установка количества прошивок
        const firmwareCount = device.compatibleFirmwares ? device.compatibleFirmwares.length : 0;
        deviceElement.querySelector('.firmware-count').textContent = firmwareCount;
        
        // Установка ссылки на детальную страницу устройства
        deviceElement.querySelector('.view-device-btn').href = `/devices/${device.id}`;
        
        // Добавление карточки устройства в список
        devicesList.appendChild(deviceElement);
    });
}

// Отрисовка пагинации
function renderPagination(currentPage, totalPages) {
    const paginationElement = document.getElementById('pagination');
    
    // Очистка пагинации
    paginationElement.innerHTML = '';
    
    // Кнопка "Предыдущая"
    const prevButton = createPaginationItem('предыдущая', currentPage > 1, currentPage - 1);
    paginationElement.appendChild(prevButton);
    
    // Номера страниц
    for (let i = 1; i <= totalPages; i++) {
        const pageItem = createPaginationItem(i.toString(), true, i, i === currentPage);
        paginationElement.appendChild(pageItem);
    }
    
    // Кнопка "Следующая"
    const nextButton = createPaginationItem('следующая', currentPage < totalPages, currentPage + 1);
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
        loadDevices(1, getCurrentFilters());
    });
    
    // Также можно добавить обработчики для фильтрации при изменении select-элементов
    document.getElementById('deviceType').addEventListener('change', () => {
        loadDevices(1, getCurrentFilters());
    });
    
    document.getElementById('manufacturer').addEventListener('change', () => {
        loadDevices(1, getCurrentFilters());
    });
}

// Инициализация обработчиков пагинации
function initPaginationHandlers() {
    // Обработчики добавляются динамически при рендеринге пагинации
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