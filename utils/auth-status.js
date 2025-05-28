// Auth Status Management
class AuthStatus {
    static isAuthenticated() {
        const user = UserStorage.getUser();
        const token = UserStorage.getAuthToken();
        return !!(user && token);
    }

    static getCurrentUser() {
        return UserStorage.getUser();
    }

    static isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }

    static requireAuth() {
        if (!this.isAuthenticated()) {
            this.redirectToLogin();
            return false;
        }
        return true;
    }

    static requireAdmin() {
        if (!this.isAuthenticated()) {
            this.redirectToLogin();
            return false;
        }
        
        if (!this.isAdmin()) {
            this.redirectToHome();
            return false;
        }
        
        return true;
    }

    static redirectToLogin() {
        const currentPath = window.location.pathname;
        window.location.href = `/auth/auth.html?redirect=${encodeURIComponent(currentPath)}`;
    }

    static redirectToHome() {
        window.location.href = '/';
    }

    static logout() {
        UserStorage.removeUser();
        UserStorage.remove('auth_token');
        this.redirectToHome();
    }

    static updateAuthUI() {
        const authLinks = document.querySelector('.auth-links');
        if (!authLinks) return;

        const user = this.getCurrentUser();
        
        if (user) {
            authLinks.innerHTML = `
                <span class="user-welcome">Welcome, ${user.username}</span>
                ${this.isAdmin() ? '<a href="/admin/admin.html" class="admin-link">Admin Dashboard</a>' : ''}
                <a href="#" class="logout-btn" onclick="AuthStatus.logout()">Logout</a>
            `;
        } else {
            authLinks.innerHTML = `
                <a href="/auth/auth.html" class="login-btn">Login</a>
                <a href="/auth/auth.html?action=register" class="register-btn">Register</a>
            `;
        }
    }
}

// Auth Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    AuthStatus.updateAuthUI();
});

// Protected Route Handler
class ProtectedRoute {
    static init(options = {}) {
        const { requireAdmin = false, redirectUrl = '/' } = options;
        
        if (requireAdmin && !AuthStatus.requireAdmin()) {
            window.location.href = redirectUrl;
            return false;
        }
        
        if (!AuthStatus.requireAuth()) {
            window.location.href = redirectUrl;
            return false;
        }
        
        return true;
    }
}

// Auth Event Dispatcher
class AuthEvents {
    static LOGIN = 'auth:login';
    static LOGOUT = 'auth:logout';
    static AUTH_CHANGE = 'auth:change';

    static dispatch(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    static onLogin(callback) {
        document.addEventListener(this.LOGIN, callback);
    }

    static onLogout(callback) {
        document.addEventListener(this.LOGOUT, callback);
    }

    static onAuthChange(callback) {
        document.addEventListener(this.AUTH_CHANGE, callback);
    }
}

// Session Management
class SessionManager {
    static SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    static startSession(userData) {
        const session = {
            user: userData,
            expiresAt: Date.now() + this.SESSION_DURATION
        };
        
        StorageUtil.set('session', session);
        this.scheduleSessionCheck();
    }

    static checkSession() {
        const session = UserStorage.get('session');
        
        if (!session) return false;
        
        if (Date.now() > session.expiresAt) {
            this.endSession();
            return false;
        }
        
        return true;
    }

    static scheduleSessionCheck() {
        setInterval(() => {
            if (!this.checkSession()) {
                AuthEvents.dispatch(AuthEvents.LOGOUT);
                AuthStatus.redirectToLogin();
            }
        }, 60000); // Check every minute
    }

    static endSession() {
        UserStorage.remove('session');
        AuthEvents.dispatch(AuthEvents.LOGOUT);
    }
}

// Export utilities
window.AuthStatus = AuthStatus;
window.ProtectedRoute = ProtectedRoute;
window.AuthEvents = AuthEvents;
window.SessionManager = SessionManager; 