// Wishlist Management

const WISHLIST_STORAGE_KEY = 'shopease_wishlist';

// Get wishlist from storage
function getWishlist() {
    const wishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return wishlist ? JSON.parse(wishlist) : [];
}

// Save wishlist to storage
function saveWishlist(wishlist) {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
}

// Add product to wishlist
function addToWishlist(productId) {
    const wishlist = getWishlist();
    if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        saveWishlist(wishlist);
        return true;
    }
    return false;
}

// Remove product from wishlist
function removeFromWishlist(productId) {
    const wishlist = getWishlist();
    const index = wishlist.indexOf(productId);
    if (index > -1) {
        wishlist.splice(index, 1);
        saveWishlist(wishlist);
        return true;
    }
    return false;
}

// Check if product is in wishlist
function isInWishlist(productId) {
    const wishlist = getWishlist();
    return wishlist.includes(productId);
}

// Get all wishlist products
async function getWishlistProducts() {
    const wishlist = getWishlist();
    if (wishlist.length === 0) return [];
    
    try {
        const products = await fetch('https://fakestoreapi.com/products')
            .then(res => res.json());
        
        return products.filter(product => wishlist.includes(product.id));
    } catch (error) {
        console.error('Error fetching wishlist products:', error);
        return [];
    }
}

// Toggle wishlist status
function toggleWishlist(productId) {
    if (isInWishlist(productId)) {
        removeFromWishlist(productId);
        return false;
    } else {
        addToWishlist(productId);
        return true;
    }
}

// Update wishlist UI
function updateWishlistUI(productId) {
    const wishlistBtns = document.querySelectorAll(`.wishlist-btn[data-id="${productId}"]`);
    const isWishlisted = isInWishlist(productId);
    
    wishlistBtns.forEach(btn => {
        const icon = btn.querySelector('i');
        if (isWishlisted) {
            btn.classList.add('active');
            icon.className = 'fas fa-heart';
        } else {
            btn.classList.remove('active');
            icon.className = 'far fa-heart';
        }
    });
}

// Export functions
export {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistProducts,
    toggleWishlist,
    updateWishlistUI
}; 