// Storage Keys
const USERS_KEY = 'auth_registered_users';
const SESSION_KEY = 'auth_active_session';

// DOM Elements
const registerView = document.getElementById('register-view');
const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');

const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');

const registerError = document.getElementById('register-error');
const loginError = document.getElementById('login-error');

const toLoginBtn = document.getElementById('to-login');
const toRegisterBtn = document.getElementById('to-register');
const logoutBtn = document.getElementById('logout-btn');
const activeUserDisplay = document.getElementById('active-user-display');

// App Initialization
document.addEventListener('DOMContentLoaded', checkSessionStatus);

// Navigation View Switches
toLoginBtn.addEventListener('click', (e) => {
  e.preventDefault();
  showView('login');
});

toRegisterBtn.addEventListener('click', (e) => {
  e.preventDefault();
  showView('register');
});

logoutBtn.addEventListener('click', handleLogout);

// Helper: Hash password via browser Web Crypto API (SHA-256)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Registration Handler
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlerts();

  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;

  // 1. Password Validation (min 8 chars, at least 1 number)
  const passwordRegex = /^(?=.*[0-9]).{8,}$/;
  if (!passwordRegex.test(password)) {
    showError(registerError, 'Password must be at least 8 characters long and contain at least 1 number.');
    return;
  }

  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  // 2. Duplicate Check
  const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
  if (exists) {
    showError(registerError, 'Username or Email is already registered.');
    return;
  }

  // 3. Password Hashing & Account Creation
  const hashedPassword = await hashPassword(password);
  users.push({ username: username, passwordHash: hashedPassword });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Reset & Switch to Login
  registerForm.reset();
  showView('login');
  loginError.style.display = 'block';
  loginError.style.backgroundColor = '#064e3b';
  loginError.style.color = '#6ee7b7';
  loginError.style.borderColor = '#047857';
  loginError.textContent = 'Account created successfully! Please log in.';
});

// Login Handler
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlerts();

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  const hashedPassword = await hashPassword(password);

  // Match Username and Hashed Password
  const user = users.find(u => 
    u.username.toLowerCase() === username.toLowerCase() && 
    u.passwordHash === hashedPassword
  );

  if (user) {
    // Establish Session
    localStorage.setItem(SESSION_KEY, user.username);
    loginForm.reset();
    checkSessionStatus();
  } else {
    // Generic error message for security
    showError(loginError, 'Invalid username/email or password.');
  }
});

// Logout Handler
function handleLogout() {
  localStorage.removeItem(SESSION_KEY);
  checkSessionStatus();
}

// Session Router / Guard
function checkSessionStatus() {
  clearAlerts();
  const activeUser = localStorage.getItem(SESSION_KEY);

  if (activeUser) {
    activeUserDisplay.textContent = activeUser;
    showView('dashboard');
  } else {
    showView('login');
  }
}

// UI Helpers
function showView(viewName) {
  registerView.style.display = 'none';
  loginView.style.display = 'none';
  dashboardView.style.display = 'none';

  if (viewName === 'register') registerView.style.display = 'block';
  if (viewName === 'login') loginView.style.display = 'block';
  if (viewName === 'dashboard') dashboardView.style.display = 'block';
}

function showError(element, message) {
  element.style.display = 'block';
  element.style.backgroundColor = '#451a03';
  element.style.color = '#fca5a5';
  element.style.borderColor = '#991b1b';
  element.textContent = message;
}

function clearAlerts() {
  registerError.style.display = 'none';
  loginError.style.display = 'none';
}