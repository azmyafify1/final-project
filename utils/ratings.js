// Ratings and Reviews Management

// Constants
const STORAGE_KEY = 'shopease_ratings';

// Get all ratings and reviews from storage
function getAllRatings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
}

// Save ratings to storage
function saveRatings(ratings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
}

// Get ratings and reviews for a specific product
function getProductRatings(productId) {
    const ratings = getAllRatings();
    return ratings[productId] || { ratings: [], reviews: [] };
}

// Add a new rating and review
function addRating(productId, rating, review, userId) {
    const ratings = getAllRatings();
    const timestamp = new Date().toISOString();
    
    if (!ratings[productId]) {
        ratings[productId] = { ratings: [], reviews: [] };
    }
    
    const newRating = {
        userId,
        rating,
        timestamp
    };
    
    const newReview = review ? {
        userId,
        review,
        rating,
        timestamp
    } : null;
    
    ratings[productId].ratings.push(newRating);
    if (newReview) {
        ratings[productId].reviews.push(newReview);
    }
    
    saveRatings(ratings);
    return { rating: newRating, review: newReview };
}

// Calculate average rating for a product
function getAverageRating(productId) {
    const { ratings } = getProductRatings(productId);
    if (!ratings.length) return 0;
    
    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / ratings.length).toFixed(1);
}

// Get reviews for a product with pagination
function getProductReviews(productId, page = 1, limit = 5) {
    const { reviews } = getProductRatings(productId);
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
        reviews: reviews.slice(start, end),
        total: reviews.length,
        totalPages: Math.ceil(reviews.length / limit)
    };
}

// Format timestamp to readable date
function formatReviewDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Export functions
export {
    getProductRatings,
    addRating,
    getAverageRating,
    getProductReviews,
    formatReviewDate
}; 