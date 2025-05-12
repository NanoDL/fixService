import '../../../styles/main.scss';
import { loadHeader } from '../../../scripts/common';
import { initNavigation } from '../../../scripts/navigation';
import { isAuthenticated, isAdmin, isMaster } from '../../../scripts/userUtils';
import API_CONFIG from '../../../../api.config';

// Массив для хранения добавленных устройств
let selectedDevices = [];

// Инициализация страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем авторизацию и права доступа
    if (!isAuthenticated()) {
        window.location.href = '/login';
        return;
    }
    
    // Только мастера и администраторы могут добавлять прошивки
    if (!isAdmin() && !isMaster()) {
        window.location.href = '/firmwares';
        return;
    }
    
    // Загружаем хедер
    loadHeader();
    
    // Инициализируем навигацию
    initNavigation();
    
    // Загружаем типы устройств и производителей
    loadDeviceTypes();
    loadManufacturers();
    
    // Инициализируем обработчики события изменения типа устройства и производителя
    initDeviceTypeChangeHandler();
    initManufacturerChangeHandler();
    
    // Инициализируем валидацию формы
    initFormValidation();
    
    // Инициализируем обработчики добавления устройств
    initDeviceHandlers();
    
    // Обработчик отправки формы
    document.getElementById('add-firmware-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitForm();
        }
    });
    
    // Обработчик кнопки "Добавить еще прошивку"
    document.getElementById('add-another-firmware').addEventListener('click', function(e) {
        e.preventDefault();
        resetForm();
    });
    
    // Обработчик кнопки "Попробовать снова"
    document.getElementById('try-again-btn').addEventListener('click', function(e) {
        e.preventDefault();
        hideErrorMessage();
        document.getElementById('add-firmware-form').classList.remove('d-none');
    });
});

// Загрузка типов устройств
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
            showErrorMessage('Не удалось загрузить типы устройств. Пожалуйста, обновите страницу.');
        }
    } catch (error) {
        console.error('Ошибка при загрузке типов устройств:', error);
        showErrorMessage('Произошла ошибка при загрузке типов устройств.');
    }
}

// Загрузка производителей
async function loadManufacturers() {
    try {
        const token = localStorage.getItem('jwt-token');
        const headers = token ? {'Authorization': `Bearer ${token}`} : {};

        const response = await fetch(API_CONFIG.getApiUrl('/devices/manufacturers'), {
            method: 'GET',
            headers: headers
        });

        if (response.ok) {
            const manufacturers = await response.json();
            populateManufacturerSelect(manufacturers);
        } else {
            console.error('Ошибка при загрузке производителей:', response.status);
            showErrorMessage('Не удалось загрузить список производителей.');
        }
    } catch (error) {
        console.error('Ошибка при загрузке производителей:', error);
        showErrorMessage('Произошла ошибка при загрузке производителей.');
    }
}

// Загрузка устройств по типу и производителю
async function loadCompatibleDevices() {
    const deviceType = document.getElementById('deviceType').value;
    const manufacturer = document.getElementById('manufacturer').value;
    
    if (!deviceType || !manufacturer) {
        return;
    }
    
    try {
        const token = localStorage.getItem('jwt-token');
        const headers = token ? {'Authorization': `Bearer ${token}`} : {};
        
        const response = await fetch(API_CONFIG.getApiUrl(`/devices/type/${deviceType}/manufacturer/${manufacturer}`), {
            method: 'GET',
            headers: headers
        });
        
        if (response.ok) {
            const devices = await response.json();
            populateDevicesSelect(devices);
        } else {
            console.error('Ошибка при загрузке устройств:', response.status);
        }
    } catch (error) {
        console.error('Ошибка при загрузке устройств:', error);
    }
}

// Заполнение выпадающего списка типов устройств
function populateDeviceTypeSelect(deviceTypes) {
    const selectElement = document.getElementById('deviceType');
    
    // Очистка текущих опций, кроме первого элемента "Выберите тип устройства"
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

// Заполнение выпадающего списка производителей
function populateManufacturerSelect(manufacturers) {
    const selectElement = document.getElementById('manufacturer');
    
    // Очистка текущих опций, кроме первого элемента
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

// Заполнение выпадающего списка совместимых устройств
function populateDevicesSelect(devices) {
    const selectElement = document.getElementById('existingDevice');
    
    // Очистка текущих опций, кроме первого элемента
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }
    
    // Добавление устройств в список
    devices.forEach(device => {
        // Проверяем, что этого устройства еще нет в выбранных
        const isAlreadySelected = selectedDevices.some(selected => selected.id === device.id);
        
        if (!isAlreadySelected) {
            const option = document.createElement('option');
            option.value = device.id;
            option.textContent = device.name;
            option.dataset.deviceType = device.type;
            option.dataset.manufacturer = device.manufacturer;
            selectElement.appendChild(option);
        }
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

// Инициализация обработчика изменения типа устройства
function initDeviceTypeChangeHandler() {
    document.getElementById('deviceType').addEventListener('change', loadCompatibleDevices);
}

// Инициализация обработчика изменения производителя
function initManufacturerChangeHandler() {
    document.getElementById('manufacturer').addEventListener('change', loadCompatibleDevices);
}

// Инициализация обработчиков для добавления устройств
function initDeviceHandlers() {
    // Добавление существующего устройства
    document.getElementById('addExistingDeviceBtn').addEventListener('click', function() {
        const select = document.getElementById('existingDevice');
        const selectedOption = select.options[select.selectedIndex];
        
        if (select.value) {
            const deviceId = select.value;
            const deviceName = selectedOption.textContent;
            const deviceType = selectedOption.dataset.deviceType;
            const deviceManufacturer = selectedOption.dataset.manufacturer;
            
            addDeviceToList({
                id: deviceId,
                name: deviceName,
                type: deviceType,
                manufacturer: deviceManufacturer
            });
            
            // Обновляем список доступных устройств
            select.removeChild(selectedOption);
            
            if (select.options.length <= 1) {
                select.disabled = true;
                document.getElementById('addExistingDeviceBtn').disabled = true;
            }
        }
    });
    
    // Добавляем поле и кнопку для ручного ввода имени устройства
    const deviceSelectRow = document.querySelector('.compatible-devices-container').parentElement;
    
    const manualDeviceRow = document.createElement('div');
    manualDeviceRow.className = 'row mt-3';
    manualDeviceRow.innerHTML = `
        <div class="col-md-6 mb-3">
            <label for="manualDeviceName" class="form-label">Или введите название устройства вручную</label>
            <input type="text" class="form-control" id="manualDeviceName" placeholder="Название устройства">
        </div>
        <div class="col-md-6 mb-3 d-flex align-items-end">
            <button type="button" id="addManualDeviceBtn" class="btn btn-outline-primary">
                <i class="bi bi-plus-circle me-2"></i>Добавить устройство
            </button>
        </div>
    `;
    
    deviceSelectRow.appendChild(manualDeviceRow);
    
    // Обработчик для добавления устройства вручную
    document.getElementById('addManualDeviceBtn').addEventListener('click', function() {
        const deviceNameInput = document.getElementById('manualDeviceName');
        const deviceName = deviceNameInput.value.trim();
        
        if (deviceName) {
            const deviceType = document.getElementById('deviceType').value;
            const manufacturer = document.getElementById('manufacturer').value;
            
            // Генерируем временный ID для устройства
            const tempId = 'manual_' + Date.now();
            
            addDeviceToList({
                id: tempId,
                name: deviceName,
                type: deviceType,
                manufacturer: manufacturer
            });
            
            // Очищаем поле ввода
            deviceNameInput.value = '';
        }
    });
}

// Добавление устройства в список выбранных
function addDeviceToList(device) {
    // Проверяем, не добавлено ли уже это устройство
    if (selectedDevices.some(d => d.id === device.id)) {
        return;
    }
    
    // Добавляем устройство в массив выбранных
    selectedDevices.push(device);
    
    // Скрываем сообщение о том, что устройства не добавлены
    document.getElementById('no-devices-message').classList.add('d-none');
    
    // Создаем элемент списка
    const devicesList = document.getElementById('compatible-devices-list');
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
    listItem.dataset.deviceId = device.id;
    
    // Добавляем информацию об устройстве
    const deviceInfo = document.createElement('div');
    deviceInfo.innerHTML = `
        <strong>${device.name}</strong>
        <div class="text-muted small">${device.manufacturer} | ${formatDeviceType(device.type)}</div>
    `;
    
    // Добавляем кнопку удаления
    const removeButton = document.createElement('button');
    removeButton.className = 'btn btn-sm btn-outline-danger';
    removeButton.innerHTML = '<i class="bi bi-trash"></i>';
    removeButton.addEventListener('click', function() {
        removeDeviceFromList(device.id);
    });
    
    // Собираем элемент списка
    listItem.appendChild(deviceInfo);
    listItem.appendChild(removeButton);
    devicesList.appendChild(listItem);
}

// Удаление устройства из списка выбранных
function removeDeviceFromList(deviceId) {
    // Удаляем устройство из массива
    selectedDevices = selectedDevices.filter(device => device.id !== deviceId);
    
    // Удаляем элемент из DOM
    const listItem = document.querySelector(`#compatible-devices-list li[data-device-id="${deviceId}"]`);
    if (listItem) {
        listItem.remove();
    }
    
    // Если список пуст, показываем сообщение
    if (selectedDevices.length === 0) {
        document.getElementById('no-devices-message').classList.remove('d-none');
    }
    
    // Обновляем список доступных устройств
    loadCompatibleDevices();
}

// Инициализация валидации формы
function initFormValidation() {
    const form = document.getElementById('add-firmware-form');
    
    // Добавляем обработчики событий для проверки валидности полей при потере фокуса
    form.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
    });
}

// Валидация отдельного поля
function validateInput(input) {
    if (input.hasAttribute('required') && !input.value.trim()) {
        input.classList.add('is-invalid');
        return false;
    } else {
        input.classList.remove('is-invalid');
        return true;
    }
}

// Валидация всей формы
function validateForm() {
    let isValid = true;
    
    // Проверяем все обязательные поля
    document.getElementById('add-firmware-form').querySelectorAll('input, select, textarea').forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Отправка формы
async function submitForm() {
    // Показываем индикатор загрузки
    showLoadingIndicator();
    
    try {
        // Собираем данные формы
        const formData = new FormData();
        formData.append('name', document.getElementById('firmwareName').value);
        formData.append('version', document.getElementById('firmwareVersion').value || '');
        formData.append('deviceType', document.getElementById('deviceType').value);
        formData.append('manufacturer', document.getElementById('manufacturer').value);
        formData.append('description', document.getElementById('description').value || '');
        
        // Добавляем файл
        const fileInput = document.getElementById('firmwareFile');
        if (fileInput.files.length > 0) {
            formData.append('file', fileInput.files[0]);
        }
        
        // Добавляем список совместимых устройств как deviceNames
        if (selectedDevices.length > 0) {
            selectedDevices.forEach(device => {
                formData.append('deviceNames', device.name);
            });
        }
        
        // Отправляем запрос
        const token = localStorage.getItem('jwt-token');
        const response = await fetch(API_CONFIG.getApiUrl('/firmwares'), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Прошивка успешно добавлена:', result);
            showSuccessMessage();
        } else {
            // Обрабатываем ошибку
            let errorMessage = 'Произошла ошибка при добавлении прошивки.';
            
            try {
                const errorData = await response.json();
                if (errorData && errorData.message) {
                    errorMessage += ' ' + errorData.message;
                }
            } catch (e) {
                // Если не удалось разобрать JSON
                errorMessage += ' Статус: ' + response.status;
            }
            
            showErrorMessage(errorMessage);
        }
    } catch (error) {
        console.error('Ошибка при отправке формы:', error);
        showErrorMessage('Произошла ошибка при отправке данных. Пожалуйста, попробуйте еще раз.');
    } finally {
        hideLoadingIndicator();
    }
}

// Показать индикатор загрузки
function showLoadingIndicator() {
    document.getElementById('add-firmware-form').classList.add('d-none');
    document.getElementById('loading-indicator').classList.remove('d-none');
}

// Скрыть индикатор загрузки
function hideLoadingIndicator() {
    document.getElementById('loading-indicator').classList.add('d-none');
}

// Показать сообщение об успехе
function showSuccessMessage() {
    document.getElementById('success-message').classList.remove('d-none');
}

// Показать сообщение об ошибке
function showErrorMessage(message) {
    document.getElementById('error-details').textContent = message;
    document.getElementById('error-message').classList.remove('d-none');
}

// Скрыть сообщение об ошибке
function hideErrorMessage() {
    document.getElementById('error-message').classList.add('d-none');
}

// Сброс формы
function resetForm() {
    // Скрываем сообщения
    document.getElementById('success-message').classList.add('d-none');
    document.getElementById('error-message').classList.add('d-none');
    
    // Очищаем форму
    document.getElementById('add-firmware-form').reset();
    
    // Очищаем список устройств
    selectedDevices = [];
    document.getElementById('compatible-devices-list').innerHTML = '';
    document.getElementById('no-devices-message').classList.remove('d-none');
    
    // Перезагружаем списки
    loadDeviceTypes();
    loadManufacturers();
    
    // Показываем форму
    document.getElementById('add-firmware-form').classList.remove('d-none');
} 