// Product Detail JavaScript - Handles product detail page

document.addEventListener('DOMContentLoaded', function() {
    initializeProductDetail();
});

/**
 * Initialize product detail page
 */

function initializeProductDetail() {

    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        showErrorState('Product ID not found in URL');
        return;
    }

    loadProductDetails(productId);
    setupEventListeners(productId);
}

/**
 * Setup event listeners
 * @param {number} productId - Product ID
 */
function setupEventListeners(productId) {
    // Edit buttons
    const editBtn = document.getElementById('editProductBtn');
    const editBtnBottom = document.getElementById('editProductBtnBottom');

    if (editBtn) {
        editBtn.addEventListener('click', () => editProduct(productId));
    }
    if (editBtnBottom) {
        editBtnBottom.addEventListener('click', () => editProduct(productId));
    }

    // Delete button
    const deleteBtn = document.getElementById('deleteProductBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => showDeleteModal(productId));
    }

    // Duplicate button
    const duplicateBtn = document.getElementById('duplicateProductBtn');
    if (duplicateBtn) {
        duplicateBtn.addEventListener('click', () => duplicateProduct(productId));
    }

    // Print button
    const printBtn = document.getElementById('printProductBtn');
    if (printBtn) {
        printBtn.addEventListener('click', printProductDetails);
    }

    // Delete modal
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    if (closeDeleteModal) closeDeleteModal.addEventListener('click', hideDeleteModal);
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', hideDeleteModal);
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', () => deleteProduct(productId));

    // Close modals when clicking outside
    document.addEventListener('click', function(event) {
        const deleteModal = document.getElementById('deleteModal');
        if (event.target === deleteModal) {
            hideDeleteModal();
        }
    });
}

/**
 * Load product details
 * @param {number} productId - Product ID
 */
async function loadProductDetails(productId) {
    const loadingState = document.getElementById('loadingState');
    const productDetails = document.getElementById('productDetails');
    const errorState = document.getElementById('errorState');

    // Show loading
    loadingState.style.display = 'flex';
    productDetails.style.display = 'none';
    errorState.style.display = 'none';

    try {
        const product = await window.API.products.getById(productId);

        if (product) {
            renderProductDetails(product);
            loadingState.style.display = 'none';
            productDetails.style.display = 'block';
        } else {
            throw new Error('Product not found');
        }

    } catch (error) {
        console.error('Failed to load product details:', error);
        showErrorState('Failed to load product details. Please try again.');
    }
}

/**
 * Render product details
 * @param {object} product - Product data
 */
function renderProductDetails(product) {
    // Product header
    document.getElementById('productImage').src = product.imageUrl || '/assets/icons/product-placeholder.png';
    document.getElementById('productName').textContent = product.name || 'Unnamed Product';
    document.getElementById('productDescription').textContent = product.description || 'No description available.';
    document.getElementById('productCategory').textContent = product.category?.name || 'Uncategorized';
    document.getElementById('productId').textContent = `#${product.id}`;

    // Status badge
    const statusBadge = document.getElementById('productStatus');
    statusBadge.className = `status-badge ${Utils.getStatusBadgeClass(product.status)}`;
    statusBadge.textContent = Utils.getStatusText(product.status);

    // Pricing information
    document.getElementById('originalPrice').textContent = Utils.formatCurrency(product.price || 0);
    document.getElementById('discountAmount').textContent = `${product.discount || 0}%`;
    document.getElementById('finalPrice').textContent = Utils.formatCurrency(calculateFinalPrice(product.price, product.discount));

    // Inventory status
    const stockQuantity = document.getElementById('stockQuantity');
    stockQuantity.className = `status-indicator ${getStockStatusClass(product.quantity)}`;
    stockQuantity.textContent = product.quantity || 0;

    document.getElementById('stockStatusText').textContent = getStockStatusText(product.quantity);

    // Metadata
    document.getElementById('createdDate').textContent = Utils.formatDateTime(product.createdAt);
    document.getElementById('updatedDate').textContent = Utils.formatDateTime(product.updatedAt);
    document.getElementById('createdBy').textContent = product.createdBy || 'System';
    document.getElementById('productSku').textContent = product.sku || 'N/A';

    // Update delete modal product name
    document.getElementById('deleteProductName').textContent = product.name;
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
 * Get stock status text based on quantity
 * @param {number} quantity - Product quantity
 * @returns {string} - Human-readable stock status
 */
function getStockStatusText(quantity) {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 5) return 'Low Stock';
    return 'In Stock';
}

/**
 * Show error state
 * @param {string} message - Error message
 */
function showErrorState(message) {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const productDetails = document.getElementById('productDetails');

    loadingState.style.display = 'none';
    productDetails.style.display = 'none';
    errorState.style.display = 'block';

    // Update error message if provided
    if (message) {
        const errorMessage = errorState.querySelector('p');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
    }
}

/**
 * Edit product
 * @param {number} productId - Product ID
 */
function editProduct(productId) {
    window.location.href = `edit-product.html?id=${productId}`;
}

/**
 * Show delete confirmation modal
 * @param {number} productId - Product ID
 */
function showDeleteModal(productId) {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

/**
 * Hide delete confirmation modal
 */
function hideDeleteModal() {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Delete product
 * @param {number} productId - Product ID
 */
async function deleteProduct(productId) {
    try {
        await window.API.products.delete(productId);
        Utils.showToast('Product deleted successfully', 'success');
        hideDeleteModal();

        // Redirect to products list after short delay
        setTimeout(() => {
            window.location.href = 'products.html';
        }, 1500);

    } catch (error) {
        console.error('Failed to delete product:', error);
        Utils.showToast('Failed to delete product', 'error');
    }
}

/**
 * Duplicate product
 * @param {number} productId - Product ID
 */
async function duplicateProduct(productId) {
    try {
        // First get the product details
        const product = await window.API.products.getById(productId);

        // Create duplicate data (remove ID and modify name)
        const duplicateData = {
            ...product,
            name: `${product.name} (Copy)`,
            categoryId: product.category?.id
        };
        delete duplicateData.id;
        delete duplicateData.createdAt;
        delete duplicateData.updatedAt;

        // Create the duplicate
        await window.API.products.create(duplicateData);
        Utils.showToast('Product duplicated successfully', 'success');

        // Redirect to products list
        setTimeout(() => {
            window.location.href = 'products.html';
        }, 1500);

    } catch (error) {
        console.error('Failed to duplicate product:', error);
        Utils.showToast('Failed to duplicate product', 'error');
    }
}

/**
 * Print product details
 */
function printProductDetails() {
    window.print();
}

// Export functions for global access
window.ProductDetail = {
    load: loadProductDetails,
    edit: editProduct,
    delete: deleteProduct,
    duplicate: duplicateProduct
};
