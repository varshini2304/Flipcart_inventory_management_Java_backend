
const BASE_URL = "http://localhost:8080/api";

const ENDPOINTS = {
    CATEGORIES: '/categories',
    CATEGORY_BY_ID: (id) => `/categories/${id}`,

    PRODUCTS: '/products',
    PRODUCT_BY_ID: (id) => `/products/${id}`,
    PRODUCTS_BY_CATEGORY: (categoryId) => `/products/category/${categoryId}`,

    DASHBOARD_STATS: '/dashboard/stats',
    RECENT_PRODUCTS: '/products/recent'
};

const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE'
};

const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};

/**
 * Generic API request function
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {object} data - Request body data
 * @param {object} headers - Additional headers
 * @returns {Promise} - API response
 */

async function apiRequest(endpoint, method = HTTP_METHODS.GET, data = null, headers = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
        method,
        headers: { ...DEFAULT_HEADERS, ...headers }
    };

    if (data && (method === HTTP_METHODS.POST || method === HTTP_METHODS.PUT)) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return await response.text();
        }
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
}

// Categories API
const categoriesAPI = {
    /**
     * Get all categories
     */
    async getAll() {
        return apiRequest(ENDPOINTS.CATEGORIES);
    },

    /**
     * Get category by ID
     * @param {number} id - Category ID
     */
    async getById(id) {
        return apiRequest(ENDPOINTS.CATEGORY_BY_ID(id));
    },

    /**
     * Create new category
     * @param {object} categoryData - Category data
     */
    async create(categoryData) {
        return apiRequest(ENDPOINTS.CATEGORIES, HTTP_METHODS.POST, categoryData);
    },

    /**
     * Update category
     * @param {number} id - Category ID
     * @param {object} categoryData - Updated category data
     */
    async update(id, categoryData) {
        return apiRequest(ENDPOINTS.CATEGORY_BY_ID(id), HTTP_METHODS.PUT, categoryData);
    },

    /**
     * Delete category
     * @param {number} id - Category ID
     */
    async delete(id) {
        return apiRequest(ENDPOINTS.CATEGORY_BY_ID(id), HTTP_METHODS.DELETE);
    }
};

// Products API
const productsAPI = {
    /**
     * Get all products with optional filters
     * @param {object} filters - Filter parameters
     */
    async getAll(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = queryParams ? `${ENDPOINTS.PRODUCTS}?${queryParams}` : ENDPOINTS.PRODUCTS;
        return apiRequest(endpoint);
    },

    /**
     * Get product by ID
     * @param {number} id - Product ID
     */
    async getById(id) {
        return apiRequest(ENDPOINTS.PRODUCT_BY_ID(id));
    },

    /**
     * Get products by category
     * @param {number} categoryId - Category ID
     */
    async getByCategory(categoryId) {
        return apiRequest(ENDPOINTS.PRODUCTS_BY_CATEGORY(categoryId));
    },

    /**
     * Create new product
     * @param {object} productData - Product data
     * @param {number} categoryId - Category ID
     */
    async create(productData, categoryId) {
        const endpoint = categoryId ? `${ENDPOINTS.PRODUCTS}?categoryId=${categoryId}` : ENDPOINTS.PRODUCTS;
        return apiRequest(endpoint, HTTP_METHODS.POST, productData);
    },

    /**
     * Update product
     * @param {number} id - Product ID
     * @param {object} productData - Updated product data
     */
    async update(id, productData) {
        return apiRequest(ENDPOINTS.PRODUCT_BY_ID(id), HTTP_METHODS.PUT, productData);
    },

    /**
     * Delete product
     * @param {number} id - Product ID
     */
    async delete(id) {
        return apiRequest(ENDPOINTS.PRODUCT_BY_ID(id), HTTP_METHODS.DELETE);
    },

    /**
     * Get recent products
     * @param {number} limit - Number of products to fetch
     */
    async getRecent(limit = 10) {
        return apiRequest(`${ENDPOINTS.RECENT_PRODUCTS}?limit=${limit}`);
    }
};

// Dashboard API
const dashboardAPI = {
    /**
     * Get dashboard statistics
     */
    async getStats() {
        return apiRequest(ENDPOINTS.DASHBOARD_STATS);
    }
};

window.API = {
    categories: categoriesAPI,
    products: productsAPI,
    dashboard: dashboardAPI,
    request: apiRequest
};
