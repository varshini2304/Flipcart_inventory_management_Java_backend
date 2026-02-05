// Categories Management JavaScript

document.addEventListener('DOMContentLoaded', function () {
    initializeCategories();
});

/**
 * Initialize categories page
 */
function initializeCategories() {
    setupEventListeners();

    // 🔒 IMPORTANT: Ensure modals are hidden on page load
    hideAddCategoryModal();
    hideEditCategoryModal();

    loadCategories();
}

function setupEventListeners() {
    // Menu toggle for mobile
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function () {
            sidebar.classList.toggle('show');
        });
    }

    // Add category button
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', showAddCategoryModal);
    }

    // Modal close buttons
    const closeAddModal = document.getElementById('closeAddModal');
    const closeEditModal = document.getElementById('closeEditModal');
    const cancelAddBtn = document.getElementById('cancelAddBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');

    if (closeAddModal) closeAddModal.addEventListener('click', hideAddCategoryModal);
    if (closeEditModal) closeEditModal.addEventListener('click', hideEditCategoryModal);
    if (cancelAddBtn) cancelAddBtn.addEventListener('click', hideAddCategoryModal);
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', hideEditCategoryModal);

    // Form submissions
    const addCategoryForm = document.getElementById('addCategoryForm');
    const editCategoryForm = document.getElementById('editCategoryForm');

    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', handleAddCategory);
    }

    if (editCategoryForm) {
        editCategoryForm.addEventListener('submit', handleEditCategory);
    }

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', Utils.debounce(handleSearch, 300));
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadCategories);
    }

    // Close modals when clicking outside
    document.addEventListener('click', function (event) {
        const addModal = document.getElementById('addCategoryModal');
        const editModal = document.getElementById('editCategoryModal');

        if (event.target === addModal) {
            hideAddCategoryModal();
        }

        if (event.target === editModal) {
            hideEditCategoryModal();
        }
    });
}

/**
 * Load categories from API
 */
async function loadCategories() {
    const tableBody = document.getElementById('categoriesTableBody');
    if (!tableBody) return;

    try {
        Utils.showLoading(tableBody, 'Loading categories...');
        const categories = await window.API.categories.getAll();

        if (categories && categories.length > 0) {
            renderCategories(categories);
        } else {
            Utils.showEmptyState(tableBody, {
                icon: '📁',
                title: 'No Categories Found',
                message: 'Start by adding your first category.',
                actionText: 'Add Category',
                actionUrl: '#'
            });

            const actionBtn = tableBody.querySelector('.btn');
            if (actionBtn) {
                actionBtn.addEventListener('click', showAddCategoryModal);
            }
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
        Utils.showToast('Failed to load categories', 'error');

        Utils.showEmptyState(tableBody, {
            icon: '❌',
            title: 'Error Loading Categories',
            message: 'Please try again later.',
            actionText: 'Retry',
            actionUrl: '#'
        });

        const retryBtn = tableBody.querySelector('.btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', loadCategories);
        }
    }
}

/**
 * Render categories table
 */
function renderCategories(categories) {
    const tableBody = document.getElementById('categoriesTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = categories.map(category => `
        <tr>
            <td><strong>${category.name}</strong></td>
            <td>${category.description || 'No description'}</td>
            <td>
                <span class="status-badge active">${category.productCount || 0}</span>
            </td>
            <td>${Utils.formatDate(category.createdAt || new Date())}</td>
            <td>
                <button onclick="editCategory(${category.id})">✏️</button>
                <button onclick="deleteCategory(${category.id}, '${category.name}')" class="danger">🗑️</button>
            </td>
        </tr>
    `).join('');
}

/**
 * Add Category Modal
 */
function showAddCategoryModal() {
    const modal = document.getElementById('addCategoryModal');
    if (!modal) return;

    modal.style.display = 'flex';

    const form = document.getElementById('addCategoryForm');
    if (form) form.reset();

    clearFormErrors('addCategoryForm');

    const firstInput = document.getElementById('categoryName');
    if (firstInput) firstInput.focus();
}

function hideAddCategoryModal() {
    const modal = document.getElementById('addCategoryModal');
    if (modal) modal.style.display = 'none';
}

/**
 * Edit Category Modal
 */
function showEditCategoryModal(categoryId) {
    const modal = document.getElementById('editCategoryModal');
    if (!modal) return;

    loadCategoryForEdit(categoryId);
    modal.style.display = 'flex';
}

function hideEditCategoryModal() {
    const modal = document.getElementById('editCategoryModal');
    if (modal) modal.style.display = 'none';
}

/**
 * Load category data for editing
 */
async function loadCategoryForEdit(categoryId) {
    try {
        const category = await window.API.categories.getById(categoryId);

        document.getElementById('editCategoryId').value = category.id;
        document.getElementById('editCategoryName').value = category.name;
        document.getElementById('editCategoryDescription').value = category.description || '';

        clearFormErrors('editCategoryForm');
    } catch (error) {
        console.error(error);
        Utils.showToast('Failed to load category details', 'error');
        hideEditCategoryModal();
    }
}

/**
 * Add category
 */
async function handleAddCategory(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name').trim(),
        description: formData.get('description').trim()
    };

    if (!validateCategoryForm(data, 'addCategoryForm')) return;

    try {
        await window.API.categories.create(data);
        Utils.showToast('Category added successfully', 'success');
        hideAddCategoryModal();
        loadCategories();
    } catch {
        Utils.showToast('Failed to add category', 'error');
    }
}

/**
 * Edit category
 */
async function handleEditCategory(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const id = formData.get('id');

    const data = {
        name: formData.get('name').trim(),
        description: formData.get('description').trim()
    };

    if (!validateCategoryForm(data, 'editCategoryForm')) return;

    try {
        await window.API.categories.update(id, data);
        Utils.showToast('Category updated successfully', 'success');
        hideEditCategoryModal();
        loadCategories();
    } catch {
        Utils.showToast('Failed to update category', 'error');
    }
}

/**
 * Search
 */
function handleSearch() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    document.querySelectorAll('#categoriesTableBody tr').forEach(row => {
        row.style.display =
            row.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
}

/**
 * Delete category
 */
async function deleteCategory(id, name) {
    const confirmed = await Utils.showConfirmDialog(
        `Delete "${name}"? This cannot be undone.`,
        'Delete Category'
    );

    if (!confirmed) return;

    try {
        await window.API.categories.delete(id);
        Utils.showToast('Category deleted', 'success');
        loadCategories();
    } catch {
        Utils.showToast('Failed to delete category', 'error');
    }
}

/**
 * Validation helpers
 */
function validateCategoryForm(data, formId) {
    clearFormErrors(formId);

    if (!data.name || data.name.length < 2) {
        showFormError(formId, 'name', 'Category name is required');
        return false;
    }

    return true;
}

function showFormError(formId, field, message) {
    const prefix = formId === 'editCategoryForm' ? 'edit' : '';
    const error = document.getElementById(`${prefix}${field}Error`);
    const input = document.getElementById(`${prefix}Category${field.charAt(0).toUpperCase() + field.slice(1)}`);

    if (error) {
        error.textContent = message;
        error.style.display = 'block';
    }
    if (input) input.classList.add('error');
}

function clearFormErrors(formId) {
    document.querySelectorAll(`#${formId} .error-message`).forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });

    document.querySelectorAll(`#${formId} .form-control`).forEach(input => {
        input.classList.remove('error');
    });
}

/**
 * Global access
 */
window.Categories = {
    load: loadCategories,
    add: showAddCategoryModal,
    edit: editCategory,
    delete: deleteCategory
};
