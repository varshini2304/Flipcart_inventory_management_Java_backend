// Utility Functions and Helpers

/**
 * Utility class for common functions
 */
class Utils {
    /**
     * Format currency value
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency code (default: INR)
     * @returns {string} - Formatted currency string
     */
    static formatCurrency(amount, currency = 'INR') {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    }

    /**
     * Format date
     * @param {string|Date} date - Date to format
     * @param {object} options - Intl.DateTimeFormat options
     * @returns {string} - Formatted date string
     */
    static formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };

        return new Intl.DateTimeFormat('en-IN', {
            ...defaultOptions,
            ...options
        }).format(new Date(date));
    }

    /**
     * Format date and time
     * @param {string|Date} date - Date to format
     * @returns {string} - Formatted date and time string
     */
    static formatDateTime(date) {
        return this.formatDate(date, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Get status badge class based on status
     * @param {string} status - Status value
     * @returns {string} - CSS class for status badge
     */
    static getStatusBadgeClass(status) {
        const statusMap = {
            'active': 'active',
            'inactive': 'inactive',
            'in_stock': 'in-stock',
            'out_of_stock': 'out-of-stock',
            'low_stock': 'low-stock',
            'pending': 'pending'
        };

        return statusMap[status] || 'pending';
    }

    /**
     * Get human-readable status text
     * @param {string} status - Status value
     * @returns {string} - Human-readable status text
     */
    static getStatusText(status) {
        const statusTextMap = {
            'active': 'Active',
            'inactive': 'Inactive',
            'in_stock': 'In Stock',
            'out_of_stock': 'Out of Stock',
            'low_stock': 'Low Stock',
            'pending': 'Pending'
        };

        return statusTextMap[status] || status;
    }

    /**
     * Show loading state in element
     * @param {HTMLElement} element - Element to show loading in
     * @param {string} message - Loading message
     */
    static showLoading(element, message = 'Loading...') {
        element.innerHTML = `
            <div class="table-loading">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Show empty state in element
     * @param {HTMLElement} element - Element to show empty state in
     * @param {object} options - Empty state options
     */
    static showEmptyState(element, options = {}) {
        const {
            icon = '📦',
            title = 'No Data Found',
            message = 'There are no items to display.',
            actionText = null,
            actionUrl = null
        } = options;

        element.innerHTML = `
            <div class="empty-table">
                <div class="icon">${icon}</div>
                <h3>${title}</h3>
                <p>${message}</p>
                ${actionText && actionUrl ? `<a href="${actionUrl}" class="btn btn-primary">${actionText}</a>` : ''}
            </div>
        `;
    }

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds
     */
    static showToast(message, type = 'info', duration = 5000) {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            console.warn('Toast container not found');
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);
    }

    /**
     * Show confirmation dialog
     * @param {string} message - Confirmation message
     * @param {string} title - Dialog title
     * @returns {Promise<boolean>} - Promise that resolves to true if confirmed
     */
    static showConfirmDialog(message, title = 'Confirm Action') {
        return new Promise((resolve) => {
            const result = confirm(`${title}\n\n${message}`);
            resolve(result);
        });
    }

    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} - Debounced function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} - True if valid email
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate required field
     * @param {string} value - Value to validate
     * @returns {boolean} - True if not empty
     */
    static isRequired(value) {
        return value && value.trim().length > 0;
    }

    /**
     * Validate numeric value
     * @param {string|number} value - Value to validate
     * @param {object} options - Validation options
     * @returns {boolean} - True if valid number
     */
    static isValidNumber(value, options = {}) {
        const num = parseFloat(value);
        if (isNaN(num)) return false;

        const { min, max } = options;
        if (min !== undefined && num < min) return false;
        if (max !== undefined && num > max) return false;

        return true;
    }

    /**
     * Get URL parameter value
     * @param {string} name - Parameter name
     * @returns {string|null} - Parameter value or null
     */
    static getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    /**
     * Set URL parameter
     * @param {string} name - Parameter name
     * @param {string} value - Parameter value
     */
    static setUrlParameter(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.pushState({}, '', url);
    }

    /**
     * Remove URL parameter
     * @param {string} name - Parameter name
     */
    static removeUrlParameter(name) {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.pushState({}, '', url);
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} - Promise that resolves to true if copied
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    }

    /**
     * Generate random ID
     * @param {number} length - Length of ID
     * @returns {string} - Random ID
     */
    static generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Check if element is in viewport
     * @param {HTMLElement} element - Element to check
     * @returns {boolean} - True if element is visible
     */
    static isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Smooth scroll to element
     * @param {HTMLElement|string} target - Element or selector to scroll to
     * @param {number} offset - Offset from top
     */
    static scrollToElement(target, offset = 0) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }
}

// Export Utils class
window.Utils = Utils;
