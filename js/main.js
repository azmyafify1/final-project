// Constants
const API_URL = 'https://fakestoreapi.com';
const FEATURED_PRODUCTS_COUNT = 12;

// DOM Elements
const featuredProductsContainer = document.getElementById('featured-products');
const cartCountElement = document.querySelector('.cart-count');
const authLinks = document.querySelector('.auth-links');

// State Management
let currentUser = null;
let cart = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    await loadUserState();
    await loadCartState();
    await loadFeaturedProducts();
    updateAuthUI();
    updateCartCount();
}

// User Management
async function loadUserState() {
    try {
        const storedUser = localStorage.getItem('current_user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
            console.log('User loaded:', currentUser.username);
        }
    } catch (error) {
        console.error('Error loading user state:', error);
    }
}

function updateAuthUI() {
    if (currentUser) {
        authLinks.innerHTML = `
            <span class="user-welcome">Welcome, ${currentUser.username}</span>
            <a href="#" class="logout-btn" onclick="logout()">Logout</a>
        `;
    } else {
        authLinks.innerHTML = `
            <a href="auth/auth.html" class="login-btn">Login</a>
            <a href="auth/auth.html?action=register" class="register-btn">Register</a>
        `;
    }
}

function logout() {
    localStorage.removeItem('current_user');
    currentUser = null;
    updateAuthUI();
    window.location.reload();
}

// Cart Management
async function loadCartState() {
    try {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
            updateCartCount();
        }
    } catch (error) {
        console.error('Error loading cart state:', error);
    }
}

function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = totalItems;
}

function addToCart(product) {
    CartStorage.addToCart(product);
    cart = CartStorage.getCart();
    updateCartCount();
    // Show notification
    showNotification('Product added to cart!');
    console.log('Cart after add:', cart);
}

// Product Management
async function loadFeaturedProducts() {
    try {
        const response = await fetch(`${API_URL}/products?limit=${FEATURED_PRODUCTS_COUNT}`);
        const products = await response.json();
        
        displayFeaturedProducts(products);
    } catch (error) {
        console.error('Error loading featured products:', error);
        featuredProductsContainer.innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
}

function displayFeaturedProducts(products) {
    featuredProductsContainer.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <img src="${product.image}" alt="${product.title}" loading="lazy">
            <h3>${product.title}</h3>
            <p class="price">$${product.price.toFixed(2)}</p>
            <button onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                Add to Cart
            </button>
        </div>
    `).join('');
}

// Utility Functions
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: var(--primary-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: 4px;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        z-index: 1000;
    }
    
    .notification.show {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

window.addToCart = addToCart; 