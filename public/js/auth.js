/**
 * Online Examination & Assessment System - Authentication & Session Manager
 */

const AUTH_USER_KEY = 'exam_session_user';

const Auth = {
  getCurrentUser() {
    try {
      const user = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser(user, remember = true) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  },

  clearCurrentUser() {
    localStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
  },

  async login(email, password, remember = true) {
    const result = await API.login(email, password);
    if (result && result.success && result.user) {
      this.setCurrentUser(result.user, remember);
      return { success: true, user: result.user };
    }
    return { success: false, message: result.message || 'Login failed' };
  },

  async register(userData) {
    const result = await API.register(userData);
    if (result && result.success && result.user) {
      this.setCurrentUser(result.user, true);
      return { success: true, user: result.user };
    }
    return { success: false, message: result.message || 'Registration failed' };
  },

  logout() {
    this.clearCurrentUser();
    window.location.href = 'index.html';
  },

  // 1-Click Quick Demo Logins
  async quickDemoLogin(role = 'student') {
    let email = 'student@exam.com';
    let password = 'student123';

    if (role === 'teacher') {
      email = 'teacher@exam.com';
      password = 'admin123';
    }

    const res = await this.login(email, password, true);
    if (res.success) {
      this.redirectByRole(res.user.role);
    } else {
      showToast(res.message || 'Could not perform demo login', 'error');
    }
  },

  redirectByRole(role) {
    if (role === 'teacher') {
      window.location.href = 'teacher-dashboard.html';
    } else {
      window.location.href = 'student-dashboard.html';
    }
  },

  // Route Guard: Ensures correct role access
  requireAuth(requiredRole = null) {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = 'index.html';
      return null;
    }

    if (requiredRole && user.role !== requiredRole) {
      // Redirect to user's authorized home
      this.redirectByRole(user.role);
      return null;
    }

    this.renderNavbarUser(user);
    return user;
  },

  // Updates user display badge in the top navbar
  renderNavbarUser(user) {
    const container = document.getElementById('navUserSection');
    if (!container) return;

    container.innerHTML = `
      <div class="user-badge">
        <span class="user-name">${user.name}</span>
        <span class="role-tag role-${user.role}">${user.role}</span>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="Auth.logout()">Sign Out</button>
    `;
  }
};

// Global Toast Notification Helper
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';
  if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
