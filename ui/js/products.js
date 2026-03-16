// Products Management JavaScript

let currentPage = 1;
let totalPages = 1;
let currentFilters = {};
let selectedProducts = new Set();

document.addEventListener('DOMContentLoaded', function() {
    initializeProducts();
});

/**
 * Initialize products page
 */
function initializeProducts() {
    setupEventListeners();
    loadCategoriesForFilter();
    loadProducts();
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

    // Add product button
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            window.location.href = 'add-product.html';
        });
    }

    // Filter controls
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    if (searchInput) {
        searchInput.addEventListener('input', Utils.debounce(applyFilters, 500));
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    if (minPrice) {
        minPrice.addEventListener('input', Utils.debounce(applyFilters, 500));
    }
    if (maxPrice) {
        maxPrice.addEventListener('input', Utils.debounce(applyFilters, 500));
    }
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }

    // Action buttons
    const refreshBtn = document.getElementById('refreshBtn');
    const exportBtn = document.getElementById('exportBtn');

    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadProducts);
    }
    if (exportBtn) {
        exportBtn.addEventListener('click', exportProducts);
    }

    // Pagination
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => changePage(currentPage - 1));
    }
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => changePage(currentPage + 1));
    }

    // Table sorting
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => sortProducts(header.dataset.sort));
    });

    // Bulk actions modal
    const closeBulkModal = document.getElementById('closeBulkModal');
    const cancelBulkBtn = document.getElementById('cancelBulkBtn');
    const confirmBulkBtn = document.getElementById('confirmBulkBtn');
    const bulkActionType = document.getElementById('bulkActionType');

    if (closeBulkModal) closeBulkModal.addEventListener('click', hideBulkActionsModal);
    if (cancelBulkBtn) cancelBulkBtn.addEventListener('click', hideBulkActionsModal);
    if (confirmBulkBtn) confirmBulkBtn.addEventListener('click', executeBulkAction);
    if (bulkActionType) {
        bulkActionType.addEventListener('change', handleBulkActionChange);
    }

    // Close modals when clicking outside
    document.addEventListener('click', function(event) {
        const bulkModal = document.getElementById('bulkActionsModal');
        if (event.target === bulkModal) {
            hideBulkActionsModal();
        }
    });
}

/**
 * Load categories for filter dropdown
 */
async function loadCategoriesForFilter() {
    try {
        const categories = await window.API.categories.getAll();
        const categoryFilter = document.getElementById('categoryFilter');
        const bulkCategory = document.getElementById('bulkCategory');

        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">All Categories</option>';
            categories.forEach(category => {
                categoryFilter.innerHTML += `<option value="${category.id}">${category.name}</option>`;
            });
        }

        if (bulkCategory) {
            bulkCategory.innerHTML = '';
            categories.forEach(category => {
                bulkCategory.innerHTML += `<option value="${category.id}">${category.name}</option>`;
            });
        }
    } catch (error) {
        console.error('Failed to load categories for filter:', error);
    }
}

/**
 * Load products with current filters and pagination
 */
async function loadProducts() {
    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) return;

    try {
        Utils.showLoading(tableBody, 'Loading products...');

        const params = {
            page: currentPage,
            size: 10,
            ...currentFilters
        };

        const response = await window.API.products.getAll(params);

        if (response && response.content) {
            renderProducts(response.content);
            updatePagination(response);
        } else if (response) {
            // Handle case where response is direct array
            renderProducts(response);
            updatePagination({ totalPages: 1, number: 0, size: response.length });
        } else {
            renderEmptyProducts();
        }

    } catch (error) {
        console.error('Failed to load products:', error);
        Utils.showToast('Failed to load products', 'error');
        renderEmptyProducts();
    }
}

/**
 * Render products table
 * @param {Array} products - Array of product objects
 */
function renderProducts(products) {
    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = products.map(product => `
        <tr>
            <td>
                <div class="table-cell">
                    <img src="${product.imageUrl || '/assets/icons/product-placeholder.svg'}" alt="${product.name}" onerror="this.src='/assets/icons/product-placeholder.svg'">
                    <div class="text">
                        <strong>${product.name}</strong>
                        <small>ID: ${product.id}</small>
                    </div>
                </div>
            </td>
            <td>${product.category?.name || 'N/A'}</td>
            <td>${Utils.formatCurrency(product.price)}</td>
            <td>${product.discount || 0}%</td>
            <td>
                <span class="price final">${Utils.formatCurrency(calculateFinalPrice(product.price, product.discount))}</span>
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
                    <input type="checkbox" class="product-checkbox" value="${product.id}" onchange="toggleProductSelection(${product.id})">
                    <button class="action-btn" onclick="viewProduct(${product.id})" title="View">
                        <span class="icon">👁️</span>
                    </button>
                    <button class="action-btn" onclick="editProduct(${product.id})" title="Edit">
                        <span class="icon">✏️</span>
                    </button>
                    <button class="action-btn danger" onclick="deleteProduct(${product.id}, '${product.name}')" title="Delete">
                        <span class="icon">🗑️</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Render empty products state
 */
function renderEmptyProducts() {
    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="8" class="empty-table">
                <div class="icon">📦</div>
                <h3>No Products Found</h3>
                <p>No products match your current filters. Try adjusting your search criteria.</p>
                <button class="btn btn-primary" onclick="clearFilters()">Clear Filters</button>
            </td>
        </tr>
    `;
}

/**
 * Calculate final price after discount
 * @param {number} price - Original price
 * @param {number} discount - Discount percentage
 * @returns {number} - Final price
 */
function calculateFinalPrice(price, discount = 0) {
    return price - (price * discount / 100);
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
 * Update pagination controls
 * @param {object} pageData - Pagination data from API
 */
function updatePagination(pageData) {
    const paginationContainer = document.getElementById('paginationContainer');
    const paginationInfo = document.getElementById('paginationInfo');
    const pageNumbers = document.getElementById('pageNumbers');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');

    if (!pageData) return;

    currentPage = pageData.number + 1;
    totalPages = pageData.totalPages || 1;

    // Update pagination info
    if (paginationInfo) {
        const start = (currentPage - 1) * (pageData.size || 10) + 1;
        const end = Math.min(currentPage * (pageData.size || 10), pageData.totalElements || 0);
        paginationInfo.textContent = `Showing ${start}-${end} of ${pageData.totalElements || 0} products`;
    }

    // Update page numbers
    if (pageNumbers) {
        let pagesHtml = '';
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            pagesHtml += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        }
        pageNumbers.innerHTML = pagesHtml;
    }

    // Update prev/next buttons
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
    }

    // Show/hide pagination
    if (paginationContainer) {
        paginationContainer.style.display = totalPages > 1 ? 'flex' : 'none';
    }
}

/**
 * Apply current filters
 */
function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');

    currentFilters = {
        search: searchInput?.value?.trim() || '',
        categoryId: categoryFilter?.value || '',
        status: statusFilter?.value || '',
        minPrice: minPrice?.value || '',
        maxPrice: maxPrice?.value || ''
    };

    currentPage = 1; // Reset to first page
    loadProducts();
}

/**
 * Clear all filters
 */
function clearFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');

    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (statusFilter) statusFilter.value = '';
    if (minPrice) minPrice.value = '';
    if (maxPrice) maxPrice.value = '';

    currentFilters = {};
    currentPage = 1;
    loadProducts();
}

/**
 * Change page
 * @param {number} page - Page number to navigate to
 */
function changePage(page) {
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        loadProducts();
    }
}

/**
 * Sort products
 * @param {string} sortBy - Field to sort by
 */
function sortProducts(sortBy) {
    const sortOrder = currentFilters.sort === sortBy && currentFilters.order === 'asc' ? 'desc' : 'asc';
    currentFilters.sort = sortBy;
    currentFilters.order = sortOrder;
    loadProducts();
}

/**
 * Toggle product selection for bulk actions
 * @param {number} productId - Product ID
 */
function toggleProductSelection(productId) {
    if (selectedProducts.has(productId)) {
        selectedProducts.delete(productId);
    } else {
        selectedProducts.add(productId);
    }

    updateBulkActionsVisibility();
}

/**
 * Update bulk actions visibility
 */
function updateBulkActionsVisibility() {
    // This could be used to show/hide bulk actions bar
    // For now, we'll use it to enable/disable bulk actions button
}

/**
 * Show bulk actions modal
 */
function showBulkActionsModal() {
    if (selectedProducts.size === 0) {
        Utils.showToast('Please select products first', 'warning');
        return;
    }

    const modal = document.getElementById('bulkActionsModal');
    const message = document.getElementById('bulkActionMessage');

    if (modal && message) {
        message.textContent = `${selectedProducts.size} product(s) selected for bulk action.`;
        modal.style.display = 'flex';
    }
}

/**
 * Hide bulk actions modal
 */
function hideBulkActionsModal() {
    const modal = document.getElementById('bulkActionsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Handle bulk action type change
 */
function handleBulkActionChange() {
    const actionType = document.getElementById('bulkActionType').value;
    const statusGroup = document.getElementById('bulkStatusGroup');
    const categoryGroup = document.getElementById('bulkCategoryGroup');
    const confirmBtn = document.getElementById('confirmBulkBtn');

    if (statusGroup) statusGroup.style.display = actionType === 'update_status' ? 'block' : 'none';
    if (categoryGroup) categoryGroup.style.display = actionType === 'update_category' ? 'block' : 'none';

    if (confirmBtn) {
        confirmBtn.className = actionType === 'delete' ? 'btn btn-danger' : 'btn btn-primary';
        confirmBtn.textContent = actionType === 'delete' ? 'Delete' : 'Update';
    }
}

/**
 * Execute bulk action
 */
async function executeBulkAction() {
    const actionType = document.getElementById('bulkActionType').value;
    const productIds = Array.from(selectedProducts);

    if (productIds.length === 0) {
        Utils.showToast('No products selected', 'warning');
        return;
    }

    let confirmed = false;
    let actionData = {};

    switch (actionType) {
        case 'delete':
            confirmed = await Utils.showConfirmDialog(
                `Are you sure you want to delete ${productIds.length} product(s)? This action cannot be undone.`,
                'Bulk Delete'
            );
            break;

        case 'update_status':
            const newStatus = document.getElementById('bulkStatus').value;
            confirmed = await Utils.showConfirmDialog(
                `Update status of ${productIds.length} product(s) to "${newStatus}"?`,
                'Bulk Status Update'
            );
            actionData.status = newStatus;
            break;

        case 'update_category':
            const newCategoryId = document.getElementById('bulkCategory').value;
            confirmed = await Utils.showConfirmDialog(
                `Change category of ${productIds.length} product(s)?`,
                'Bulk Category Update'
            );
            actionData.categoryId = newCategoryId;
            break;
    }

    if (!confirmed) return;

    try {
        // Note: This would require backend support for bulk operations
        // For now, we'll show a placeholder message
        Utils.showToast(`Bulk ${actionType} operation would be performed on ${productIds.length} products`, 'info');
        hideBulkActionsModal();
        selectedProducts.clear();
        loadProducts();

    } catch (error) {
        console.error('Bulk action failed:', error);
        Utils.showToast('Bulk action failed', 'error');
    }
}

/**
 * Export products
 */
function exportProducts() {
    // This would typically call an export API endpoint
    Utils.showToast('Export functionality would be implemented here', 'info');
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
 * Delete product
 * @param {number} productId - Product ID
 * @param {string} productName - Product name for confirmation
 */
async function deleteProduct(productId, productName) {
    const confirmed = await Utils.showConfirmDialog(
        `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
        'Delete Product'
    );

    if (!confirmed) return;

    try {
        await window.API.products.delete(productId);
        Utils.showToast('Product deleted successfully', 'success');
        loadProducts();

    } catch (error) {
        console.error('Failed to delete product:', error);
        Utils.showToast('Failed to delete product', 'error');
    }
}

// Export functions for global access
window.Products = {
    load: loadProducts,
    refresh: loadProducts,
    clearFilters: clearFilters,
    showBulkActions: showBulkActionsModal
};

