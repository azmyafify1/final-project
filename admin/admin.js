// DOM Elements
const adminSections = document.querySelectorAll('.admin-section');
const navLinks = document.querySelectorAll('.admin-nav a');
const dateRangeSelect = document.getElementById('date-range');
const salesChart = document.getElementById('sales-chart');
const productsList = document.getElementById('products-list');
const recentOrders = document.getElementById('recent-orders');
const customersList = document.getElementById('customers-list');
const addProductModal = document.getElementById('add-product-modal');
const addProductForm = document.getElementById('add-product-form');
const searchInput = document.querySelector('.header-search input');
const notificationBtn = document.querySelector('.notification-btn');
const logoutBtn = document.querySelector('.logout-btn');

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Check admin authentication
    if (!AuthStatus.isAdmin()) {
        window.location.href = '../auth/auth.html';
        return;
    }

    initializeNavigation();
    initializeCharts();
    loadDashboardData();
    setupEventListeners();
});

// Navigation
function initializeNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(section);
        });
    });
}

function showSection(sectionId) {
    // Update navigation
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.section === sectionId);
    });

    // Show selected section
    adminSections.forEach(section => {
        section.classList.toggle('active', section.id === `${sectionId}-section`);
    });

    // Load section data if needed
    switch (sectionId) {
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'customers':
            loadCustomers();
            break;
    }
}

// Charts
function initializeCharts() {
    // Sales Chart
    const ctx = salesChart.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                borderColor: '#3498db',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Data Loading
function loadDashboardData() {
    loadMetrics();
    loadTopProducts();
    loadRecentOrders();
}

function loadMetrics() {
    // In a real app, this would be an API call
    const metrics = {
        sales: {
            value: 12458,
            change: 8.2,
            trend: 'up'
        },
        orders: {
            value: 284,
            change: 12.5,
            trend: 'up'
        },
        customers: {
            value: 54,
            change: -3.8,
            trend: 'down'
        },
        conversion: {
            value: 3.42,
            change: 0.8,
            trend: 'up'
        }
    };

    // Update metrics display
    Object.entries(metrics).forEach(([key, data]) => {
        const card = document.querySelector(`.metric-card .${key}`);
        if (card) {
            const valueEl = card.parentElement.querySelector('.metric-value');
            const changeEl = card.parentElement.querySelector('.metric-change');
            
            valueEl.textContent = formatMetricValue(key, data.value);
            changeEl.innerHTML = `
                <i class="fas fa-arrow-${data.trend}"></i>
                ${Math.abs(data.change)}% vs last month
            `;
            changeEl.className = `metric-change ${data.trend === 'up' ? 'positive' : 'negative'}`;
        }
    });
}

function loadTopProducts() {
    // In a real app, this would be an API call
    const products = [
        { name: 'Wireless Earbuds', sales: 145, revenue: 7250 },
        { name: 'Smart Watch', sales: 98, revenue: 19600 },
        { name: 'Bluetooth Speaker', sales: 67, revenue: 4690 },
        { name: 'Phone Case', sales: 200, revenue: 3000 }
    ];

    const productList = document.querySelector('.product-list');
    productList.innerHTML = products.map(product => `
        <div class="product-item">
            <div class="product-info">
                <h4>${product.name}</h4>
                <p>${product.sales} sales</p>
            </div>
            <div class="product-revenue">
                $${product.revenue.toLocaleString()}
            </div>
        </div>
    `).join('');
}

function loadProducts(page = 1) {
    // In a real app, this would be an API call
    const products = [
        {
            id: 1,
            name: 'Wireless Earbuds',
            category: 'Electronics',
            price: 49.99,
            stock: 156,
            status: 'active'
        },
        // Add more products...
    ];

    productsList.innerHTML = products.map(product => `
        <tr>
            <td>
                <input type="checkbox" data-product-id="${product.id}">
            </td>
            <td>
                <div class="product-cell">
                    <img src="../assets/products/${product.id}.jpg" alt="${product.name}">
                    <div class="product-info">
                        <h4>${product.name}</h4>
                        <p>SKU: PRD${product.id}</p>
                    </div>
                </div>
            </td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <span class="status-badge ${product.status}">
                    ${product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function loadOrders(page = 1) {
    // In a real app, this would be an API call
    const orders = [
        {
            id: 'ORD123',
            customer: 'John Doe',
            items: 3,
            total: 149.97,
            date: '2024-03-15',
            status: 'processing'
        },
        // Add more orders...
    ];

    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = orders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.customer}</td>
            <td>${order.items} items</td>
            <td>$${order.total.toFixed(2)}</td>
            <td>${formatDate(order.date)}</td>
            <td>
                <span class="status-badge ${order.status}">
                    ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="viewOrder('${order.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" onclick="updateOrderStatus('${order.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function loadCustomers(page = 1) {
    // In a real app, this would be an API call
    const customers = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            orders: 5,
            spent: 749.95,
            lastOrder: '2024-03-15',
            status: 'active'
        },
        // Add more customers...
    ];

    customersList.innerHTML = customers.map(customer => `
        <tr>
            <td>
                <div class="customer-cell">
                    <img src="../assets/avatars/${customer.id}.jpg" alt="${customer.name}">
                    <div class="customer-info">
                        <h4>${customer.name}</h4>
                        <p>${customer.email}</p>
                    </div>
                </div>
            </td>
            <td>${customer.orders}</td>
            <td>$${customer.spent.toFixed(2)}</td>
            <td>${formatDate(customer.lastOrder)}</td>
            <td>
                <span class="status-badge ${customer.status}">
                    ${customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="viewCustomer(${customer.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" onclick="editCustomer(${customer.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Event Listeners
function setupEventListeners() {
    // Date range change
    dateRangeSelect.addEventListener('change', () => {
        loadDashboardData();
    });

    // Search
    searchInput.addEventListener('input', debounce((e) => {
        const query = e.target.value.toLowerCase();
        // Implement search based on current section
        const currentSection = document.querySelector('.admin-section.active').id;
        switch (currentSection) {
            case 'products-section':
                searchProducts(query);
                break;
            case 'orders-section':
                searchOrders(query);
                break;
            case 'customers-section':
                searchCustomers(query);
                break;
        }
    }, 300));

    // Add Product Form
    addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Implement product addition
        const formData = new FormData(addProductForm);
        addProduct(formData);
    });

    // Notifications
    notificationBtn.addEventListener('click', () => {
        // Implement notifications panel
        showNotifications();
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        AuthStatus.logout();
        window.location.href = '../auth/auth.html';
    });
}

// Product Management
function showAddProductModal() {
    addProductModal.classList.add('active');
}

function closeAddProductModal() {
    addProductModal.classList.remove('active');
    addProductForm.reset();
}

function addProduct(formData) {
    // Implement product addition
    // In a real app, this would be an API call
    closeAddProductModal();
    showNotification('Product added successfully');
    loadProducts();
}

function editProduct(productId) {
    // Implement product editing
    // In a real app, this would open a modal with product data
}

function deleteProduct(productId) {
    // Implement product deletion
    if (confirm('Are you sure you want to delete this product?')) {
        // In a real app, this would be an API call
        showNotification('Product deleted successfully');
        loadProducts();
    }
}

// Order Management
function viewOrder(orderId) {
}

function updateOrderStatus(orderId) {
}

// Customer Management
function viewCustomer(customerId) {
}

function editCustomer(customerId) {
}

// Utilities
function formatMetricValue(type, value) {
    switch (type) {
        case 'sales':
            return `$${value.toLocaleString()}`;
        case 'conversion':
            return `${value}%`;
        default:
            return value.toLocaleString();
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function debounce(func, wait) {
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

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Search Functions
function searchProducts(query) {
}

function searchOrders(query) {
}

function searchCustomers(query) {
}

// Export Functions
function exportData(type) {
    const data = {
        products: () => exportProducts(),
        orders: () => exportOrders(),
        customers: () => exportCustomers()
    };

    if (data[type]) {
        data[type]();
    }
}

function exportProducts() {
    // Implement product export
}

function exportOrders() {
    // Implement order export
}

function exportCustomers() {
    // Implement customer export
}

// Settings Management
document.querySelectorAll('.settings-form').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        saveSettings(form.id, formData);
    });
});

function saveSettings(section, data) {
    showNotification('Settings saved successfully');
} 