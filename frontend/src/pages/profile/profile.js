// JavaScript для страницы профиля
import '../../styles/main.scss';
import { initProfile } from '../../scripts/profile.js';
import { initBootstrap } from '../../scripts/bootstrap-init.js';
import { loadHeader } from '../../scripts/common.js';
import { initNavigation } from "@scripts/navigation";
import { 
    customerProfileTemplate, 
    masterProfileTemplate, 
    adminProfileTemplate,
    adminUsersTemplate,
    adminStatsTemplate 
} from './templates/index.js';

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем хедер
    loadHeader();
    
    // Инициализация Bootstrap компонентов
    initBootstrap();
    
    // Проверка авторизации
    checkAuth();
    
    // Инициализация навигации
    initNavigation();
});

// Функция проверки авторизации
async function checkAuth() {
    const token = localStorage.getItem('jwt-token');
    
    if (!token) {
        window.location.href = '/login';
        return;
    }
    
    try {
        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка загрузки профиля');
        }
        
        const userData = await response.json();
        setupProfile(userData);
    } catch (error) {
        console.error('Ошибка:', error);
        window.location.href = '/login';
    }
}

// Настройка профиля в зависимости от роли
async function setupProfile(userData) {
    // Установка общей информации
    document.getElementById('userName').textContent = userData.name || 'Пользователь';
    document.getElementById('roleBadge').textContent = getRoleDisplayName(userData.role);
    
    // Установка специфичного бейджа для роли
    const roleBadge = document.getElementById('roleSpecificBadge');
    if (userData.role === 'CUSTOMER' && userData.isVerified) {
        roleBadge.innerHTML = '<span class="badge bg-success">Верифицирован</span>';
    } else if (userData.role === 'ADMIN' && userData.isSuperAdmin) {
        roleBadge.innerHTML = '<span class="badge bg-danger">Супер-админ</span>';
    }
    
    // Загрузка шаблона профиля
    const profileContent = document.getElementById('profileContent');
    let template = '';
    
    switch (userData.role) {
        case 'CUSTOMER':
            template = customerProfileTemplate;
            break;
        case 'MASTER':
            template = masterProfileTemplate;
            break;
        case 'ADMIN':
            template = adminProfileTemplate;
            break;
        default:
            template = '<div class="alert alert-danger">Неизвестная роль пользователя</div>';
    }
    
    profileContent.innerHTML = template;
    
    // Инициализация профиля
    initProfile(userData);
    
    // Добавление дополнительных вкладок для администратора
    if (userData.role === 'ADMIN') {
        const profileMenu = document.getElementById('profileMenu');
        const adminTabs = `
            <li class="nav-item">
                <a class="nav-link" href="#users-tab" data-bs-toggle="tab">
                    <i class="bi bi-people"></i> Пользователи
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#stats-tab" data-bs-toggle="tab">
                    <i class="bi bi-graph-up"></i> Статистика
                </a>
            </li>
        `;
        profileMenu.insertAdjacentHTML('beforeend', adminTabs);

        // Добавляем контент для вкладок администратора
        const tabContent = document.querySelector('.tab-content');
        const usersTab = document.createElement('div');
        usersTab.className = 'tab-pane fade';
        usersTab.id = 'users-tab';
        usersTab.innerHTML = adminUsersTemplate;

        const statsTab = document.createElement('div');
        statsTab.className = 'tab-pane fade';
        statsTab.id = 'stats-tab';
        statsTab.innerHTML = adminStatsTemplate;

        tabContent.appendChild(usersTab);
        tabContent.appendChild(statsTab);

        // Инициализация обработчиков для админских вкладок
        initAdminTabsHandlers();
    }
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

// Инициализация обработчиков для админских вкладок
function initAdminTabsHandlers() {
    // Обработчик вкладки пользователей
    const usersTabLink = document.querySelector('a[href="#users-tab"]');
    usersTabLink.addEventListener('click', () => {
        loadUsers(0, 10);
    });

    // Обработчик изменения размера страницы
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', () => {
            const pageSize = parseInt(pageSizeSelect.value);
            loadUsers(0, pageSize);
        });
    }
}

// Загрузка пользователей с постраничной навигацией
async function loadUsers(page, size) {
    const token = localStorage.getItem('jwt-token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    // Отображение индикатора загрузки
    const usersTableBody = document.getElementById('usersTableBody');
    usersTableBody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
                <p class="mt-2">Загрузка пользователей...</p>
            </td>
        </tr>
    `;

    try {
        const response = await fetch(`/api/users?page=${page}&size=${size}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка загрузки пользователей');
        }

        const data = await response.json();
        displayUsers(data, page, size);
    } catch (error) {
        console.error('Ошибка:', error);
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <div class="alert alert-danger">
                        Ошибка при загрузке пользователей. Пожалуйста, попробуйте позже.
                    </div>
                </td>
            </tr>
        `;
    }
}

// Отображение пользователей и настройка пагинации
function displayUsers(data, currentPage, pageSize) {
    const usersTableBody = document.getElementById('usersTableBody');
    const pagination = document.getElementById('usersPagination');
    
    // Очистка таблицы
    usersTableBody.innerHTML = '';
    
    // Проверка наличия данных
    if (!data.content || data.content.length === 0) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <i class="bi bi-exclamation-circle text-muted d-block mb-3" style="font-size: 2rem;"></i>
                    Пользователи не найдены
                </td>
            </tr>
        `;
        return;
    }
    
    // Заполнение таблицы пользователями
    data.content.forEach(user => {
        const statusBadge = user.isActive 
            ? '<span class="badge bg-success">Активен</span>' 
            : '<span class="badge bg-danger">Заблокирован</span>';

        const toggleButton = user.isActive
            ? `<button class="btn btn-sm btn-danger toggle-status-btn" data-user-id="${user.id}">Заблокировать</button>`
            : `<button class="btn btn-sm btn-success toggle-status-btn" data-user-id="${user.id}">Разблокировать</button>`;

        const createdAt = new Date(user.createdAt).toLocaleDateString('ru-RU');
        
        const row = `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="badge role-badge role-${user.role.toLowerCase()}">${getRoleDisplayName(user.role)}</span></td>
                <td>${createdAt}</td>
                <td>${statusBadge}</td>
                <td>${toggleButton}</td>
            </tr>
        `;
        
        usersTableBody.insertAdjacentHTML('beforeend', row);
    });
    
    // Добавление обработчиков для кнопок блокировки/разблокировки
    const toggleButtons = document.querySelectorAll('.toggle-status-btn');
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const userId = button.getAttribute('data-user-id');
            toggleUserStatus(userId, currentPage, pageSize);
        });
    });
    
    // Настройка пагинации
    setupPagination(data, currentPage, pageSize);
}

// Настройка пагинации
function setupPagination(data, currentPage, pageSize) {
    const pagination = document.getElementById('usersPagination');
    
    // Очистка пагинации
    pagination.innerHTML = '';
    
    // Кнопка "Предыдущая"
    const prevDisabled = currentPage === 0 ? 'disabled' : '';
    const prevButton = `
        <li class="page-item ${prevDisabled}">
            <a class="page-link" href="#" aria-label="Предыдущая" data-page="${currentPage - 1}">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;
    pagination.insertAdjacentHTML('beforeend', prevButton);
    
    // Номера страниц
    const totalPages = data.totalPages;
    const maxVisiblePages = 5;
    
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    // Корректировка, если показываем меньше maxVisiblePages
    if (endPage - startPage + 1 < maxVisiblePages && startPage > 0) {
        startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    // Добавление номеров страниц
    for (let i = startPage; i <= endPage; i++) {
        const active = i === currentPage ? 'active' : '';
        const pageButton = `
            <li class="page-item ${active}">
                <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
            </li>
        `;
        pagination.insertAdjacentHTML('beforeend', pageButton);
    }
    
    // Кнопка "Следующая"
    const nextDisabled = currentPage >= totalPages - 1 ? 'disabled' : '';
    const nextButton = `
        <li class="page-item ${nextDisabled}">
            <a class="page-link" href="#" aria-label="Следующая" data-page="${currentPage + 1}">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;
    pagination.insertAdjacentHTML('beforeend', nextButton);
    
    // Добавление обработчиков для кнопок страниц
    const pageLinks = pagination.querySelectorAll('.page-link');
    pageLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            
            // Проверка, не отключена ли кнопка
            if (link.parentElement.classList.contains('disabled')) {
                return;
            }
            
            const page = parseInt(link.getAttribute('data-page'));
            loadUsers(page, pageSize);
        });
    });
}

// Переключение статуса пользователя (блокировка/разблокировка)
async function toggleUserStatus(userId, currentPage, pageSize) {
    const token = localStorage.getItem('jwt-token');
    if (!token) {
        window.location.href = '/login';
        return;
    }
    
    try {
        const response = await fetch(`/api/users/${userId}/toggle-status`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка при изменении статуса пользователя');
        }
        
        // Перезагрузка данных пользователей
        loadUsers(currentPage, pageSize);
        
        // Отображение уведомления об успехе
        showNotification('Статус пользователя успешно изменен', 'success');
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка при изменении статуса пользователя', 'danger');
    }
}

// Отображение уведомления
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