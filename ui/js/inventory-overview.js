// Inventory Overview JavaScript - Fetches and renders backend data

document.addEventListener('DOMContentLoaded', function() {
    initializeInventoryOverview();
});

function initializeInventoryOverview() {
    loadInventoryOverview();
    setupMenuToggle();
}

function setupMenuToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }
}

async function loadInventoryOverview() {
    setKpiLoading(true);

    try {
        const [stats, categories, products] = await Promise.all([
            window.API.dashboard.getStats(),
            window.API.categories.getAll(),
            fetchAllProducts()
        ]);

        const categoryMap = new Map((categories || []).map(category => [category.id, category.name]));

        updateKpis(stats, products);
        renderFastMovers(products, categoryMap);
        renderCategoryCoverage(products, categoryMap);
    } catch (error) {
        console.error('Failed to load inventory overview:', error);
        Utils.showToast('Failed to load inventory overview data', 'error');
        setKpiFallback();
        renderEmptyStates();
    }
}

function setKpiLoading(isLoading) {
    const elements = [
        document.getElementById('invItemsTracked'),
        document.getElementById('invLowStock'),
        document.getElementById('invOutOfStock'),
        document.getElementById('invAvgStock')
    ];

    elements.forEach(element => {
        if (element) {
            element.textContent = isLoading ? '...' : '0';
        }
    });
}

function setKpiFallback() {
    setKpiLoading(false);
}

async function fetchAllProducts() {
    const response = await window.API.products.getAll({ page: 1, size: 1000 });
    if (Array.isArray(response)) return response;
    return response?.content || [];
}

function updateKpis(stats, products) {
    const totalProducts = stats?.totalProducts ?? products.length ?? 0;
    const lowStock = stats?.lowStockProducts ?? countLowStock(products);
    const outOfStock = stats?.outOfStockProducts ?? countOutOfStock(products);
    const avgStock = calculateAverageStock(products);

    const itemsTracked = document.getElementById('invItemsTracked');
    const lowStockEl = document.getElementById('invLowStock');
    const outOfStockEl = document.getElementById('invOutOfStock');
    const avgStockEl = document.getElementById('invAvgStock');

    if (itemsTracked) itemsTracked.textContent = totalProducts;
    if (lowStockEl) lowStockEl.textContent = lowStock;
    if (outOfStockEl) outOfStockEl.textContent = outOfStock;
    if (avgStockEl) avgStockEl.textContent = avgStock;
}

function calculateAverageStock(products) {
    if (!products || products.length === 0) return 0;
    const totalQty = products.reduce((sum, product) => sum + (product.quantity || 0), 0);
    return (totalQty / products.length).toFixed(1);
}

function countLowStock(products) {
    return products.filter(product => (product.quantity || 0) > 0 && product.quantity <= 5).length;
}

function countOutOfStock(products) {
    return products.filter(product => (product.quantity || 0) === 0).length;
}

function renderFastMovers(products, categoryMap) {
    const tableBody = document.getElementById('fastMoversBody');
    if (!tableBody) return;

    if (!products || products.length === 0) {
        Utils.showEmptyState(tableBody, {
            icon: '📦',
            title: 'No Products Yet',
            message: 'Add products to see fast movers.',
            actionText: 'Add Product',
            actionUrl: 'add-product.html'
        });
        return;
    }

    const fastMovers = [...products]
        .sort((a, b) => (a.quantity || 0) - (b.quantity || 0))
        .slice(0, 3);

    tableBody.innerHTML = fastMovers.map(product => {
        const statusClass = getStatusBadgeClass(product.status);
        const statusText = getStatusText(product.status);
        return `
            <tr>
                <td>${product.name}</td>
                <td>${categoryMap.get(product.categoryId) || 'Uncategorized'}</td>
                <td>${product.quantity ?? 0}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            </tr>
        `;
    }).join('');
}

function renderCategoryCoverage(products, categoryMap) {
    const tableBody = document.getElementById('categoryCoverageBody');
    if (!tableBody) return;

    if (!products || products.length === 0) {
        Utils.showEmptyState(tableBody, {
            icon: '📊',
            title: 'No Coverage Data',
            message: 'Add products to see category coverage.',
            actionText: 'Add Product',
            actionUrl: 'add-product.html'
        });
        return;
    }

    const categoryStats = new Map();

    products.forEach(product => {
        const categoryId = product.categoryId || 0;
        if (!categoryStats.has(categoryId)) {
            categoryStats.set(categoryId, {
                name: categoryMap.get(categoryId) || 'Uncategorized',
                skuCount: 0,
                lowStockCount: 0,
                totalQty: 0
            });
        }

        const stats = categoryStats.get(categoryId);
        stats.skuCount += 1;
        stats.totalQty += product.quantity || 0;
        if ((product.quantity || 0) <= 5) {
            stats.lowStockCount += 1;
        }
    });

    const rows = Array.from(categoryStats.values()).sort((a, b) => b.skuCount - a.skuCount);

    tableBody.innerHTML = rows.map(stats => {
        const avgStock = (stats.totalQty / stats.skuCount).toFixed(1);
        const lowStockRatio = stats.lowStockCount / stats.skuCount;
        let statusLabel = 'Healthy';
        let statusClass = 'active';
        if (lowStockRatio > 0.3) {
            statusLabel = 'Critical';
            statusClass = 'out-of-stock';
        } else if (lowStockRatio > 0.1) {
            statusLabel = 'Watch';
            statusClass = 'low-stock';
        }

        return `
            <tr>
                <td>${stats.name}</td>
                <td>${stats.skuCount}</td>
                <td>${stats.lowStockCount}</td>
                <td>${avgStock}</td>
                <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
            </tr>
        `;
    }).join('');
}

function renderEmptyStates() {
    const fastMoversBody = document.getElementById('fastMoversBody');
    const categoryCoverageBody = document.getElementById('categoryCoverageBody');

    if (fastMoversBody) {
        Utils.showEmptyState(fastMoversBody, {
            icon: '📦',
            title: 'No Products Available',
            message: 'Add products to populate this section.',
            actionText: 'Add Product',
            actionUrl: 'add-product.html'
        });
    }

    if (categoryCoverageBody) {
        Utils.showEmptyState(categoryCoverageBody, {
            icon: '📊',
            title: 'No Coverage Data',
            message: 'Add products to populate coverage metrics.',
            actionText: 'Add Product',
            actionUrl: 'add-product.html'
        });
    }
}

function getStatusBadgeClass(status) {
    const normalized = (status || '').toString().toLowerCase();
    if (normalized === 'active') return 'active';
    if (normalized === 'out_of_stock') return 'out-of-stock';
    if (normalized === 'discontinued') return 'inactive';
    return 'pending';
}

function getStatusText(status) {
    const normalized = (status || '').toString().toLowerCase();
    if (normalized === 'active') return 'Active';
    if (normalized === 'out_of_stock') return 'Out of Stock';
    if (normalized === 'discontinued') return 'Discontinued';
    return status || 'Unknown';
}
