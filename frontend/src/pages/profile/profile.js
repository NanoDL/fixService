// JavaScript для страницы профиля
import '../../styles/main.scss';
import { initProfile } from '../../scripts/profile.js';
import { initBootstrap } from '../../scripts/bootstrap-init.js';
import { loadHeader } from '../../scripts/common.js';
import { initNavigation } from "@scripts/navigation";

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем хедер
    loadHeader();
    
    // Инициализация Bootstrap компонентов
    initBootstrap();
    
    // Инициализация функционала профиля
    initProfile();
    
    // Инициализация навигации
    initNavigation();
    
    // Проверка авторизации
    checkAuth();
});

// Функция проверки авторизации
function checkAuth() {
    const token = localStorage.getItem('jwt-token');
    
    if (!token) {
        // Если пользователь не авторизован, перенаправляем на страницу входа
        window.location.href = '/login';
        return;
    }
    
    // Проверка валидности токена (можно добавить дополнительную проверку через API)
} 