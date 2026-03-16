// Product Form JavaScript - Handles add/edit product forms

document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'add-product.html') {
        initializeAddProductForm();
    } else if (currentPage === 'edit-product.html') {
        initializeEditProductForm();
    }
});

/**
 * Initialize add product form
 */
function initializeAddProductForm() {
    setupCommonFormElements();
    setupAddProductSpecificElements();
}

/**
 * Initialize edit product form
 */
function initializeEditProductForm() {
    setupCommonFormElements();
    loadProductForEdit();
}

/**
 * Setup common form elements and event listeners
 */
function setupCommonFormElements() {
    // Menu toggle for mobile
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }

    // Form elements
    const priceInput = document.getElementById('productPrice');
    const discountInput = document.getElementById('productDiscount');
    const quantityInput = document.getElementById('productQuantity');
    const imageInput = document.getElementById('productImage');

    // Real-time calculations
    if (priceInput) {
        priceInput.addEventListener('input', calculateFinalPrice);
    }
    if (discountInput) {
        discountInput.addEventListener('input', calculateFinalPrice);
    }
    if (quantityInput) {
        quantityInput.addEventListener('input', updateStockStatusPreview);
    }

    // Image preview
    if (imageInput) {
        imageInput.addEventListener('change', handleImagePreview);
    }

    // Form validation
    const form = document.getElementById('addProductForm') || document.getElementById('editProductForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
    }

    // Load categories
    loadCategoriesForForm();
}

/**
 * Setup add product specific elements
 */
function setupAddProductSpecificElements() {
    // Initialize form with default values
    updateStockStatusPreview();
    calculateFinalPrice();
}

/**
 * Load categories for form dropdown
 */
async function loadCategoriesForForm() {
    try {
        const categories = await window.API.categories.getAll();
        const categorySelect = document.getElementById('productCategory');

        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Select Category</option>';
            categories.forEach(category => {
                categorySelect.innerHTML += `<option value="${category.id}">${category.name}</option>`;
            });
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
        Utils.showToast('Failed to load categories', 'error');
    }
}

/**
 * Load product data for editing
 */
async function loadProductForEdit() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        Utils.showToast('Product ID not found', 'error');
        window.location.href = 'products.html';
        return;
    }

    try {
        const product = await window.API.products.getById(productId);
        populateFormWithProductData(product);

    } catch (error) {
        console.error('Failed to load product for edit:', error);
        Utils.showToast('Failed to load product details', 'error');
        window.location.href = 'products.html';
    }
}

/**
 * Populate form with product data
 * @param {object} product - Product data
 */
function populateFormWithProductData(product) {
    // Basic information
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productCategory').value = product.categoryId || '';
    document.getElementById('productDescription').value = product.description || '';

    // Pricing
    document.getElementById('productPrice').value = product.price || '';
    document.getElementById('productDiscount').value = product.discount || 0;

    // Inventory
    document.getElementById('productQuantity').value = product.quantity || '';
    document.getElementById('productStatus').value = product.status || 'ACTIVE';

    // Image preview
    if (product.imageUrl) {
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        if (imagePreview && previewImg) {
            previewImg.src = product.imageUrl;
            imagePreview.style.display = 'block';
        }
    }

    // Update calculations
    calculateFinalPrice();
    updateStockStatusPreview();

    // Store product ID for form submission
    const form = document.getElementById('editProductForm');
    if (form) {
        let idInput = form.querySelector('input[name="id"]');
        if (!idInput) {
            idInput = document.createElement('input');
            idInput.type = 'hidden';
            idInput.name = 'id';
            form.appendChild(idInput);
        }
        idInput.value = product.id;
    }
}

/**
 * Calculate and display final price
 */
function calculateFinalPrice() {
    const priceInput = document.getElementById('productPrice');
    const discountInput = document.getElementById('productDiscount');
    const finalPriceDisplay = document.getElementById('finalPrice');

    if (!priceInput || !discountInput || !finalPriceDisplay) return;

    const price = parseFloat(priceInput.value) || 0;
    const discount = parseFloat(discountInput.value) || 0;

    const finalPrice = price - (price * discount / 100);

    finalPriceDisplay.textContent = Utils.formatCurrency(finalPrice);
}

/**
 * Update stock status preview
 */
function updateStockStatusPreview() {
    const quantityInput = document.getElementById('productQuantity');
    const statusPreview = document.getElementById('stockStatusPreview');

    if (!quantityInput || !statusPreview) return;

    const quantity = parseInt(quantityInput.value) || 0;
    let statusClass = 'in-stock';
    let statusText = quantity.toString();

    if (quantity === 0) {
        statusClass = 'out-of-stock';
    } else if (quantity <= 5) {
        statusClass = 'low-stock';
    }

    statusPreview.className = `status-indicator ${statusClass}`;
    statusPreview.textContent = statusText;
}

/**
 * Handle image preview
 * @param {Event} event - File input change event
 */
function handleImagePreview(event) {
    const file = event.target.files[0];
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');

    if (!file || !imagePreview || !previewImg) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        Utils.showToast('Please select a valid image file', 'error');
        event.target.value = '';
        return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        Utils.showToast('Image size should be less than 5MB', 'error');
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        previewImg.src = e.target.result;
        imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

/**
 * Validate a single field
 * @param {HTMLElement} field - Form field to validate
 * @returns {boolean} - True if valid
 */
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    switch (fieldName) {
        case 'name':
            if (!Utils.isRequired(value)) {
                errorMessage = 'Product name is required';
                isValid = false;
            } else if (value.length < 2) {
                errorMessage = 'Product name must be at least 2 characters';
                isValid = false;
            } else if (value.length > 100) {
                errorMessage = 'Product name must be less than 100 characters';
                isValid = false;
            }
            break;

        case 'categoryId':
            if (!Utils.isRequired(value)) {
                errorMessage = 'Please select a category';
                isValid = false;
            }
            break;

        case 'price':
            if (!Utils.isRequired(value)) {
                errorMessage = 'Price is required';
                isValid = false;
            } else if (!Utils.isValidNumber(value, { min: 0 })) {
                errorMessage = 'Please enter a valid price';
                isValid = false;
            }
            break;

        case 'discount':
            if (value && (!Utils.isValidNumber(value, { min: 0, max: 100 }))) {
                errorMessage = 'Discount must be between 0 and 100';
                isValid = false;
            }
            break;

        case 'quantity':
            if (!Utils.isRequired(value)) {
                errorMessage = 'Quantity is required';
                isValid = false;
            } else if (!Utils.isValidNumber(value, { min: 0 })) {
                errorMessage = 'Quantity must be a positive number';
                isValid = false;
            }
            break;

        case 'description':
            if (value.length > 1000) {
                errorMessage = 'Description must be less than 1000 characters';
                isValid = false;
            }
            break;
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }

    return isValid;
}

/**
 * Show field error
 * @param {HTMLElement} field - Form field
 * @param {string} message - Error message
 */
function showFieldError(field, message) {
    field.classList.add('error');

    const errorElement = document.getElementById(`${field.name}Error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

/**
 * Clear field error
 * @param {HTMLElement} field - Form field
 */
function clearFieldError(field) {
    field.classList.remove('error');

    const errorElement = document.getElementById(`${field.name}Error`);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

/**
 * Handle form submission
 * @param {Event} event - Form submit event
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const isEdit = form.id === 'editProductForm';

    // Validate all fields
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isFormValid = true;

    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });

    if (!isFormValid) {
        Utils.showToast('Please fix the errors in the form', 'error');
        return;
    }

    // Prepare product data
    const rawStatus = (formData.get('status') || '').toString().trim();
    let normalizedStatus = rawStatus.toUpperCase();
    if (normalizedStatus === 'INACTIVE') {
        normalizedStatus = 'DISCONTINUED';
    }

    const previewImg = document.getElementById('previewImg');
    const previewSrc = previewImg ? previewImg.getAttribute('src') : '';
    let imageUrl = previewSrc ? previewSrc : '/assets/icons/product-placeholder.svg';
    if (imageUrl.startsWith('data:')) {
        // Avoid sending base64 data URLs to the backend (will exceed DB column length)
        imageUrl = '/assets/icons/product-placeholder.svg';
    }

    const productData = {
        name: formData.get('name').trim(),
        categoryId: parseInt(formData.get('categoryId')),
        description: formData.get('description').trim(),
        price: parseFloat(formData.get('price')),
        discount: parseFloat(formData.get('discount') || 0),
        quantity: parseInt(formData.get('quantity')),
        status: normalizedStatus || 'ACTIVE',
        imageUrl: imageUrl
    };

    // Handle image upload
    const imageFile = formData.get('image');
    if (imageFile && imageFile.size > 0) {
        // In a real implementation, you would upload the image first and get the URL
        // For now, we'll just note that image handling would be implemented here
        console.log('Image upload would be handled here:', imageFile.name);
    }

    // Disable submit button
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = isEdit ? 'Updating...' : 'Adding...';

    try {
        if (isEdit) {
            const productId = formData.get('id');
            await window.API.products.update(productId, productData);
            Utils.showToast('Product updated successfully', 'success');
        } else {
            await window.API.products.create(productData);
            Utils.showToast('Product added successfully', 'success');
        }

        // Redirect to products list
        setTimeout(() => {
            window.location.href = 'products.html';
        }, 1500);

    } catch (error) {
        console.error('Failed to save product:', error);
        Utils.showToast(`Failed to ${isEdit ? 'update' : 'add'} product`, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Export functions for global access
window.ProductForm = {
    validateField: validateField,
    calculateFinalPrice: calculateFinalPrice,
    updateStockStatusPreview: updateStockStatusPreview
};
