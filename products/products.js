const API_URL = 'https://fakestoreapi.com';
const PRODUCTS_PER_PAGE = 12;

let products = [];
let filteredProducts = [];
let currentPage = 1;
let currentView = 'grid';
let activeFilters = {
    categories: [],
    minPrice: null,
    maxPrice: null,
    sort: 'default',
    search: ''
};

const productsGrid = document.getElementById('products-grid');
const categoryFilters = document.getElementById('category-filters');
const activeFiltersContainer = document.getElementById('active-filters');
const loadingSpinner = document.querySelector('.loading-spinner');
const noResults = document.querySelector('.no-results');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const clearFiltersBtn = document.getElementById('clear-filters');
const sortSelect = document.getElementById('sort-options');
const minPriceInput = document.getElementById('min-price');
const maxPriceInput = document.getElementById('max-price');
const viewButtons = document.querySelectorAll('.view-btn');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageNumbers = document.querySelector('.page-numbers');
const quickViewModal = document.getElementById('quick-view-modal');

import {
    getProductRatings,
    addRating,
    getAverageRating,
    getProductReviews,
    formatReviewDate
} from '../utils/ratings.js';

import {
    isInWishlist,
    toggleWishlist,
    updateWishlistUI
} from '../utils/wishlist.js';

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    const cartCountElement = document.querySelector('.cart-count');
    let cartArr = [];
    try {
        cartArr = window.CartStorage ? window.CartStorage.getCart() : (JSON.parse(localStorage.getItem('cart')) || []);
    } catch (e) { cartArr = []; }
    if (cartCountElement) {
        const totalItems = Array.isArray(cartArr) ? cartArr.reduce((total, item) => total + item.quantity, 0) : 0;
        cartCountElement.textContent = totalItems;
    }
});

async function initializePage() {
    showLoading(true);
    try {
        await Promise.all([
            loadProducts(),
            loadCategories()
        ]);
        setupEventListeners();
        updateProductsDisplay();
    } catch (error) {
        console.error('Error initializing page:', error);
        showError('Failed to load products. Please try again later.');
    }
    showLoading(false);
}

function setupEventListeners() {
    searchInput.addEventListener('input', debounce(handleSearch, 500));
    searchButton.addEventListener('click', () => handleSearch());
    clearFiltersBtn.addEventListener('click', clearFilters);
    sortSelect.addEventListener('change', handleSort);
    minPriceInput.addEventListener('input', debounce(handlePriceFilter, 500));
    maxPriceInput.addEventListener('input', debounce(handlePriceFilter, 500));
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentView = btn.dataset.view;
            updateViewButtons();
            updateProductsDisplay();
        });
    });
    prevPageBtn.addEventListener('click', () => changePage(currentPage - 1));
    nextPageBtn.addEventListener('click', () => changePage(currentPage + 1));
    document.querySelector('.close-modal').addEventListener('click', closeQuickView);
    quickViewModal.addEventListener('click', e => {
        if (e.target === quickViewModal) closeQuickView();
    });
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        products = await response.json();
        filteredProducts = [...products];
    } catch (error) {
        console.error('Error loading products:', error);
        throw error;
    }
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/products/categories`);
        const categories = await response.json();
        renderCategories(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
        throw error;
    }
}

function renderCategories(categories) {
    categoryFilters.innerHTML = categories.map(category => `
        <label class="filter-option">
            <input type="checkbox" value="${category}" 
                   ${activeFilters.categories.includes(category) ? 'checked' : ''}>
            ${category.charAt(0).toUpperCase() + category.slice(1)}
        </label>
    `).join('');
    categoryFilters.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleCategoryFilter);
    });
}

function handleCategoryFilter(e) {
    const category = e.target.value;
    if (e.target.checked) {
        activeFilters.categories.push(category);
    } else {
        activeFilters.categories = activeFilters.categories.filter(c => c !== category);
    }
    currentPage = 1;
    updateActiveFilters();
    filterProducts();
}

function handlePriceFilter() {
    activeFilters.minPrice = minPriceInput.value ? parseFloat(minPriceInput.value) : null;
    activeFilters.maxPrice = maxPriceInput.value ? parseFloat(maxPriceInput.value) : null;
    currentPage = 1;
    updateActiveFilters();
    filterProducts();
}

function handleSearch() {
    activeFilters.search = searchInput.value.trim().toLowerCase();
    currentPage = 1;
    updateActiveFilters();
    filterProducts();
}

function handleSort() {
    activeFilters.sort = sortSelect.value;
    filterProducts();
}

function clearFilters() {
    activeFilters = {
        categories: [],
        minPrice: null,
        maxPrice: null,
        sort: 'default',
        search: ''
    };
    categoryFilters.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    searchInput.value = '';
    minPriceInput.value = '';
    maxPriceInput.value = '';
    sortSelect.value = 'default';
    currentPage = 1;
    updateActiveFilters();
    filterProducts();
}

function filterProducts() {
    filteredProducts = products.filter(product => {
        if (activeFilters.categories.length > 0 && !activeFilters.categories.includes(product.category)) {
            return false;
        }
        if (activeFilters.minPrice && product.price < activeFilters.minPrice) {
            return false;
        }
        if (activeFilters.maxPrice && product.price > activeFilters.maxPrice) {
            return false;
        }
        if (activeFilters.search) {
            const searchTerm = activeFilters.search.toLowerCase();
            return product.title.toLowerCase().includes(searchTerm) ||
                   product.description.toLowerCase().includes(searchTerm) ||
                   product.category.toLowerCase().includes(searchTerm);
        }
        return true;
    });
    sortProducts();
    updateProductsDisplay();
}

function sortProducts() {
    switch (activeFilters.sort) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
            break;
        default:
            filteredProducts.sort((a, b) => a.id - b.id);
    }
}

function updateProductsDisplay() {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const pageProducts = filteredProducts.slice(startIndex, endIndex);

    productsGrid.className = `products-grid ${currentView}-view`;
    
    if (pageProducts.length === 0) {
        showNoResults(true);
        return;
    }

    showNoResults(false);
    renderProducts(pageProducts);
    updatePagination();
}

function renderProducts(products) {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;
    const pageProducts = products.slice(start, end);

    productsGrid.className = `products-${currentView}`;
    productsGrid.innerHTML = pageProducts.map(product => {
        const averageRating = getAverageRating(product.id);
        const { ratings } = getProductRatings(product.id);
        const ratingCount = ratings.length;
        const isWishlisted = isInWishlist(product.id);
        console.log('Product image:', product.image);
        return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.title}">
                    <button class="quick-view-btn" onclick="showQuickView(${product.id})">
                        Quick View
                    </button>
                    <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" 
                            data-id="${product.id}" 
                            onclick="handleWishlistToggle(${product.id})">
                        <i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
                <div class="product-info">
                    <h3>${product.title}</h3>
                    <div class="product-rating">
                        ${renderStarRating(averageRating)}
                        <span class="rating-count">(${ratingCount})</span>
                    </div>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    }).join('');

    updatePagination();
}

function renderStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return `
        ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
        ${hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
        ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
        <span class="rating-value">${rating}</span>
    `;
}

function updateActiveFilters() {
    const filters = [];

    activeFilters.categories.forEach(category => {
        filters.push(`
            <div class="filter-tag">
                Category: ${category}
                <button class="remove-filter" onclick="removeFilter('category', '${category}')">×</button>
            </div>
        `);
    });

    if (activeFilters.minPrice) {
        filters.push(`
            <div class="filter-tag">
                Min Price: $${activeFilters.minPrice}
                <button class="remove-filter" onclick="removeFilter('minPrice')">×</button>
            </div>
        `);
    }
    if (activeFilters.maxPrice) {
        filters.push(`
            <div class="filter-tag">
                Max Price: $${activeFilters.maxPrice}
                <button class="remove-filter" onclick="removeFilter('maxPrice')">×</button>
            </div>
        `);
    }

    if (activeFilters.search) {
        filters.push(`
            <div class="filter-tag">
                Search: ${activeFilters.search}
                <button class="remove-filter" onclick="removeFilter('search')">×</button>
            </div>
        `);
    }

    activeFiltersContainer.innerHTML = filters.join('');
}

function removeFilter(type, value) {
    if (type === 'category') {
        activeFilters.categories = activeFilters.categories.filter(c => c !== value);
        categoryFilters.querySelector(`input[value="${value}"]`).checked = false;
    } else {
        activeFilters[type] = null;
        if (type === 'search') searchInput.value = '';
        if (type === 'minPrice') minPriceInput.value = '';
        if (type === 'maxPrice') maxPriceInput.value = '';
    }

    currentPage = 1;
    updateActiveFilters();
    filterProducts();
}

function updateViewButtons() {
    viewButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === currentView);
    });
}

function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    const pageNumbersHTML = [];
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - 1 && i <= currentPage + 1)
        ) {
            pageNumbersHTML.push(`
                <button class="page-number ${i === currentPage ? 'active' : ''}"
                        onclick="changePage(${i})">
                    ${i}
                </button>
            `);
        } else if (
            i === currentPage - 2 ||
            i === currentPage + 2
        ) {
            pageNumbersHTML.push('<span class="page-ellipsis">...</span>');
        }
    }

    pageNumbers.innerHTML = pageNumbersHTML.join('');
}

function changePage(page) {
    currentPage = page;
    updateProductsDisplay();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function showQuickView(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const { reviews, total, totalPages } = getProductReviews(productId);
    const averageRating = getAverageRating(productId);

    const modalContent = document.querySelector('.product-quick-view');
    modalContent.innerHTML = `
        <div class="quick-view-grid">
            <div class="product-image">
                <img src="${product.image}" alt="${product.title}">
                <div class="image-zoom-overlay"></div>
            </div>
            <div class="product-details">
                <h2>${product.title}</h2>
                <div class="product-rating">
                    ${renderStarRating(averageRating)}
                    <span class="rating-count">(${total} reviews)</span>
                </div>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <p class="product-description">${product.description}</p>
                <div class="product-actions">
                    <div class="quantity-selector">
                        <button class="quantity-btn" onclick="updateQuantity(${productId}, -1)">-</button>
                        <input type="number" value="1" min="1" id="quantity-${productId}">
                        <button class="quantity-btn" onclick="updateQuantity(${productId}, 1)">+</button>
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCart(${productId})">
                        Add to Cart
                    </button>
                    <button class="wishlist-btn" onclick="toggleWishlist(${productId})">
                        <i class="far fa-heart"></i> Add to Wishlist
                    </button>
                </div>
            </div>
        </div>
        <div class="product-reviews">
            <h3>Customer Reviews</h3>
            <div class="review-summary">
                <div class="average-rating">
                    <span class="large-rating">${averageRating}</span>
                    ${renderStarRating(averageRating)}
                </div>
                <button class="write-review-btn" onclick="showReviewForm(${productId})">
                    Write a Review
                </button>
            </div>
            <div class="reviews-list">
                ${reviews.map(review => `
                    <div class="review-item">
                        <div class="review-header">
                            ${renderStarRating(review.rating)}
                            <span class="review-date">${formatReviewDate(review.timestamp)}</span>
                        </div>
                        <p class="review-text">${review.review}</p>
                    </div>
                `).join('')}
            </div>
            ${totalPages > 1 ? `
                <div class="reviews-pagination">
                    <!-- Pagination controls will be added here -->
                </div>
            ` : ''}
        </div>
    `;

    quickViewModal.style.display = 'flex';
    setupImageZoom();
}

function setupImageZoom() {
    const image = document.querySelector('.product-image img');
    const overlay = document.querySelector('.image-zoom-overlay');
    
    image.addEventListener('mousemove', (e) => {
        const { left, top, width, height } = image.getBoundingClientRect();
        const x = (e.clientX - left) / width * 100;
        const y = (e.clientY - top) / height * 100;
        
        overlay.style.backgroundImage = `url(${image.src})`;
        overlay.style.backgroundPosition = `${x}% ${y}%`;
        overlay.style.display = 'block';
    });
    
    image.addEventListener('mouseleave', () => {
        overlay.style.display = 'none';
    });
}

function showReviewForm(productId) {
    const form = document.createElement('div');
    form.className = 'review-form';
    form.innerHTML = `
        <h3>Write a Review</h3>
        <div class="rating-input">
            <span>Your Rating:</span>
            <div class="star-rating">
                ${[1, 2, 3, 4, 5].map(num => `
                    <i class="far fa-star" data-rating="${num}"></i>
                `).join('')}
            </div>
        </div>
        <textarea placeholder="Write your review here..." rows="4"></textarea>
        <div class="form-actions">
            <button class="cancel-btn">Cancel</button>
            <button class="submit-btn" disabled>Submit Review</button>
        </div>
    `;

    const reviewsSection = document.querySelector('.product-reviews');
    reviewsSection.insertBefore(form, reviewsSection.firstChild);

    setupReviewForm(form, productId);
}

function setupReviewForm(form, productId) {
    const stars = form.querySelectorAll('.star-rating i');
    const textarea = form.querySelector('textarea');
    const submitBtn = form.querySelector('.submit-btn');
    const cancelBtn = form.querySelector('.cancel-btn');
    let selectedRating = 0;

    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const rating = parseInt(star.dataset.rating);
            updateStars(stars, rating, 'hover');
        });

        star.addEventListener('mouseout', () => {
            updateStars(stars, selectedRating, 'selected');
        });

        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.rating);
            updateStars(stars, selectedRating, 'selected');
            validateForm();
        });
    });

    textarea.addEventListener('input', validateForm);

    function validateForm() {
        submitBtn.disabled = !(selectedRating > 0 && textarea.value.trim().length >= 10);
    }

    cancelBtn.addEventListener('click', () => {
        form.remove();
    });

    submitBtn.addEventListener('click', async () => {
        const review = textarea.value.trim();
        const userId = getCurrentUserId();
        
        try {
            await addRating(productId, selectedRating, review, userId);
            showNotification('Review submitted successfully!');
            form.remove();
            showQuickView(productId);
        } catch (error) {
            console.error('Error submitting review:', error);
            showNotification('Failed to submit review. Please try again.', 'error');
        }
    });
}

function updateStars(stars, rating, type) {
    stars.forEach((star, index) => {
        if (index < rating) {
            star.className = 'fas fa-star';
        } else {
            star.className = 'far fa-star';
        }
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    CartStorage.addToCart(product);
    updateCartCount();
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.classList.add('cart-bounce');
        setTimeout(() => cartCountElement.classList.remove('cart-bounce'), 400);
    }
    showNotification('Product added to cart!');
}

function updateCartCount() {
    let cart = [];
    try {
        cart = window.CartStorage ? window.CartStorage.getCart() : (JSON.parse(localStorage.getItem('cart')) || []);
    } catch (e) { cart = []; }
    const totalItems = Array.isArray(cart) ? cart.reduce((total, item) => total + item.quantity, 0) : 0;
    document.querySelector('.cart-count').textContent = totalItems;
}

function showLoading(show) {
    loadingSpinner.style.display = show ? 'flex' : 'none';
    productsGrid.style.opacity = show ? '0.5' : '1';
}

function showNoResults(show) {
    noResults.style.display = show ? 'block' : 'none';
    productsGrid.style.display = show ? 'none' : 'grid';
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
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

updateCartCount();

function handleWishlistToggle(productId) {
    const isWishlisted = toggleWishlist(productId);
    updateWishlistUI(productId);
    
    showNotification(
        isWishlisted 
            ? 'Product added to wishlist!' 
            : 'Product removed from wishlist!'
    );
}

window.handleWishlistToggle = handleWishlistToggle;

function showError(message) {
    alert(message);
}

function closeQuickView() {
    const quickViewModal = document.getElementById('quick-view-modal');
    if (quickViewModal) quickViewModal.style.display = 'none';
}

window.addToCart = addToCart; 