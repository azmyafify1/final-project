// Constants
const STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

// DOM Elements
const shippingForm = document.getElementById('shipping-form');
const paymentForm = document.getElementById('payment-form');
const reviewForm = document.getElementById('review-form');
const progressSteps = document.querySelectorAll('.progress-step');
const stateSelect = document.getElementById('shipping-state');
const cardNumberInput = document.getElementById('card-number');
const cardExpiryInput = document.getElementById('card-expiry');
const cardCvvInput = document.getElementById('card-cvv');
const summaryItemsContainer = document.getElementById('summary-items');
const reviewItemsContainer = document.getElementById('review-items');
const reviewShippingContainer = document.getElementById('review-shipping');
const reviewPaymentContainer = document.getElementById('review-payment');

// State Management
let currentStep = 'shipping';
let orderData = null;
let shippingData = null;
let paymentData = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    setupEventListeners();
    populateStateSelect();
    setupInputFormatting();
});

function initializePage() {
    // Check authentication
    if (!AuthStatus.isAuthenticated()) {
        window.location.href = '../auth/auth.html';
        return;
    }

    // Load order data
    orderData = JSON.parse(localStorage.getItem('pending_order'));
    if (!orderData) {
        window.location.href = '../cart/cart.html';
        return;
    }

    updateOrderSummary();
}

// Event Listeners
function setupEventListeners() {
    shippingForm.addEventListener('submit', handleShippingSubmit);
    paymentForm.addEventListener('submit', handlePaymentSubmit);

    // Input formatting
    cardNumberInput.addEventListener('input', formatCardNumber);
    cardExpiryInput.addEventListener('input', formatCardExpiry);
    cardCvvInput.addEventListener('input', formatCardCvv);
}

// Form Handling
function handleShippingSubmit(e) {
    e.preventDefault();

    shippingData = {
        firstName: document.getElementById('shipping-first-name').value,
        lastName: document.getElementById('shipping-last-name').value,
        address: document.getElementById('shipping-address').value,
        city: document.getElementById('shipping-city').value,
        state: document.getElementById('shipping-state').value,
        zip: document.getElementById('shipping-zip').value,
        phone: document.getElementById('shipping-phone').value
    };

    showForm('payment');
}

function handlePaymentSubmit(e) {
    e.preventDefault();

    paymentData = {
        cardName: document.getElementById('card-name').value,
        cardNumber: document.getElementById('card-number').value,
        cardExpiry: document.getElementById('card-expiry').value,
        saveCard: document.getElementById('save-card').checked
    };

    updateReviewContent();
    showForm('review');
}

// Navigation
function showForm(step) {
    // Hide all forms
    document.querySelectorAll('.checkout-form').forEach(form => {
        form.classList.remove('active');
    });

    // Show selected form
    document.getElementById(`${step}-form`).classList.add('active');

    // Update progress
    updateProgress(step);

    // Update current step
    currentStep = step;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress(currentStep) {
    let found = false;
    progressSteps.forEach(step => {
        const stepName = step.dataset.step;
        if (stepName === currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
            found = true;
        } else if (!found) {
            step.classList.remove('active');
            step.classList.add('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}

// UI Updates
function updateOrderSummary() {
    // Update summary items
    summaryItemsContainer.innerHTML = orderData.items.map(item => `
        <div class="summary-item">
            <div class="summary-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="summary-item-details">
                <h4 class="summary-item-name">${item.name}</h4>
                <p class="summary-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
                <p class="summary-item-quantity">Qty: ${item.quantity}</p>
            </div>
        </div>
    `).join('');

    // Update totals
    document.querySelector('.subtotal').textContent = `$${orderData.subtotal.toFixed(2)}`;
    document.querySelector('.shipping').textContent = orderData.shipping === 0 ? 'FREE' : `$${orderData.shipping.toFixed(2)}`;
    document.querySelector('.tax').textContent = `$${orderData.tax.toFixed(2)}`;
    document.querySelector('.total-amount').textContent = `$${orderData.total.toFixed(2)}`;
}

function updateReviewContent() {
    // Update shipping review
    reviewShippingContainer.innerHTML = `
        <p>${shippingData.firstName} ${shippingData.lastName}</p>
        <p>${shippingData.address}</p>
        <p>${shippingData.city}, ${shippingData.state} ${shippingData.zip}</p>
        <p>${formatPhoneNumber(shippingData.phone)}</p>
    `;

    // Update payment review
    reviewPaymentContainer.innerHTML = `
        <p>${paymentData.cardName}</p>
        <p>Card ending in ${paymentData.cardNumber.slice(-4)}</p>
        <p>Expires: ${paymentData.cardExpiry}</p>
    `;

    // Update review items
    reviewItemsContainer.innerHTML = orderData.items.map(item => `
        <div class="summary-item">
            <div class="summary-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="summary-item-details">
                <h4 class="summary-item-name">${item.name}</h4>
                <p class="summary-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
                <p class="summary-item-quantity">Qty: ${item.quantity}</p>
            </div>
        </div>
    `).join('');
}

// Utilities
function populateStateSelect() {
    stateSelect.innerHTML = `
        <option value="">Select State</option>
        ${STATES.map(state => `<option value="${state}">${state}</option>`).join('')}
    `;
}

function setupInputFormatting() {
    // Format phone number on input
    document.getElementById('shipping-phone').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 3) {
                value = value;
            } else if (value.length <= 6) {
                value = `${value.slice(0,3)}-${value.slice(3)}`;
            } else {
                value = `${value.slice(0,3)}-${value.slice(3,6)}-${value.slice(6,10)}`;
            }
            e.target.value = value;
        }
    });
}

function formatCardNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
        value = value.match(/.{1,4}/g).join('-');
        e.target.value = value;
    }
}

function formatCardExpiry(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
        if (value.length >= 2) {
            value = `${value.slice(0,2)}/${value.slice(2,4)}`;
        }
        e.target.value = value;
    }
}

function formatCardCvv(e) {
    let value = e.target.value.replace(/\D/g, '');
    e.target.value = value.slice(0, 4);
}

function formatPhoneNumber(phone) {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
}

// Order Processing
async function placeOrder() {
    try {
        // Show loading state
        document.querySelector('.submit-btn').disabled = true;
        document.querySelector('.submit-btn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        // Prepare order data
        const order = {
            items: orderData.items,
            totals: {
                subtotal: orderData.subtotal,
                shipping: orderData.shipping,
                tax: orderData.tax,
                total: orderData.total
            },
            shipping: shippingData,
            payment: {
                cardName: paymentData.cardName,
                lastFour: paymentData.cardNumber.slice(-4),
                expiry: paymentData.cardExpiry
            },
            orderDate: new Date().toISOString(),
            status: 'processing'
        };

        // Save order (in a real app, this would be an API call)
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        order.orderId = `ORD${Date.now()}`;
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Clear cart and pending order
        localStorage.removeItem('pending_order');
        CartStorage.clearCart();

        // Redirect to confirmation page
        window.location.href = `confirmation.html?orderId=${order.orderId}`;
    } catch (error) {
        console.error('Error placing order:', error);
        showNotification('Error placing order. Please try again.', 'error');
        
        // Reset button state
        document.querySelector('.submit-btn').disabled = false;
        document.querySelector('.submit-btn').innerHTML = 'Place Order <i class="fas fa-check"></i>';
    }
}

// Notifications
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