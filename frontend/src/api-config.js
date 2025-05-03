const API_CONFIG = {
    baseUrl: '/api',
    
    // Authentication
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refreshToken: '/auth/refresh',
    
    // Users
    profile: '/users/profile',
    updateProfile: '/users/profile',
    changePassword: '/users/change-password',
    deleteAccount: '/users/delete',
    
    // Order management
    orders: '/orders',
    orderById: (id) => `/orders/${id}`,
    orderActions: (id) => `/orders/${id}/actions`,
    
    // Repair types
    repairTypes: '/repair-types',
    
    // Utilities
    getApiUrl: function(endpoint) {
        return this.baseUrl + endpoint;
    }
};

export default API_CONFIG; 