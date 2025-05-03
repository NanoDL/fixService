// Инициализация Bootstrap компонентов
import { Popover, Tooltip, Modal, Tab } from 'bootstrap';

/**
 * Инициализирует все компоненты Bootstrap на странице
 */
export function initBootstrap() {
    // Инициализация всплывающих подсказок
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new Tooltip(tooltipTriggerEl));
    
    // Инициализация всплывающих окон
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new Popover(popoverTriggerEl));
    
    // Инициализация модальных окон
    const modalTriggerList = document.querySelectorAll('[data-bs-toggle="modal"]');
    [...modalTriggerList].forEach(modalTriggerEl => {
        modalTriggerEl.addEventListener('click', function() {
            const targetModalId = this.getAttribute('data-bs-target');
            const modalElement = document.querySelector(targetModalId);
            if (modalElement) {
                const modal = new Modal(modalElement);
                modal.show();
            }
        });
    });
    
    // Инициализация вкладок с автоматическим переключением по хешу URL
    const tabTriggerList = document.querySelectorAll('[data-bs-toggle="tab"]');
    const tabList = [...tabTriggerList].map(tabTriggerEl => {
        const tab = new Tab(tabTriggerEl);
        
        tabTriggerEl.addEventListener('click', function(event) {
            event.preventDefault();
            tab.show();
        });
        
        return tab;
    });
    
    // Активация вкладки по хешу в URL
    const url = window.location.href;
    const hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
        const hash = url.substring(hashIndex);
        if (hash) {
            const triggerEl = document.querySelector(`a[href="${hash}"], button[data-bs-target="${hash}"]`);
            if (triggerEl) {
                const tab = new Tab(triggerEl);
                tab.show();
            }
        }
    }
} 