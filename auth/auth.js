// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const tabButtons = document.querySelectorAll('.tab-btn');
const togglePasswordButtons = document.querySelectorAll('.toggle-password');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

// Constants
const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
});

function initializePage() {
    // Check URL parameters for initial tab
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'register') {
        showForm('register');
    }

    // Add event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const formType = button.dataset.form;
            showForm(formType);
        });
    });

    // Toggle password visibility
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const input = e.target.closest('.password-input').querySelector('input');
            const icon = e.target.closest('.toggle-password').querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Form submissions
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
}

function showForm(formType) {
    // Update tab buttons
    tabButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.form === formType);
    });

    // Show selected form
    loginForm.classList.toggle('active', formType === 'login');
    registerForm.classList.toggle('active', formType === 'register');

    // Clear error messages
    loginError.textContent = '';
    registerError.textContent = '';
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const remember = document.getElementById('login-remember').checked;
    
    // Validate input
    if (!validateEmail(email)) {
        showError(loginError, 'Please enter a valid email address');
        return;
    }

    // Show loading state
    const submitBtn = loginForm.querySelector('.submit-btn');
    setLoadingState(submitBtn, true);

    try {
        // Simulate API call
        const user = await simulateLoginAPI(email, password);
        
        if (user) {
            // Store user data
            UserStorage.saveUser(user);
            
            if (remember) {
                // Generate and store auth token
                const token = generateAuthToken();
                UserStorage.saveAuthToken(token);
            }

            // Start session
            SessionManager.startSession(user);

            // Dispatch login event
            AuthEvents.dispatch(AuthEvents.LOGIN, { user });

            // Redirect to previous page or home
            const redirect = new URLSearchParams(window.location.search).get('redirect');
            window.location.href = redirect || '../index.html';
        }
    } catch (error) {
        showError(loginError, error.message);
    } finally {
        setLoadingState(submitBtn, false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const terms = document.getElementById('register-terms').checked;
    
    // Validate input
    if (!validateRegistrationInput(username, email, password, confirmPassword, terms)) {
        return;
    }

    // Show loading state
    const submitBtn = registerForm.querySelector('.submit-btn');
    setLoadingState(submitBtn, true);

    try {
        // Simulate API call
        const user = await simulateRegisterAPI(username, email, password);
        
        if (user) {
            // Store user data
            UserStorage.saveUser(user);
            
            // Generate and store auth token
            const token = generateAuthToken();
            UserStorage.saveAuthToken(token);

            // Start session
            SessionManager.startSession(user);

            // Dispatch login event
            AuthEvents.dispatch(AuthEvents.LOGIN, { user });

            // Show success message and redirect
            showSuccess(registerError, 'Registration successful! Redirecting...');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
        }
    } catch (error) {
        showError(registerError, error.message);
    } finally {
        setLoadingState(submitBtn, false);
    }
}

// Validation Functions
function validateEmail(email) {
    return EMAIL_PATTERN.test(email);
}

function validatePassword(password) {
    return password.length >= MIN_PASSWORD_LENGTH && PASSWORD_PATTERN.test(password);
}

function validateRegistrationInput(username, email, password, confirmPassword, terms) {
    if (!username || username.length < 3) {
        showError(registerError, 'Username must be at least 3 characters long');
        return false;
    }

    if (!validateEmail(email)) {
        showError(registerError, 'Please enter a valid email address');
        return false;
    }

    if (!validatePassword(password)) {
        showError(registerError, 'Password must be at least 8 characters long and contain both letters and numbers');
        return false;
    }

    if (password !== confirmPassword) {
        showError(registerError, 'Passwords do not match');
        return false;
    }

    if (!terms) {
        showError(registerError, 'Please agree to the Terms & Conditions');
        return false;
    }

    return true;
}

// UI Helper Functions
function showError(element, message) {
    element.textContent = message;
    element.classList.remove('success-message');
    element.classList.add('error-message');
}

function showSuccess(element, message) {
    element.textContent = message;
    element.classList.remove('error-message');
    element.classList.add('success-message');
}

function setLoadingState(button, isLoading) {
    button.disabled = isLoading;
    button.classList.toggle('loading', isLoading);
}

// Mock API Functions
async function simulateLoginAPI(email, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock user data (in a real app, this would come from the server)
    const mockUsers = [
        {
            id: '1',
            username: 'demo_user',
            email: 'demo@example.com',
            password: 'Demo123!',
            role: 'user'
        },
        {
            id: '2',
            username: 'admin',
            email: 'admin@example.com',
            password: 'Admin123!',
            role: 'admin'
        }
    ];

    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
        throw new Error('Invalid email or password');
    }

    // Don't send password to client
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

async function simulateRegisterAPI(username, email, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate email check
    if (email === 'demo@example.com') {
        throw new Error('Email already registered');
    }

    // Create new user (in a real app, this would be saved to the server)
    return {
        id: 'user_' + Date.now(),
        username,
        email,
        role: 'user'
    };
}

// Utility Functions
function generateAuthToken() {
    // In a real app, this would be a JWT or similar token from the server
    return 'auth_' + Date.now() + '_' + Math.random().toString(36).substr(2);
} 