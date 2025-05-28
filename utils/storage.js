// Storage Keys
const STORAGE_KEYS = {
    USER: 'current_user',
    CART: 'cart',
    ORDERS: 'orders',
    AUTH_TOKEN: 'auth_token'
};

// Storage Utility Class
class StorageUtil {
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error storing ${key}:`, error);
            return false;
        }
    }

    static get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error retrieving ${key}:`, error);
            return null;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing ${key}:`, error);
            return false;
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }
}

// User Storage Operations
class UserStorage {
    static saveUser(userData) {
        return StorageUtil.set(STORAGE_KEYS.USER, userData);
    }

    static getUser() {
        return StorageUtil.get(STORAGE_KEYS.USER);
    }

    static removeUser() {
        return StorageUtil.remove(STORAGE_KEYS.USER);
    }

    static saveAuthToken(token) {
        return StorageUtil.set(STORAGE_KEYS.AUTH_TOKEN, token);
    }

    static getAuthToken() {
        return StorageUtil.get(STORAGE_KEYS.AUTH_TOKEN);
    }
}

// Cart Storage Operations
class CartStorage {
    static saveCart(cartData) {
        return StorageUtil.set(STORAGE_KEYS.CART, cartData);
    }

    static getCart() {
        return StorageUtil.get(STORAGE_KEYS.CART) || [];
    }

    static clearCart() {
        return StorageUtil.remove(STORAGE_KEYS.CART);
    }

    static addToCart(product) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.productId === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                productId: product.id,
                name: product.title,
                price: product.price,
                quantity: 1,
                image: product.image
            });
        }

        return this.saveCart(cart);
    }

    static removeFromCart(productId) {
        const cart = this.getCart();
        const updatedCart = cart.filter(item => item.productId !== productId);
        return this.saveCart(updatedCart);
    }

    static updateQuantity(productId, quantity) {
        const cart = this.getCart();
        const item = cart.find(item => item.productId === productId);
        
        if (item) {
            item.quantity = Math.max(0, quantity);
            if (item.quantity === 0) {
                return this.removeFromCart(productId);
            }
            return this.saveCart(cart);
        }
        return false;
    }
}

// Order Storage Operations
class OrderStorage {
    static saveOrder(orderData) {
        const orders = this.getOrders();
        orders.push({
            ...orderData,
            id: this.generateOrderId(),
            createdAt: new Date().toISOString()
        });
        return StorageUtil.set(STORAGE_KEYS.ORDERS, orders);
    }

    static getOrders() {
        return StorageUtil.get(STORAGE_KEYS.ORDERS) || [];
    }

    static getOrderById(orderId) {
        const orders = this.getOrders();
        return orders.find(order => order.id === orderId);
    }

    static generateOrderId() {
        return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
}

// Export all storage utilities
window.StorageUtil = StorageUtil;
window.UserStorage = UserStorage;
window.CartStorage = CartStorage;
window.OrderStorage = OrderStorage; 