import '../../styles/main.scss';
import '../../styles/pages/firmwares.scss';
import {loadHeader} from '../../scripts/common';
import {initNavigation} from '../../scripts/navigation';
import {isAuthenticated, isAdmin, isMaster} from '../../scripts/userUtils';
import API_CONFIG from '../../../api.config';
import * as bootstrap from 'bootstrap';

// Глобальные переменные для пагинации и фильтров
let currentPage = 0;
let currentFilters = {};

// Загрузка хедера
document.addEventListener('DOMContentLoaded', () => {
    loadHeader();
    // Инициализация навигации
    initNavigation();
    initFirmwaresPage();
});

// Инициализация страницы прошивок
function initFirmwaresPage() {
    $('.device-filter').hide();


    loadDeviceTypes();
    loadManufacturers();
    loadDevices();
    loadFirmwares();

    // Инициализация обработчиков событий
    initFilterHandlers();
    initPaginationHandlers();
    initModalHandlers();

    // Проверяем, может ли пользователь добавлять прошивки
    checkAddFirmwarePermissions();
}

// Проверка прав на добавление прошивок
function checkAddFirmwarePermissions() {
    if (isAuthenticated() && (isAdmin() || isMaster())) {
        // Добавляем кнопку для создания новой прошивки
        const addButton = `
            <div class="col-12 text-end mb-4">
                <a href="/firmwares/add" class="btn btn-primary">
                    <i class="bi bi-plus-circle me-2"></i>Добавить прошивку
                </a>
            </div>
        `;

        // Вставляем кнопку перед списком прошивок
        $('#firmwares-list').before(addButton);

        // Добавляем кнопку на случай пустого состояния
        const addButtonEmpty = `
            <a href="/firmwares/add" class="btn btn-primary mt-3">
                <i class="bi bi-plus-circle me-2"></i>Добавить прошивку
            </a>
        `;

        $('#add-firmware-btn-container').html(addButtonEmpty);
    }
}

// Загрузка типов устройств с сервера
async function loadDeviceTypes() {
    try {
        const token = localStorage.getItem('jwt-token');
        const headers = token ? {'Authorization': `Bearer ${token}`} : {};

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

async function loadDevices() {
    const manufacturer = document.getElementById('manufacturer');
    const deviceType = document.getElementById('deviceType');

    // Проверяем, что значения deviceType и manufacturer не пустые
    if (!deviceType.value || !manufacturer.value) {
        console.log('Тип устройства или производитель не выбраны');
        return;
    }

    try {
        const token = localStorage.getItem('jwt-token');
        const headers = token ? {'Authorization': `Bearer ${token}`} : {};

        const response = await fetch(API_CONFIG.getApiUrl(`/devices/type/${deviceType.value}/manufacturer/${manufacturer.value}`),{
            method: 'GET',
            headers: headers
        });
        if (response.ok){
            const devices = await response.json();
            populateDevicesSelect(devices);
        } else {
            console.error('Ошибка при загрузке устройств', response.status);
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

function populateDevicesSelect(devices){
    const selectElement = document.getElementById('device');

    while (selectElement.options.length > 1){
        selectElement.remove(1);
    }

    devices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.name;
        option.textContent = device.name;
        selectElement.appendChild(option);
    })
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
        const headers = token ? {'Authorization': `Bearer ${token}`} : {};

        // Используем эндпоинт для получения производителей
        const response = await fetch(API_CONFIG.getApiUrl('/devices/manufacturers'), {
            method: 'GET',
            headers: headers
        });

        if (response.ok) {
            const manufacturers = await response.json();
            populateManufacturerSelect(manufacturers);
            return manufacturers;
        } else {
            console.error('Ошибка при загрузке производителей:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Ошибка при загрузке производителей:', error);
        return null;
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

// Загрузка прошивок с сервера
async function loadFirmwares(page = 0, filters = {}) {
    // page начинается с 0, так как на бэкенде пагинация начинается с 0
    showLoadingState();

    try {
        // Получаем токен авторизации
        const token = localStorage.getItem('jwt-token');
        const headers = token ? {'Authorization': `Bearer ${token}`} : {};

        // Формирование параметров запроса
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('size', 10); // Количество элементов на странице

        // Добавление фильтров в параметры запроса
        if (filters.type) queryParams.append('type', filters.type);
        if (filters.manufacturer) queryParams.append('manufacturer', filters.manufacturer);
        if (filters.search) queryParams.append('search', filters.search);

        // Запрос на сервер с заголовком авторизации
        const response = await fetch(API_CONFIG.getApiUrl(`/firmwares?${queryParams.toString()}`), {
            method: 'GET',
            headers: headers
        });

        if (response.ok) {
            const data = await response.json();

            // Проверяем, есть ли содержимое в ответе
            if (data.content && data.content.length > 0) {
                renderFirmwares(data.content);
                renderPagination(data.number, data.totalPages);
                hideLoadingState();
            } else {
                showEmptyState();
            }
        } else {
            if (response.status === 403) {
                console.error('Доступ запрещен. Необходима авторизация или повышение прав доступа.');
                showEmptyState('Доступ запрещен. Для просмотра прошивок необходимо авторизоваться как мастер или администратор.');
            } else {
                console.error('Ошибка при загрузке прошивок:', response.status);
                showEmptyState('Ошибка загрузки прошивок');
            }
        }
    } catch (error) {
        console.error('Ошибка при загрузке прошивок:', error);
        showEmptyState('Ошибка загрузки прошивок');
    }
}

// Отрисовка списка прошивок
function renderFirmwares(firmwares) {
    const firmwaresContainer = document.getElementById('firmwares-list');
    // Очищаем контейнер перед добавлением новых карточек
    firmwaresContainer.innerHTML = '';

    // Создаем карточку для каждой прошивки
    firmwares.forEach(firmware => {
        const firmwareCard = createFirmwareCard(firmware);
        firmwaresContainer.appendChild(firmwareCard);
    });

    // Показываем контейнер с прошивками
    firmwaresContainer.classList.remove('d-none');
}

// Создание карточки прошивки
function createFirmwareCard(firmware) {
    const templateHTML = `
<div class="col-lg-4 col-md-6 mb-4 firmware-card d-none">
  <div class="card h-100 shadow-sm">
    <div class="firmware-type-badge">
      <span class="badge bg-primary">Тип устройства</span>
    </div>
    <div class="card-body">
      <h5 class="card-title firmware-name">Название прошивки</h5>
      <p class="card-text text-muted firmware-manufacturer">Производитель</p>
      <div class="firmware-info">
        <p class="mb-2"><i class="bi bi-tag me-2"></i><span class="firmware-version">1.0.0</span></p>
        <p class="mb-2"><i class="bi bi-calendar me-2"></i><span class="firmware-date">01.01.2023</span></p>
        <p class="mb-2"><i class="bi bi-devices me-2"></i><span class="compatible-devices-count">3</span> совместимых устройств</p>
      </div>
    </div>
    <div class="card-footer bg-white border-top-0">
      <div class="d-grid">
        <a href="#" class="btn btn-outline-primary view-firmware-btn">Подробнее</a>
      </div>
    </div>
  </div>
</div>
`;


        const container = document.createElement('div');
        container.innerHTML = templateHTML.trim();



    const card = container.firstElementChild.cloneNode(true);
    card.classList.remove('d-none', 'firmware-card-template');

    // Заполняем данными
    card.querySelector('.firmware-name').textContent = firmware.name;
    card.querySelector('.firmware-manufacturer').textContent = firmware.manufacturer || 'Не указан';
    card.querySelector('.firmware-version').textContent = firmware.version || 'Не указана';

    // Форматируем дату
    const uploadDate = firmware.uploadDate ? new Date(firmware.uploadDate) : null;
    card.querySelector('.firmware-date').textContent = uploadDate ?
        uploadDate.toLocaleDateString('ru-RU') : 'Не указана';

    // Показываем типы устройств
    card.querySelector('.firmware-type-badge span').textContent = formatDeviceType(firmware.deviceType);

    // Количество совместимых устройств
    const compatibleDevicesCount = firmware.compatibleDevices ? firmware.compatibleDevices.length : 0;
    card.querySelector('.compatible-devices-count').textContent = compatibleDevicesCount;

    // Добавляем обработчик события для кнопки "Подробнее"
    const viewButton = card.querySelector('.view-firmware-btn');
    viewButton.addEventListener('click', (e) => {
        e.preventDefault();
        openFirmwareDetailsModal(firmware.id);
    });

    return card;
}

// Отрисовка пагинации
function renderPagination(currentPage, totalPages) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    // Если страниц меньше 2, не показываем пагинацию
    if (totalPages <= 1) return;

    // Кнопка "Предыдущая"
    const prevItem = createPaginationItem('<i class="bi bi-chevron-left"></i>', currentPage > 0, currentPage - 1);
    if (currentPage === 0) prevItem.classList.add('disabled');
    paginationContainer.appendChild(prevItem);

    // Отображаем максимум 5 страниц
    const maxVisiblePages = 5;
    let startPage = Math.max(0, Math.min(currentPage - Math.floor(maxVisiblePages / 2), totalPages - maxVisiblePages));
    let endPage = Math.min(startPage + maxVisiblePages, totalPages);

    // Если количество страниц меньше максимального отображаемого
    if (endPage - startPage < maxVisiblePages) {
        startPage = Math.max(0, endPage - maxVisiblePages);
    }

    // Создаем пункты для каждой страницы
    for (let i = startPage; i < endPage; i++) {
        const pageItem = createPaginationItem(i + 1, true, i, i === currentPage);
        paginationContainer.appendChild(pageItem);
    }

    // Кнопка "Следующая"
    const nextItem = createPaginationItem('<i class="bi bi-chevron-right"></i>', currentPage < totalPages - 1, currentPage + 1);
    if (currentPage === totalPages - 1) nextItem.classList.add('disabled');
    paginationContainer.appendChild(nextItem);
}

// Создание элемента пагинации
function createPaginationItem(text, enabled, page, active = false) {
    const li = document.createElement('li');
    li.className = 'page-item';
    if (active) li.classList.add('active');
    if (!enabled) li.classList.add('disabled');

    const a = document.createElement('a');
    a.className = 'page-link';
    a.href = '#';
    a.innerHTML = text;

    if (enabled) {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = page;
            loadFirmwares(currentPage, currentFilters);
        });
    }

    li.appendChild(a);
    return li;
}

// Получение текущих фильтров из формы
function getCurrentFilters() {
    return {
        type: document.getElementById('deviceType').value,
        manufacturer: document.getElementById('manufacturer').value,
        search: document.getElementById('searchQuery').value,
        device: document.getElementById('device').value
    };
}

// Инициализация обработчиков событий для фильтров
function initFilterHandlers() {
    document.getElementById('firmware-filter-form').addEventListener('submit', (e) => {
        e.preventDefault();
        currentFilters = getCurrentFilters();
        currentPage = 0; // Сбрасываем страницу на первую при применении фильтра
        loadFirmwares(currentPage, currentFilters);
    });

    // Обработчики изменения селектов (опционально, если нужна мгновенная фильтрация)
    document.getElementById('deviceType').addEventListener('change', () => {
        if ((document.getElementById('manufacturer').value === "") || (document.getElementById('deviceType').value === "")){
            $('.device-filter').hide();
        } else {
            $('.device-filter').show();
            loadDevices();
        }
        document.getElementById('firmware-filter-form').dispatchEvent(new Event('submit'));
    });

    document.getElementById('manufacturer').addEventListener('change', () => {
        if ((document.getElementById('manufacturer').value === "") || (document.getElementById('deviceType').value === "")){
            $('.device-filter').hide();
        } else {
            $('.device-filter').show();
            loadDevices();
        }
        document.getElementById('firmware-filter-form').dispatchEvent(new Event('submit'));
    });

    document.getElementById('device').addEventListener('change', () => {
        document.getElementById('firmware-filter-form').dispatchEvent(new Event('submit'));
    })
}

// Инициализация обработчиков событий для пагинации
function initPaginationHandlers() {
    // Пагинация обрабатывается внутри createPaginationItem
}

// Инициализация обработчиков событий для модального окна
function initModalHandlers() {
    // Модальное окно для деталей прошивки
    const firmwareDetailsModal = document.getElementById('firmwareDetailsModal');
    const downloadButton = document.getElementById('download-firmware-btn');

    // Обработчик клика по кнопке скачивания
    downloadButton.addEventListener('click', function (e) {
        e.preventDefault();
        const firmwareId = this.getAttribute('data-firmware-id');
        if (firmwareId) {
            window.location.href = API_CONFIG.getApiUrl(`/firmwares/${firmwareId}/download`);
        }
    });
}

// Открытие модального окна с информацией о прошивке
async function openFirmwareDetailsModal(firmwareId) {
    try {
        const firmwareDetails = await loadFirmwareDetails(firmwareId);

        // Заполняем модальное окно данными о прошивке
        document.getElementById('firmware-detail-name').textContent = firmwareDetails.name;
        document.getElementById('firmware-detail-version').textContent = firmwareDetails.version || 'Не указана';
        document.getElementById('firmware-detail-manufacturer').textContent = firmwareDetails.manufacturer || 'Не указан';
        document.getElementById('firmware-detail-device-type').textContent = formatDeviceType(firmwareDetails.deviceType);
        
        // Добавляем в бейджи в заголовке
        document.getElementById('firmware-detail-device-type-badge').textContent = formatDeviceType(firmwareDetails.deviceType);
        document.getElementById('firmware-detail-manufacturer-badge').textContent = firmwareDetails.manufacturer || 'Не указан';

        // Форматируем дату
        const uploadDate = firmwareDetails.uploadDate ? new Date(firmwareDetails.uploadDate) : null;
        document.getElementById('firmware-detail-date').textContent = uploadDate ?
            uploadDate.toLocaleDateString('ru-RU') : 'Не указана';

        // Добавляем информацию о пользователе, который загрузил прошивку
        if (firmwareDetails.uploadedBy) {
            document.getElementById('firmware-detail-uploaded-by').textContent = 
                `${firmwareDetails.uploadedBy.firstName || ''} ${firmwareDetails.uploadedBy.lastName || ''}`.trim() || 
                firmwareDetails.uploadedBy.username || 'Неизвестно';
        } else {
            document.getElementById('firmware-detail-uploaded-by').textContent = 'Не указан';
        }

        // Добавляем информацию о файле
        const fileName = firmwareDetails.fileUrl ? 
            firmwareDetails.fileUrl.split('/').pop() : 'firmware.bin';
        document.getElementById('firmware-detail-file-url').textContent = fileName;

        // Описание
        document.getElementById('firmware-detail-description').textContent =
            firmwareDetails.description || 'Описание отсутствует';

        // Совместимые устройства
        const devicesList = document.getElementById('compatible-devices-list');
        devicesList.innerHTML = '';

        // Обновляем счетчик устройств
        const devicesCount = firmwareDetails.compatibleDevices ? firmwareDetails.compatibleDevices.length : 0;
        document.getElementById('devices-counter').textContent = devicesCount;

        if (firmwareDetails.compatibleDevices && firmwareDetails.compatibleDevices.length > 0) {
            firmwareDetails.compatibleDevices.forEach(device => {
                const deviceItem = document.createElement('li');
                deviceItem.className = 'list-group-item d-flex justify-content-between align-items-center';

                const deviceInfo = document.createElement('div');
                
                const deviceName = document.createElement('h6');
                deviceName.className = 'mb-0';
                deviceName.textContent = `${device.manufacturer} ${device.name}`;
                deviceInfo.appendChild(deviceName);
                
                if (device.description) {
                    const deviceDesc = document.createElement('small');
                    deviceDesc.className = 'text-muted';
                    deviceDesc.textContent = device.description;
                    deviceInfo.appendChild(deviceDesc);
                }
                
                deviceItem.appendChild(deviceInfo);

                const deviceBadge = document.createElement('span');
                deviceBadge.className = 'badge bg-primary rounded-pill';
                deviceBadge.textContent = formatDeviceType(device.deviceType);
                deviceItem.appendChild(deviceBadge);

                devicesList.appendChild(deviceItem);
            });
        } else {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'list-group-item text-center text-muted py-3';
            emptyItem.innerHTML = '<i class="bi bi-exclamation-circle me-2"></i>Нет совместимых устройств';
            devicesList.appendChild(emptyItem);
        }

        // Обновляем ID прошивки для кнопки скачивания
        document.getElementById('download-firmware-btn').setAttribute('data-firmware-id', firmwareId);

        // Открываем модальное окно
        const modal = new bootstrap.Modal(document.getElementById('firmwareDetailsModal'));
        modal.show();
    } catch (error) {
        console.error('Ошибка при загрузке данных о прошивке:', error);

        // Показываем сообщение об ошибке
        alert('Ошибка при загрузке данных о прошивке. Пожалуйста, попробуйте позже.');
    }
}

// Загрузка информации о прошивке
async function loadFirmwareDetails(firmwareId) {
    const token = localStorage.getItem('jwt-token');
    const headers = token ? {'Authorization': `Bearer ${token}`} : {};

    const response = await fetch(API_CONFIG.getApiUrl(`/firmwares/${firmwareId}`), {
        method: 'GET',
        headers: headers
    });

    if (!response.ok) {
        throw new Error(`Ошибка при загрузке информации о прошивке: ${response.status}`);
    }

    return await response.json();
}

// Функции для отображения состояния загрузки и пустого состояния
function showLoadingState() {
    document.getElementById('loading-state').classList.remove('d-none');
    document.getElementById('empty-state').classList.add('d-none');
    document.getElementById('firmwares-list').classList.add('d-none');
}

function hideLoadingState() {
    document.getElementById('loading-state').classList.add('d-none');
}

function showEmptyState(message = 'Прошивки не найдены') {
    document.getElementById('loading-state').classList.add('d-none');
    document.getElementById('empty-state').classList.remove('d-none');
    document.getElementById('firmwares-list').classList.add('d-none');

    // Обновляем сообщение, если оно передано
    const emptyStateHeading = document.querySelector('#empty-state h3');
    if (emptyStateHeading) {
        emptyStateHeading.textContent = message;
    }
} 