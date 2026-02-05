// Dashboard JavaScript - Handles dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

/**
 * Initialize dashboard
 */
function initializeDashboard() {
    loadDashboardStats();
    loadRecentProducts();
    setupEventListeners();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Menu toggle for mobile
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            const sidebar = document.querySelector('.sidebar');
            const menuToggle = document.getElementById('menuToggle');

            if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
                sidebar.classList.remove('show');
            }
        }
    });
}

/**
 * Load dashboard statistics
 */
async function loadDashboardStats() {
    const statsElements = {
        totalProducts: document.getElementById('totalProducts'),
        totalCategories: document.getElementById('totalCategories'),
        outOfStock: document.getElementById('outOfStock'),
        lowStock: document.getElementById('lowStock')
    };

    try {
        // Show loading state
        Object.values(statsElements).forEach(element => {
            if (element) element.textContent = '...';
        });

        // Fetch stats from API
        const stats = await window.API.dashboard.getStats();

        // Update UI with stats
        if (statsElements.totalProducts) statsElements.totalProducts.textContent = stats.totalProducts || 0;
        if (statsElements.totalCategories) statsElements.totalCategories.textContent = stats.totalCategories || 0;
        if (statsElements.outOfStock) statsElements.outOfStock.textContent = stats.outOfStock || 0;
        if (statsElements.lowStock) statsElements.lowStock.textContent = stats.lowStock || 0;

    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        Utils.showToast('Failed to load dashboard statistics', 'error');

        // Show fallback values
        Object.values(statsElements).forEach(element => {
            if (element) element.textContent = '0';
        });
    }
}

/**
 * Load recent products
 */
async function loadRecentProducts() {
    const tableBody = document.getElementById('recentProductsBody');
    if (!tableBody) return;

    try {
        Utils.showLoading(tableBody, 'Loading recent products...');
        const products = await window.API.products.getRecent(5);

        if (products && products.length > 0) {
            renderRecentProducts(products);
        } else {
            renderEmptyRecentProducts();
        }

    } catch (error) {
        console.error('Failed to load recent products:', error);
        Utils.showToast('Failed to load recent products', 'error');
        renderEmptyRecentProducts();
    }
}

/**
 * Render recent products table
 * @param {Array} products - Array of product objects
 */
function renderRecentProducts(products) {
    const tableBody = document.getElementById('recentProductsBody');
    if (!tableBody) return;

    tableBody.innerHTML = products.map(product => `
        <tr>
            <td>
                <div class="table-cell">
                    <img src="${product.imageUrl || '/assets/icons/product-placeholder.png'}" alt="${product.name}" onerror="this.src='/assets/icons/product-placeholder.png'">
                    <div class="text">
                        <strong>${product.name}</strong>
                        <small>ID: ${product.id}</small>
                    </div>
                </div>
            </td>
            <td>${product.category?.name || 'N/A'}</td>
            <td>
                <div class="price-display">
                    <span class="price final">${Utils.formatCurrency(product.price)}</span>
                    ${product.discount > 0 ? `<span class="price original">${Utils.formatCurrency(product.price)}</span>` : ''}
                </div>
            </td>
            <td>
                <span class="status-indicator ${getStockStatusClass(product.quantity)}">
                    ${product.quantity}
                </span>
            </td>
            <td>
                <span class="status-badge ${Utils.getStatusBadgeClass(product.status)}">
                    ${Utils.getStatusText(product.status)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="viewProduct(${product.id})" title="View">
                        <span class="icon">👁️</span>
                    </button>
                    <button class="action-btn" onclick="editProduct(${product.id})" title="Edit">
                        <span class="icon">✏️</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Render empty recent products state
 */
function renderEmptyRecentProducts() {
    const tableBody = document.getElementById('recentProductsBody');
    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="empty-table">
                <div class="icon">📦</div>
                <h3>No Recent Products</h3>
                <p>New products will appear here once added to the inventory.</p>
                <a href="add-product.html" class="btn btn-primary">Add First Product</a>
            </td>
        </tr>
    `;
}

/**
 * Get stock status class based on quantity
 * @param {number} quantity - Product quantity
 * @returns {string} - CSS class for stock status
 */
function getStockStatusClass(quantity) {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= 5) return 'low-stock';
    return 'in-stock';
}

/**
 * View product details
 * @param {number} productId - Product ID
 */
function viewProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

/**
 * Edit product
 * @param {number} productId - Product ID
 */
function editProduct(productId) {
    window.location.href = `edit-product.html?id=${productId}`;
}

/**
 * Refresh dashboard data
 */
function refreshDashboard() {
    loadDashboardStats();
    loadRecentProducts();
    Utils.showToast('Dashboard refreshed', 'success');
}

// Auto-refresh dashboard every 5 minutes
setInterval(refreshDashboard, 5 * 60 * 1000);

// Export functions for global access
window.Dashboard = {
    refresh: refreshDashboard,
    loadStats: loadDashboardStats,
    loadRecentProducts: loadRecentProducts
};
