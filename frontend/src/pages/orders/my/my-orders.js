// JavaScript для страницы "Мои заказы"
import '../../../styles/main.scss';
import $ from 'jquery';
import {loadHeader} from '@scripts/common';
import {initNavigation} from '@scripts/navigation';
import {isAuthenticated, isCustomer, isMaster} from '@scripts/userUtils';
import API_CONFIG from '../../../../api.config';

// Инициализация страницы
$(document).ready(function () {
    // Проверяем авторизацию
    if (!isAuthenticated()) {
        window.location.href = '/login';
        return;
    }

    // Загружаем хедер
    loadHeader();

    // Инициализируем навигацию
    initNavigation();

    // Настраиваем интерфейс в зависимости от роли
    setupUIForRole();

    // Загружаем заказы
    loadMyOrders();

    // Загружаем доступные заказы (только для мастеров)
    if (isMaster()) {
        loadAvailableOrders();
    }

    // Обработчики событий
    initEventHandlers();

    /*// Подключаемся к WebSocket
    connectWebSocket();*/
});

// Глобальные переменные для WebSocket
let stompClient = null;
let userId = null;

// Инициализация WebSocket соединения
/*function connectWebSocket() {
    // Получаем ID пользователя из JWT токена
    userId = getUserIdFromToken();

    if (!userId) {
        console.error('Не удалось получить ID пользователя для WebSocket');
        return;
    }

    const socket = new SockJS(API_CONFIG.getApiUrl('/ws'));
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function(frame) {
        console.log('Подключено к WebSocket: ' + frame);

        // Подписываемся на личные уведомления
        stompClient.subscribe('/topic/user/' + userId, function(notification) {
            handleNotification(JSON.parse(notification.body));
        });

        // Подписываемся на глобальные уведомления
        stompClient.subscribe('/topic/global', function(notification) {
            handleNotification(JSON.parse(notification.body));
        });
    }, function(error) {
        console.error('Ошибка подключения к WebSocket:', error);
        // Пробуем переподключиться через 5 секунд
        setTimeout(connectWebSocket, 5000);
    });
}*/

// Обработка входящих уведомлений
function handleNotification(notification) {
    console.log('Получено уведомление:', notification);

    // Обрабатываем разные типы уведомлений
    switch(notification.type) {
        case 'PRICE_UPDATED':
            showNotification(notification.message, 'info');
            // Если мы на странице с заказами, можно обновить данные
            if (window.location.pathname.includes('/orders/my')) {
                loadMyOrders();
            }
            break;
        // Другие типы уведомлений...
        default:
            showNotification(notification.message, 'info');
    }
}

// Получение ID пользователя из JWT токена
function getUserIdFromToken() {
    const token = localStorage.getItem('jwt-token');
    if (!token) return null;

    try {
        // JWT токен состоит из трех частей, разделенных точкой
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        return payload.id || payload.sub; // ID пользователя обычно хранится в поле 'sub' или 'id'
    } catch (e) {
        console.error('Ошибка при декодировании токена:', e);
        return null;
    }
}


// Настройка интерфейса в зависимости от роли
function setupUIForRole() {
    // Если пользователь - заказчик
    if (isCustomer()) {
        // Скрываем вкладку с доступными заказами
        $('#available-tab').parent().hide();
        // Показываем кнопку создания заказа в пустом блоке
        $('#createOrderBtn').show();
    }

    // Если пользователь - мастер
    if (isMaster()) {
        // Показываем вкладку с доступными заказами
        $('#available-tab').parent().show();
        // Скрываем кнопку создания заказа в пустом блоке
        $('#createOrderBtn').hide();
    }
}

// Загрузка моих заказов
function loadMyOrders() {
    $.ajax({
        url: API_CONFIG.getApiUrl('/orders/my'),
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
        },
        success: function (orders) {
            displayMyOrders(orders);
        },
        error: function (xhr) {
            console.error('Ошибка при загрузке заказов:', xhr);

            if (xhr.status === 401) {
                // Неавторизованный доступ - перенаправляем на страницу входа
                window.location.href = '/login';
            } else {
                // Показываем сообщение об ошибке
                showError('Не удалось загрузить список заказов');
            }
        }
    });
}

// Загрузка доступных заказов (для мастеров)
function loadAvailableOrders() {
    $.ajax({
        url: API_CONFIG.getApiUrl('/orders'),
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
        },
        success: function (orders) {
            displayAvailableOrders(orders);
        },
        error: function (xhr) {
            console.error('Ошибка при загрузке доступных заказов:', xhr);

            if (xhr.status === 401) {
                window.location.href = '/login';
            } else {
                // Показываем сообщение об ошибке
                showError('Не удалось загрузить список доступных заказов');
            }
        }
    });
}

// Отображение моих заказов
function displayMyOrders(orders) {
    if (!orders || orders.length === 0) {
        // Нет заказов - показываем заглушки
        $('#emptyActiveOrders').show();
        $('#emptyCompletedOrders').show();
        return;
    }

    // Разделяем заказы на активные и завершенные
    const activeOrders = orders.filter(order =>
        order.status !== 'COMPLETED' && order.status !== 'CANCELED');

    const completedOrders = orders.filter(order =>
        order.status === 'COMPLETED' || order.status === 'CANCELED');

    // Отображаем активные заказы
    if (activeOrders.length > 0) {
        const activeOrdersHtml = activeOrders.map(order => createOrderCard(order, 'active')).join('');
        $('#activeOrdersList').html(activeOrdersHtml);
        $('#emptyActiveOrders').hide();
    } else {
        $('#emptyActiveOrders').show();
    }

    // Отображаем завершенные заказы
    if (completedOrders.length > 0) {
        const completedOrdersHtml = completedOrders.map(order => createOrderCard(order, 'completed')).join('');
        $('#completedOrdersList').html(completedOrdersHtml);
        $('#emptyCompletedOrders').hide();
    } else {
        $('#emptyCompletedOrders').show();
    }
}

// Отображение доступных заказов
function displayAvailableOrders(orders) {
    if (!orders || orders.length === 0) {
        // Нет доступных заказов - показываем заглушку
        $('#emptyAvailableOrders').show();
        return;
    }

    // Отображаем доступные заказы
    const availableOrdersHtml = orders.map(order => createOrderCard(order, 'available')).join('');
    $('#availableOrdersList').html(availableOrdersHtml);
    $('#emptyAvailableOrders').hide();
}

// Создание карточки заказа
function createOrderCard(order, type) {
    const statusClass = getStatusClass(order.status);
    const statusText = getStatusText(order.status);
    const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('ru-RU') : 'Не указана';
    const repairTypeDisplayName = getRepairTypeDisplayName(order.repairType);

    let additionalInfo = '';
    let buttons = '';

    // Разные кнопки для разных типов заказов
    if (type === 'active') {
        buttons = `
            <div class="btn-group">
                <button class="btn btn-sm btn-primary btn-action view-order-details" data-order-id="${order.id}">
                    <i class="bi bi-eye"></i> Подробнее
                </button>
            </div>
        `;
    } else if (type === 'available' && isMaster()) {
        buttons = `
            <div class="btn-group">
                <button class="btn btn-sm btn-primary btn-action accept-order-btn" data-order-id="${order.id}">
                    <i class="bi bi-check-lg"></i> Принять заказ
                </button>
                <button class="btn btn-sm btn-outline-primary btn-action view-order-details" data-order-id="${order.id}">
                    <i class="bi bi-eye"></i> Подробнее
                </button>
            </div>
        `;
    } else if (type === 'completed') {
        buttons = `
            <div class="btn-group">
                <button class="btn btn-sm btn-outline-primary btn-action view-order-details" data-order-id="${order.id}">
                    <i class="bi bi-eye"></i> Подробнее
                </button>
            </div>
        `;
    }

    return `
        <div class="order-card" data-order-id="${order.id}">
            <div class="order-header">
                <div class="order-id">Заказ #${order.id}</div>
                <div class="order-status ${statusClass}">${statusText}</div>
            </div>
            <h3 class="order-title">${repairTypeDisplayName}</h3>
            <div class="order-details">
                <div class="order-detail">
                    <i class="bi bi-calendar3"></i> ${date}
                </div>
                <div class="order-detail">
                    <i class="bi bi-phone"></i> ${order.device ? order.device.name : 'Не указано'}
                </div>
                ${additionalInfo}
            </div>
            <div class="order-description">
                ${order.description || 'Описание отсутствует'}
            </div>
            <div class="order-footer">
                <div class="order-price">${order.price ? order.price + ' ₽' : 'Цена не указана'}</div>
                ${buttons}
            </div>
        </div>
    `;
}

// Получение класса статуса
function getStatusClass(status) {
    switch (status) {
        case 'NEW':
            return 'status-new';
        case 'ACCEPTED':
            return 'status-accepted';
        case 'IN_PROGRESS':
            return 'status-in-progress';
        case 'COMPLETED':
            return 'status-completed';
        case 'CANCELED':
            return 'status-canceled';
        default:
            return '';
    }
}

// Получение текста статуса
function getStatusText(status) {
    switch (status) {
        case 'NEW':
            return 'Новый';
        case 'ACCEPTED':
            return 'Принят';
        case 'IN_PROGRESS':
            return 'В процессе';
        case 'COMPLETED':
            return 'Завершен';
        case 'CANCELED':
            return 'Отменен';
        default:
            return 'Неизвестно';
    }
}

// Получить данные заказа для просмотра/редактирования
function getOrderDetails(orderId) {
    $.ajax({
        url: API_CONFIG.getApiUrl(`/orders/my/${orderId}`),
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
        },
        success: function (order) {
            console.log('Получены данные заказа:', order);
            showOrderModal(order);
        },
        error: function (xhr) {
            console.error('Ошибка при получении данных заказа:', xhr);

            if (xhr.status === 401) {
                window.location.href = '/login';
            } else {
                showError('Не удалось загрузить данные заказа');
            }
        }
    });
}

function getOrderDetailsForMaster(orderId) {
    $.ajax({
        url: API_CONFIG.getApiUrl(`/orders/${orderId}`),
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
        },
        success: function (order) {
            console.log('Получены данные заказа:', order);
            showOrderModal(order);
        },
        error: function (xhr) {
            console.error('Ошибка при получении данных заказа:', xhr);

            if (xhr.status === 401) {
                window.location.href = '/login';
            } else {
                showError('Не удалось загрузить данные заказа')
            }
        }
    });
}

// Показать модальное окно с подробной информацией о заказе
function showOrderModal(order) {
    // Заполняем основные данные
    $('#orderModalTitle').text(`Заказ #${order.id}`);
    $('#orderModalStatus').text(getStatusText(order.status)).attr('class', `order-status ${getStatusClass(order.status)}`);

    // Устанавливаем тип ремонта в select
    $('#orderModalType').val(order.repairType || 'DIAGNOSTIC');

    $('#orderModalDescription').val(order.description || '');
    $('#orderModalDevice').val(order.device ? order.device.name : 'Не указано');
    $('#orderModalPrice').val(order.price || '');

    const creationDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('ru-RU') : 'Не указана';
    $('#orderModalCreationDate').text(creationDate);

    // Если есть мастер, отображаем его данные
    if (order.master) {
        $('#orderModalMasterBlock').show();
        $('#orderModalMasterName').text(order.master.name);
        $('#orderModalMasterContact').text(order.master.phoneNumber || order.master.email || 'Не указаны');
    } else {
        $('#orderModalMasterBlock').hide();
    }

    // Показываем/скрываем кнопки в зависимости от статуса заказа и роли пользователя
    setupOrderModalActions(order);

    // Открываем модальное окно
    $('#orderDetailsModal').modal('show');
}

// Настройка доступных действий для заказа в модальном окне
function setupOrderModalActions(order) {
    // Скрываем все блоки действий по умолчанию
    $('.order-modal-actions').hide();
    $('#orderModalEditBlock').hide();
    $('#orderModalPriceBlock').hide();

    // Действия для заказчика
    if (isCustomer()) {
        if (order.status === 'NEW') {
            // Новый заказ - можно редактировать или удалить
            $('#orderModalCustomerNewActions').show();
            $('#orderModalEditBlock').show();
            enableOrderEditing(true);
        } else if (order.status === 'ACCEPTED') {
            // Принятый заказ - можно только отказаться от мастера
            $('#orderModalCustomerAcceptedActions').show();
            enableOrderEditing(false);
        } else {
            // Завершенный или отмененный заказ - только просмотр
            enableOrderEditing(false);
        }
    }

    // Действия для мастера
    if (isMaster()) {
        if (order.status === 'NEW') {
            // Новый заказ без мастера - можно принять
            $('#orderModalMasterNewActions').show();
        } else if (order.status === 'ACCEPTED') {
            // Принятый заказ - можно указать цену и запустить в работу
            $('#orderModalMasterAcceptedActions').show();
            $('#orderModalPriceBlock').show();
        } else if (order.status === 'IN_PROGRESS') {
            // Заказ в работе - можно завершить
            $('#orderModalMasterInProgressActions').show();
        } else {
            // Завершенный или отмененный заказ - только просмотр
        }
        enableOrderEditing(false);
    }
    // Сохраняем ID заказа в кнопках действий
    $('.order-action-btn').data('order-id', order.id);
    $('#orderModalSaveChangesBtn').data('order-id', order.id);

    // Обработка изменений заказа для клиента
    if (isCustomer() && ['NEW', 'REJECTED'].includes(order.status)) {
        const saveChangesBtn = document.getElementById('orderModalSaveChangesBtn');
        const deleteOrderBtn = document.getElementById('deleteOrderBtn');

        // Проверяем существование элементов перед работой с ними
        if (saveChangesBtn) {
            saveChangesBtn.classList.remove('d-none');
        }

        if (deleteOrderBtn) {
            deleteOrderBtn.classList.remove('d-none');
        }

        // Делаем поля редактируемыми (с проверкой существования)
        const orderDescription = document.getElementById('orderModalDescription');
        if (orderDescription) {
            orderDescription.classList.add('form-control-editable');
            orderDescription.readOnly = false;
        }

        // Поля orderDeviceType и orderDeviceModel не найдены в HTML, удаляем код работы с ними

        // Преобразуем поле типа ремонта в select
        const repairTypeField = document.getElementById('orderModalType'); // Исправлено название поля
        if (repairTypeField) {
            const currentValue = repairTypeField.value;

            // При необходимости можем добавить здесь дополнительную логику для работы с select
            // repairTypeField уже является select элементом в HTML
        }
    }
}

// Запуск заказа в работу мастером
function startWork(orderId) {
    $.ajax({
        url: API_CONFIG.getApiUrl(`/orders/my/${orderId}/start`),
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
        },
        success: function (response) {
            console.log('Заказ успешно запущен в работу:', response);
            showSuccess('Заказ успешно запущен в работу');
            $('#orderDetailsModal').modal('hide');
            loadMyOrders();
        },
        error: function (xhr) {
            console.error('Ошибка при запуске заказа в работу:', xhr);
            showError('Не удалось запустить заказ в работу');
        }
    });
}

// Включение/отключение редактирования полей заказа
function enableOrderEditing(enable) {
    if (enable) {
        $('#orderModalType').prop('disabled', false).addClass('form-select-editable');
        $('#orderModalDescription').prop('readonly', false).addClass('form-control-editable');
        $('#orderModalSaveChangesBtn').show();
    } else {
        $('#orderModalType').prop('disabled', true).removeClass('form-select-editable');
        $('#orderModalDescription').prop('readonly', true).removeClass('form-control-editable');
        $('#orderModalSaveChangesBtn').hide();
    }
}

// Сохранение изменений заказа
function saveOrderChanges(orderId, orderData) {
    // Если orderData уже передан как объект, используем его, иначе собираем данные из формы
    if (!orderData) {
        orderData = {
            description: document.getElementById('orderModalDescription')?.value || '',
            repairType: document.getElementById('orderModalType')?.value || 'DIAGNOSTIC',
            price: parseFloat(document.getElementById('orderModalPrice')?.value || 0)
        };
    }

    console.log('Отправляем данные для обновления заказа:', orderData);

    $.ajax({
        url: API_CONFIG.getApiUrl(`/orders/my/${orderId}`),
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
        },
        contentType: 'application/json',
        data: JSON.stringify(orderData),
        success: function (response) {
            console.log('Заказ успешно обновлен:', response);
            showSuccess('Данные заказа успешно обновлены');
            $('#orderDetailsModal').modal('hide');
            loadMyOrders(); // Перезагружаем список заказов
        },
        error: function (xhr) {
            console.error('Ошибка при обновлении заказа:', xhr);
            console.error('Статус:', xhr.status, 'Ответ:', xhr.responseText);
            showError('Не удалось обновить данные заказа');
        }
    });
}

// Удаление заказа
function deleteOrder(orderId) {
    $.ajax({
        url: API_CONFIG.getApiUrl(`/orders/my/${orderId}`),
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
        },
        success: function (response) {
            console.log('Заказ успешно удален:', response);
            showSuccess('Заказ успешно удален');
            $('#orderDetailsModal').modal('hide');
            loadMyOrders(); // Перезагружаем список заказов
        },
        error: function (xhr) {
            console.error('Ошибка при удалении заказа:', xhr);
            showError('Не удалось удалить заказ');
        }
    });
}

// Отказ от мастера
function rejectMaster(orderId) {
    $.ajax({
        url: API_CONFIG.getApiUrl(`/orders/my/${orderId}/reject-master`),
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
        },
        success: function (response) {
            console.log('Отказ от мастера выполнен успешно:', response);
            showSuccess('Вы успешно отказались от услуг мастера');
            $('#orderDetailsModal').modal('hide');
            loadMyOrders(); // Перезагружаем список заказов
        },
        error: function (xhr) {
            console.error('Ошибка при отказе от мастера:', xhr);
            showError('Не удалось выполнить отказ от мастера');
        }
    });
}

// Принятие заказа мастером
function acceptOrder(orderId) {
    $.ajax({
        url: API_CONFIG.getApiUrl(`/orders/${orderId}/accept`),
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
        },
        success: function (response) {
            console.log('Заказ успешно принят:', response);
            showSuccess('Заказ успешно принят');
            $('#orderDetailsModal').modal('hide');
            loadMyOrders();
            loadAvailableOrders();
        },
        error: function (xhr) {
            console.error('Ошибка при принятии заказа:', xhr);
            showError('Не удалось принять заказ');
        }
    });
}

// Установка цены мастером
function setOrderPrice(orderId) {
    const price = $('#orderModalPrice').val();

    if (!price || isNaN(parseFloat(price))) {
        showError('Пожалуйста, укажите корректную цену');
        return;
    }

    $.ajax({
        url: API_CONFIG.getApiUrl(`/orders/my/${orderId}/price`),
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
        },
        contentType: 'application/json',
        data: JSON.stringify({price: parseFloat(price)}),
        success: function (response) {
            console.log('Цена успешно установлена:', response);

            // Показываем уведомление об успехе
            showSuccess('Цена успешно установлена');

            // Отправляем уведомление клиенту (в реальном приложении здесь был бы код для отправки через WebSocket)
            // Для демонстрации просто показываем уведомление

            showNotification(`Цена для заказа #${orderId} установлена: ${parseFloat(price)} руб.`, 'info');


            $('#orderDetailsModal').modal('hide');
            loadMyOrders();
        },
        error: function (xhr) {
            console.error('Ошибка при установке цены:', xhr);
            showError('Не удалось установить цену');
        }
    });
}

// Завершение заказа мастером
function completeOrder(orderId) {
    $.ajax({
        url: API_CONFIG.getApiUrl(`/orders/my/${orderId}/complete`),
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
        },
        success: function (response) {
            console.log('Заказ успешно завершен:', response);
            showSuccess('Заказ успешно завершен');
            $('#orderDetailsModal').modal('hide');
            loadMyOrders();
        },
        error: function (xhr) {
            console.error('Ошибка при завершении заказа:', xhr);
            showError('Не удалось завершить заказ');
        }
    });
}

// Инициализация обработчиков событий
function initEventHandlers() {
    // Клик по кнопке "Подробнее" для просмотра деталей заказа
    $(document).on('click', '.view-order-details', function () {
        const orderId = $(this).data('order-id');
        // Проверяем, на какой вкладке находится пользователь
        // Если на вкладке "Доступные заказы" и пользователь - мастер, используем getOrderDetailsForMaster
        if ($('#available-orders').hasClass('active') && isMaster()) {
            getOrderDetailsForMaster(orderId);
        } else {
            getOrderDetails(orderId);
        }
    });

    // Клик по кнопке "Принять заказ" в списке доступных заказов (для мастера)
    $(document).on('click', '.accept-order-btn', function () {
        const orderId = $(this).data('order-id');
        acceptOrder(orderId);
    });

    // Клик по кнопке "Принять заказ" (для мастера)
    $(document).on('click', '#acceptOrderBtn', function () {
        const orderId = $(this).data('order-id');
        acceptOrder(orderId);
    });

    // Клик по кнопке "Сохранить изменения" (для заказчика)
    $(document).on('click', '#orderModalSaveChangesBtn', function () {
        const orderId = $(this).data('order-id');
        if (!orderId) {
            console.error('Не найден ID заказа для кнопки сохранения');
            showError('Не удалось определить ID заказа');
            return;
        }
        saveOrderChanges(orderId);
    });

    // Клик по кнопке "Удалить заказ" (для заказчика)
    $(document).on('click', '#deleteOrderBtn', function () {
        const orderId = $(this).data('order-id');
        if (confirm('Вы уверены, что хотите удалить заказ? Это действие невозможно отменить.')) {
            deleteOrder(orderId);
        }
    });

    // Клик по кнопке "Отказаться от мастера" (для заказчика)
    $(document).on('click', '#rejectMasterBtn', function () {
        const orderId = $(this).data('order-id');
        if (confirm('Вы уверены, что хотите отказаться от услуг текущего мастера?')) {
            rejectMaster(orderId);
        }
    });

    // Клик по кнопке "Установить цену" (для мастера)
    $(document).on('click', '#setOrderPriceBtn', function () {
        const orderId = $(this).data('order-id');
        setOrderPrice(orderId);
    });
    // Клик по кнопке "Запустить в работу" (для мастера)
    $(document).on('click', '#startWorkBtn', function () {
        const orderId = $(this).data('order-id');
        if (confirm('Вы уверены, что хотите запустить заказ в работу?')) {
            startWork(orderId);
        }
    });
    // Клик по кнопке "Завершить заказ" (для мастера)
    $(document).on('click', '#completeOrderBtn', function () {
        const orderId = $(this).data('order-id');
        if (confirm('Вы уверены, что хотите отметить заказ как завершенный?')) {
            completeOrder(orderId);
        }
    });
}

// Показать сообщение об успехе
function showSuccess(message) {
    // Создаем элемент для уведомления
    const alertHtml = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <strong>Успех!</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    // Добавляем уведомление в контейнер
    $('.my-orders-section .container').prepend(alertHtml);

    // Прокрутка страницы к верху для отображения сообщения
    window.scrollTo(0, 0);

    // Автоматически скрываем уведомление через 5 секунд
    setTimeout(() => {
        const alertElement = $('.alert');
        if (alertElement && alertElement.length) {
            alertElement.alert('close');
        }
    }, 5000);
}

// Показать сообщение об ошибке
function showError(message) {
    // Создаем элемент для уведомления
    const alertHtml = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Ошибка!</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    // Добавляем уведомление в контейнер
    $('.my-orders-section .container').prepend(alertHtml);

    // Прокрутка страницы к верху для отображения сообщения
    window.scrollTo(0, 0);

    // Автоматически скрываем уведомление через 5 секунд
    setTimeout(() => {
        const alertElement = $('.alert');
        if (alertElement && alertElement.length) {
            alertElement.alert('close');
        }
    }, 5000);
}

// Получить отображаемое название типа ремонта
function getRepairTypeDisplayName(repairType) {
    switch (repairType) {
        case 'DIAGNOSTIC':
            return 'Диагностика';
        case 'HARDWARE_REPAIR':
            return 'Ремонт оборудования';
        case 'SOFTWARE_REPAIR':
            return 'Ремонт ПО';
        case 'FIRMWARE_UPDATE':
            return 'Обновление прошивки';
        case 'CLEANING':
            return 'Чистка';
        case 'REPLACEMENT':
            return 'Замена деталей';
        case 'COMPLEX_REPAIR':
            return 'Комплексный ремонт';
        default:
            return repairType || 'Не указано';
    }
    // Отображение уведомления в правом верхнем углу

}
function showNotification(message, type) {
    const notificationArea = document.getElementById('notification-area') || createNotificationArea();

    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.role = 'alert';

    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Закрыть"></button>
    `;

    notificationArea.appendChild(notification);

    // Автоматическое скрытие уведомления через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 150);
    }, 3000);
}

// Создание области для уведомлений, если она отсутствует
function createNotificationArea() {
    const notificationArea = document.createElement('div');
    notificationArea.id = 'notification-area';
    notificationArea.className = 'position-fixed top-0 end-0 p-3';
    notificationArea.style.zIndex = '9999';

    document.body.appendChild(notificationArea);
    return notificationArea;
}