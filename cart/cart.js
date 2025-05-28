// Constants
const TAX_RATE = 0.08; 
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 5.99;

// DOM Elements
const cartItemsContainer = document.querySelector('.cart-items');
const cartContent = document.querySelector('.cart-content');
const emptyCart = document.querySelector('.empty-cart');
const subtotalElement = document.querySelector('.subtotal');
const shippingElement = document.querySelector('.shipping');
const taxElement = document.querySelector('.tax');
const totalElement = document.querySelector('.total-amount');
const promoInput = document.getElementById('promo-input');
const applyPromoBtn = document.getElementById('apply-promo');
const quantityModal = document.getElementById('quantity-modal');
const removeModal = document.getElementById('remove-modal');
const cartCountElement = document.querySelector('.cart-count');

// State Management
let cart = [];
let currentItemId = null;
let appliedPromo = null;

// Available Promo Codes
const promoCodes = {
    'WELCOME10': { discount: 0.10, description: '10% off' },
    'SAVE20': { discount: 0.20, description: '20% off' },
    'FREESHIP': { type: 'shipping', description: 'Free shipping' }
};

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    setupEventListeners();
    const storedCart = localStorage.getItem('cart');
    let cartArr = [];
    if (storedCart) {
        cartArr = JSON.parse(storedCart);
    }
    if (cartCountElement) {
        const totalItems = cartArr.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
});

function initializePage() {
    loadCart();
    updateCartDisplay();
}

// Event Listeners
function setupEventListeners() {
    // Promo code
    applyPromoBtn.addEventListener('click', handlePromoCode);
    promoInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') handlePromoCode();
    });

    // Modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => closeModals());
    });

    // Quantity modal
    const quantityInput = quantityModal.querySelector('.quantity-input');
    quantityModal.querySelector('.minus').addEventListener('click', () => {
        quantityInput.value = Math.max(1, parseInt(quantityInput.value) - 1);
    });
    quantityModal.querySelector('.plus').addEventListener('click', () => {
        quantityInput.value = parseInt(quantityInput.value) + 1;
    });
    quantityModal.querySelector('.update-quantity-btn').addEventListener('click', () => {
        updateItemQuantity(currentItemId, parseInt(quantityInput.value));
        closeModals();
    });

    // Remove modal
    removeModal.querySelector('.cancel-btn').addEventListener('click', closeModals);
    removeModal.querySelector('.confirm-btn').addEventListener('click', () => {
        removeItem(currentItemId);
        closeModals();
    });

    // Close modals when clicking outside
    [quantityModal, removeModal].forEach(modal => {
        modal.addEventListener('click', e => {
            if (e.target === modal) closeModals();
        });
    });
}

// Cart Management
function loadCart() {
    cart = CartStorage.getCart();
    updateCartCount();
}

function updateCartDisplay() {
    if (cart.length === 0) {
        showEmptyCart();
        return;
    }

    showCartContent();
    renderCartItems();
    updateCartSummary();
}

function renderCartItems() {
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-item-id="${item.productId}">
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="item-details">
                <h3 class="item-name">${item.name}</h3>
                <p class="item-price">$${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <div class="item-actions">
                <div class="quantity-display" onclick="showQuantityModal(${item.productId})">
                    <span>Qty: ${item.quantity}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <button class="remove-item" onclick="showRemoveModal(${item.productId})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function updateCartSummary() {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping(subtotal);
    const tax = calculateTax(subtotal);
    const total = calculateTotal(subtotal, shipping, tax);

    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    shippingElement.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    taxElement.textContent = `$${tax.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
}

// Calculations
function calculateSubtotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function calculateShipping(subtotal) {
    if (subtotal >= FREE_SHIPPING_THRESHOLD || (appliedPromo && appliedPromo.type === 'shipping')) {
        return 0;
    }
    return SHIPPING_COST;
}

function calculateTax(subtotal) {
    return subtotal * TAX_RATE;
}

function calculateTotal(subtotal, shipping, tax) {
    let total = subtotal + shipping + tax;
    
    if (appliedPromo && appliedPromo.discount) {
        total *= (1 - appliedPromo.discount);
    }
    
    return total;
}

// Item Actions
function showQuantityModal(itemId) {
    currentItemId = itemId;
    const item = cart.find(i => i.productId === itemId);
    if (!item) return;

    const quantityInput = quantityModal.querySelector('.quantity-input');
    quantityInput.value = item.quantity;
    
    quantityModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function showRemoveModal(itemId) {
    currentItemId = itemId;
    removeModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModals() {
    quantityModal.classList.remove('active');
    removeModal.classList.remove('active');
    document.body.style.overflow = '';
    currentItemId = null;
}

function updateItemQuantity(itemId, newQuantity) {
    if (newQuantity < 1) return;
    
    CartStorage.updateQuantity(itemId, newQuantity);
    loadCart();
    updateCartDisplay();
    showNotification('Cart updated');
}

function removeItem(itemId) {
    CartStorage.removeFromCart(itemId);
    loadCart();
    updateCartDisplay();
    showNotification('Item removed from cart');
}

// Promo Code Handling
function handlePromoCode() {
    const code = promoInput.value.trim().toUpperCase();
    const promo = promoCodes[code];

    if (!promo) {
        showNotification('Invalid promo code', 'error');
        return;
    }

    appliedPromo = promo;
    updateCartSummary();
    showNotification(`Promo code applied: ${promo.description}`);
    promoInput.value = '';
}

// UI Helpers
function showEmptyCart() {
    cartContent.style.display = 'none';
    emptyCart.style.display = 'block';
}

function showCartContent() {
    cartContent.style.display = 'grid';
    emptyCart.style.display = 'none';
}

function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = totalItems;
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

// Checkout
function proceedToCheckout() {
    if (!AuthStatus.isAuthenticated()) {
        AuthStatus.redirectToLogin();
        return;
    }

    // Save cart state for order processing
    const orderData = {
        items: cart,
        subtotal: calculateSubtotal(),
        shipping: calculateShipping(calculateSubtotal()),
        tax: calculateTax(calculateSubtotal()),
        total: calculateTotal(
            calculateSubtotal(),
            calculateShipping(calculateSubtotal()),
            calculateTax(calculateSubtotal())
        ),
        promo: appliedPromo
    };

    // Store order data for checkout process
    localStorage.setItem('pending_order', JSON.stringify(orderData));

    // Redirect to checkout
    window.location.href = '../orders/checkout.html';
} 