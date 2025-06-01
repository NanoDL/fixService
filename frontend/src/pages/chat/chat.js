// JavaScript для страницы чата
import '../../styles/main.scss';
import '@styles/pages/chat.scss';
import $ from 'jquery';
import {loadHeader} from '@scripts/common';
import {initNavigation} from '@scripts/navigation';
import {isAuthenticated, isCustomer, isMaster} from '@scripts/userUtils';
import API_CONFIG from '../../../api.config';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

// Глобальные переменные
let userId = null;
let currentOrderId = null;
let isLoading = false;

// WebSocket переменные
let stompClient = null;
let connected = false;
let subscriptions = {};

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

    // Загружаем список заказов
    loadOrders();

    // Инициализируем обработчики событий
    initEventHandlers();

    // Подключаемся к WebSocket
    connectWebSocket();

    // Проверяем, есть ли orderId в URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdParam = urlParams.get('orderId');
    if (orderIdParam) {
        loadChat(orderIdParam);
    }
});

// Инициализация обработчиков событий
function initEventHandlers() {
    // Обработчик отправки сообщения
    $('#messageForm').on('submit', function(e) {
        e.preventDefault();
        sendMessage();
    });

    // Обработчик нажатия Enter в поле ввода
    $('#messageInput').on('keypress', function(e) {
        if (e.which === 13 && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// Загрузка списка заказов
function loadOrders() {
    $.ajax({
        url: API_CONFIG.getApiUrl('/orders/my'),
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
        },
        success: function(response) {
            displayOrders(response);
            
            // Проверяем наличие непрочитанных сообщений
            checkUnreadMessages();
        },
        error: function(xhr) {
            console.error('Ошибка при загрузке заказов:', xhr);
            showError('Не удалось загрузить список заказов');
        }
    });
}

// Отображение списка заказов
function displayOrders(orders) {
    const $ordersList = $('#ordersList');
    
    // Очищаем список
    $ordersList.empty();
    
    if (orders && orders.length > 0) {
        $('#emptyOrdersList').hide();
        
        // Сортируем заказы по дате создания (новые сверху)
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Добавляем заказы в список
        orders.forEach(order => {
            if (order.status === 'ACCEPTED' || order.status === 'COMPLETED' || order.status === 'IN_PROGRESS') {
            const orderItem = `
                <a href="javascript:void(0)" class="list-group-item list-group-item-action order-item" data-order-id="${order.id}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">Заказ #${order.id}</h6>
                            <small>${getRepairTypeDisplayName(order.repairType)}</small>
                        </div>
                        <span class="badge bg-secondary unread-badge" id="unread-badge-${order.id}" style="display: none;">0</span>
                    </div>
                </a>
            `;
            $ordersList.append(orderItem);
            }
        });
        
        // Добавляем обработчик клика по заказу
        $('.order-item').on('click', function() {
            const orderId = $(this).data('order-id');
            loadChat(orderId);
            
            // Обновляем URL без перезагрузки страницы
            const newUrl = window.location.pathname + '?orderId=' + orderId;
            window.history.pushState({path: newUrl}, '', newUrl);
        });
    } else {
        $('#emptyOrdersList').show();
    }
}

// Загрузка чата для выбранного заказа
function loadChat(orderId) {
    // Если уже загружаем чат или это тот же заказ, то ничего не делаем
    if (isLoading || orderId === currentOrderId) {
        return;
    }

    isLoading = true;
    currentOrderId = orderId;

    // Отмечаем активный заказ в списке
    $('#ordersList .order-item').removeClass('active');
    $(`#ordersList .order-item[data-order-id="${orderId}"]`).addClass('active');

    // Скрываем заглушку и показываем контейнер сообщений
    $('#selectOrderPlaceholder').hide();
    $('#messagesContainer').show();

    // Показываем спиннер загрузки
    $('#messagesContainer').html('<div class="loading-spinner"><div class="spinner"></div></div>');

    // Загружаем информацию о заказе
    $.ajax({
        url: API_CONFIG.getApiUrl(`/orders/my/${orderId}`),
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
        },
        success: function(order) {
            // Отображаем информацию о заказе в шапке чата
            $('#chatTitle').text(`Заказ #${order.id}`);
            $('#orderStatus').text(getOrderStatusDisplayName(order.status)).show();

            // Загружаем сообщения
            loadMessages(orderId);

            // Подписываемся на сообщения этого заказа через WebSocket
            subscribeToOrderMessages(orderId);
        },
        error: function(xhr) {
            console.error('Ошибка при загрузке информации о заказе:', xhr);
            showError('Не удалось загрузить информацию о заказе');
            isLoading = false;
        }
    });
}

// Загрузка сообщений для выбранного заказа
function loadMessages(orderId) {
    $.ajax({
        url: API_CONFIG.getApiUrl(`/chat/orders/${orderId}/messages`),
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
        },
        success: function(messages) {
            displayMessages(messages);
            
            // Отмечаем сообщения как прочитанные
            markMessagesAsRead(orderId);
            
            // Показываем форму отправки сообщений
            $('#chatFooter').show();
            
            isLoading = false;
        },
        error: function(xhr) {
            console.error('Ошибка при загрузке сообщений:', xhr);
            $('#messagesContainer').html('<div class="alert alert-danger">Не удалось загрузить сообщения</div>');
            isLoading = false;
        }
    });
}

// Отображение сообщений
function displayMessages(messages) {
    console.log(messages);
    const $messagesContainer = $('#messagesContainer');
    $messagesContainer.empty();
    
    if (messages && messages.length > 0) {
        // Получаем ID текущего пользователя
        const currentUserId = getUserIdFromToken();
        
        // Добавляем сообщения
        messages.forEach(message => {
            const isOwnMessage = message.senderId === currentUserId;
            const messageClass = isOwnMessage ? 'message-own' : 'message-other';
            const alignClass = isOwnMessage ? 'align-self-end' : 'align-self-start';
            const roleClass = message.senderRole === 'MASTER' ? 'message-master' : 'message-customer';
            
            const messageItem = `
                <div class="message ${messageClass} ${alignClass} ${roleClass}">
                    <div class="message-content">
                        <div class="message-text">${message.content}</div>
                        <div class="message-sender"> ${message.senderName}</div>
                        <div class="message-time">${formatDateTime(message.timestamp)}</div>
                    </div>
                </div>
            `;
            $messagesContainer.append(messageItem);
        });
        
        // Прокручиваем контейнер с сообщениями вниз
        scrollToBottom();
    } else {
        $messagesContainer.html('<div class="text-center p-4"><p>Нет сообщений. Начните общение!</p></div>');
    }
}

// Отправка сообщения
function sendMessage() {
    const messageContent = $('#messageInput').val().trim();

    if (!messageContent || !currentOrderId) {
        return;
    }

    // Очищаем поле ввода
    $('#messageInput').val('');

    // Пробуем отправить сообщение через WebSocket
    const sentViaWebSocket = sendMessageViaWebSocket(currentOrderId, messageContent);

    // Если не удалось отправить через WebSocket, отправляем через AJAX
    if (!sentViaWebSocket) {
        $.ajax({
            url: API_CONFIG.getApiUrl(`/chat/orders/${currentOrderId}/messages`),
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
            },
            contentType: 'application/json',
            data: JSON.stringify({
                content: messageContent
            }),
            success: function(message) {
                // Добавляем сообщение в чат
                appendMessage(message);

                // Прокручиваем чат вниз
                scrollToBottom();
            },
            error: function(xhr) {
                console.error('Ошибка при отправке сообщения:', xhr);
                showError('Не удалось отправить сообщение');
            }
        });
    }
}


// Отметить сообщения как прочитанные
function markMessagesAsRead(orderId) {
    if (!orderId) {
        return;
    }

    // Пробуем отметить сообщения как прочитанные через WebSocket
    const sentViaWebSocket = markMessagesAsReadViaWebSocket(orderId);

    // Если не удалось отметить через WebSocket, отмечаем через AJAX
    if (!sentViaWebSocket) {
        $.ajax({
            url: API_CONFIG.getApiUrl(`/chat/orders/${orderId}/messages/read`),
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
            },
            success: function() {
                // Обновляем счетчик непрочитанных сообщений
                updateUnreadBadge(orderId, 0);
            }
        });
    }
}

// Проверка наличия непрочитанных сообщений
function checkUnreadMessages() {
    $.ajax({
        url: API_CONFIG.getApiUrl('/chat/orders/with-unread-messages'),
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
        },
        success: function(orderIds) {
            if (orderIds && orderIds.length > 0) {
                // Для каждого заказа с непрочитанными сообщениями получаем количество
                orderIds.forEach(orderId => {
                    getUnreadMessagesCount(orderId);
                });
            }
        },
        error: function(xhr) {
            console.error('Ошибка при проверке непрочитанных сообщений:', xhr);
        }
    });
}

// Получение количества непрочитанных сообщений для заказа
function getUnreadMessagesCount(orderId) {
    $.ajax({
        url: API_CONFIG.getApiUrl(`/chat/orders/${orderId}/messages/unread/count`),
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
        },
        success: function(response) {
            const count = response.count;
            if (count > 0) {
                // Показываем бейдж с количеством непрочитанных сообщений
                const $badge = $(`#unread-badge-${orderId}`);
                $badge.text(count);
                $badge.show();
            }
        },
        error: function(xhr) {
            console.error('Ошибка при получении количества непрочитанных сообщений:', xhr);
        }
    });
}

// ===== WebSocket функции =====

/**
 * Инициализация WebSocket соединения
 */
function connectWebSocket() {
    // Получаем ID пользователя из JWT токена
    userId = getUserIdFromToken();

    if (stompClient !== null) {
        disconnectWebSocket();
    }

    // Получаем JWT токен из localStorage
    const token = localStorage.getItem('jwt-token');

    // Создаем SockJS соединение с передачей токена в URL
    const socket = new SockJS(API_CONFIG.getApiUrl(`/ws?token=${token}`));

    stompClient = new Client({
        webSocketFactory: () => socket,
        // Добавляем заголовки аутентификации
        connectHeaders: {
            'Authorization': `Bearer ${token}`
        },
        debug: function(str) {
            // Отключаем логи STOMP
            // console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
            connected = true;
            console.log('Подключено к WebSocket');

            // Если есть активный заказ, подписываемся на его сообщения
            if (currentOrderId) {
                subscribeToOrderMessages(currentOrderId);
            }
        },
        onStompError: (frame) => {
            connected = false;
            console.error('Ошибка подключения к WebSocket:', frame);
            // Пробуем переподключиться через 5 секунд
            setTimeout(connectWebSocket, 5000);
        }
    });
    
    // Запускаем подключение
    stompClient.activate();
}

/**
 * Отключение от WebSocket сервера
 */
function disconnectWebSocket() {
    if (stompClient !== null && connected) {
        // Отписываемся от всех подписок
        Object.values(subscriptions).forEach(subscription => {
            if (subscription) {
                subscription.unsubscribe();
            }
        });
        
        // Очищаем подписки
        subscriptions = {};
        
        // Отключаемся от сервера
        stompClient.deactivate();
        connected = false;
    }
}

/**
 * Проверка, подключен ли WebSocket
 * @returns {boolean} true, если WebSocket подключен, иначе false
 */
function isWebSocketConnected() {
    return connected && stompClient !== null && stompClient.connected;
}

/**
 * Подписка на сообщения для заказа
 * @param {number} orderId ID заказа
 */
function subscribeToOrderMessages(orderId) {
    // Подписываемся на сообщения
    subscribeToOrderMessagesViaWebSocket(orderId, function(message) {
        // Добавляем сообщение в чат
        appendMessage(message);

        // Прокручиваем чат вниз
        scrollToBottom();

        // Если это не наше сообщение, отмечаем его как прочитанное
        if (message.senderId !== userId) {
            markMessagesAsRead(orderId);

            // Показываем уведомление о новом сообщении
            showNotification(`Новое сообщение: ${message.content}`, 'info');
        }
    });

    // Подписываемся на уведомления о прочтении
    subscribeToReadReceiptsViaWebSocket(orderId, function(readData) {
        // Обновляем статус прочтения сообщений
        if (readData.userId !== userId) {
            // Отмечаем все сообщения как прочитанные в UI
            $('.message-item.outgoing').addClass('read');
        }
    });
}

/**
 * Подписка на сообщения для заказа через WebSocket
 * @param {number} orderId ID заказа
 * @param {Function} callback Функция обратного вызова для обработки сообщений
 */
function subscribeToOrderMessagesViaWebSocket(orderId, callback) {
    if (!isWebSocketConnected()) return;
    
    // Отписываемся от предыдущей подписки, если она существует
    if (subscriptions[`order_${orderId}`]) {
        subscriptions[`order_${orderId}`].unsubscribe();
    }
    
    // Подписываемся на сообщения для заказа
    subscriptions[`order_${orderId}`] = stompClient.subscribe(
        `/topic/orders/${orderId}/messages`, 
        (message) => {
            const messageData = JSON.parse(message.body);
            if (callback) callback(messageData);
        }
    );
}

/**
 * Подписка на уведомления о прочтении сообщений через WebSocket
 * @param {number} orderId ID заказа
 * @param {Function} callback Функция обратного вызова для обработки уведомлений
 */
function subscribeToReadReceiptsViaWebSocket(orderId, callback) {
    if (!isWebSocketConnected()) return;
    
    // Отписываемся от предыдущей подписки, если она существует
    if (subscriptions[`read_${orderId}`]) {
        subscriptions[`read_${orderId}`].unsubscribe();
    }
    
    // Подписываемся на уведомления о прочтении
    subscriptions[`read_${orderId}`] = stompClient.subscribe(
        `/topic/orders/${orderId}/read`, 
        (message) => {
            const readData = JSON.parse(message.body);
            if (callback) callback(readData);
        }
    );
}

/**
 * Отправка сообщения через WebSocket
 * @param {number} orderId ID заказа
 * @param {string} content Содержимое сообщения
 * @returns {boolean} true, если сообщение отправлено, иначе false
 */
function sendMessageViaWebSocket(orderId, content) {
    if (!isWebSocketConnected()) {
        return false;
    }

    try {
        stompClient.publish({
            destination: `/app/chat.sendMessage/${orderId}`,
            body: JSON.stringify({
                content: content,
                userId: userId // Добавляем ID пользователя в сообщение
            })
        });
        return true;
    } catch (error) {
        console.error('Ошибка при отправке сообщения через WebSocket:', error);
        return false;
    }
}

/**
 * Отметка сообщений как прочитанных через WebSocket
 * @param {number} orderId ID заказа
 * @returns {boolean} true, если запрос отправлен, иначе false
 */
function markMessagesAsReadViaWebSocket(orderId) {
    if (!isWebSocketConnected()) {
        return false;
    }

    try {
        stompClient.publish({
            destination: `/app/chat.markAsRead/${orderId}`,
            body: JSON.stringify({
                userId: userId // Добавляем ID пользователя в сообщение
            })
        });
        return true;
    } catch (error) {
        console.error('Ошибка при отметке сообщений как прочитанных через WebSocket:', error);
        return false;
    }
}

// Добавление сообщения в чат
function appendMessage(message) {
    console.log(message);
    const isOwnMessage = message.senderId === userId;
    const messageClass = isOwnMessage ? 'message-own' : 'message-other';
    const alignClass = isOwnMessage ? 'align-self-end' : 'align-self-start';
    const roleClass = message.senderRole === 'MASTER' ? 'message-master' : 'message-customer';
    
    const messageItem = `
        <div class="message ${messageClass} ${alignClass} ${roleClass}">
            <div class="message-content">
                <div class="message-text">${message.content}</div>
                <div class="message-time">${formatDateTime(message.timestamp)}</div>
            </div>
        </div>
    `;
    
    $('#messagesContainer').append(messageItem);
    scrollToBottom();
}

// Обновление счетчика непрочитанных сообщений
function updateUnreadBadge(orderId, count) {
    const $badge = $(`#unread-badge-${orderId}`);
    if (count > 0) {
        $badge.text(count);
        $badge.show();
    } else {
        $badge.hide();
    }
}

// Прокрутка контейнера с сообщениями вниз
function scrollToBottom() {
    const $chatBody = $('#chatBody');
    $chatBody.scrollTop($chatBody[0].scrollHeight);
}

// Форматирование даты и времени
function formatDateTime(dateTimeStr) {
    const date = new Date(dateTimeStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const options = {
        hour: '2-digit',
        minute: '2-digit'
    };
    
    if (!isToday) {
        options.day = '2-digit';
        options.month = '2-digit';
        options.year = 'numeric';
    }
    
    return date.toLocaleString('ru-RU', options);
}

// Получить отображаемое название типа ремонта
function getRepairTypeDisplayName(repairType) {
    switch (repairType) {
        case 'PHONE_REPAIR':
            return 'Ремонт телефона';
        case 'TABLET_REPAIR':
            return 'Ремонт планшета';
        case 'LAPTOP_REPAIR':
            return 'Ремонт ноутбука';
        case 'PC_REPAIR':
            return 'Ремонт компьютера';
        case 'TV_REPAIR':
            return 'Ремонт телевизора';
        case 'CONSOLE_REPAIR':
            return 'Ремонт игровой консоли';
        default:
            return repairType || 'Не указано';
    }
}

// Получить отображаемое название статуса заказа
function getOrderStatusDisplayName(status) {
    switch (status) {
        case 'NEW':
            return 'Новый';
        case 'ACCEPTED':
            return 'Принят';
        case 'IN_PROGRESS':
            return 'В работе';
        case 'COMPLETED':
            return 'Завершен';
        case 'CANCELED':
            return 'Отменен';
        default:
            return status || 'Не указано';
    }
}

// Отображение уведомления в правом верхнем углу
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

// Показать сообщение об ошибке
function showError(message) {
    showNotification(message, 'danger');
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
