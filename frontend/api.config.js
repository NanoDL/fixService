/**
 * Конфигурация API
 */
const API_CONFIG = {
    // URL API для разработки
    DEV_API_URL: 'http://localhost:8070',

    // URL API для продакшена
    PROD_API_URL: '',

    // Базовый URL API
    get BASE_URL() {
        return process.env.NODE_ENV === 'production'
            ? this.PROD_API_URL
            : this.DEV_API_URL;
    },

    // Получить полный URL для API
    getApiUrl(endpoint) {
        return `${this.BASE_URL}/api${endpoint}`;
    }
};

export default API_CONFIG;