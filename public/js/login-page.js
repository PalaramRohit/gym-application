// login-page.js - handles login and redirects based on role
(function () {
  if (window.api && window.api.getToken && window.api.getToken()) {
    window.location.href = '../index.html';
  }

  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');

    emailError.textContent = '';
    passwordError.textContent = '';

    if (!window.utils.validateEmail(email)) {
      emailError.textContent = 'Please enter a valid email';
      return;
    }

    if (!window.utils.validatePassword(password)) {
      passwordError.textContent = 'Password must be at least 6 characters';
      return;
    }

    try {
      const response = await window.api.auth.login(email, password);
      if (response && response.success && response.data && response.data.token) {
        window.api.setToken(response.data.token);
        window.utils.showToast('Login successful!', 'success');
        setTimeout(() => {
          const role = response.data.user.role;
          if (role === 'admin') {
            window.location.href = 'admin-dashboard.html';
          } else if (role === 'trainer') {
            window.location.href = 'trainer-dashboard.html';
          } else {
            window.location.href = 'member-dashboard.html';
          }
        }, 500);
      }
    } catch (error) {
      window.utils.showToast(error.message || 'Login failed', 'error');
    }
  });
})();
