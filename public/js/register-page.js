// register-page.js - handles registration form and optional role/invite code
(function () {
  // Redirect if already logged in
  if (window.api && window.api.getToken && window.api.getToken()) {
    window.location.href = '../index.html';
  }

  const form = document.getElementById('register-form');
  if (!form) return;

  // Read role from query params
  const params = new URLSearchParams(window.location.search);
  const role = params.get('role');
  const planId = params.get('plan');

  // If role is elevated, show a small invite code input
  if (role && (role === 'admin' || role === 'trainer')) {
    const inviteGroup = document.createElement('div');
    inviteGroup.className = 'form-group';
    inviteGroup.innerHTML = `
      <label class="form-label" for="roleKey">Invite Code</label>
      <input type="text" id="roleKey" class="form-input" placeholder="Enter invite code">
      <div class="form-error" id="roleKey-error"></div>
    `;
    form.insertBefore(inviteGroup, form.firstChild);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const phone = document.getElementById('phone').value.trim();
    const dob = document.getElementById('dob').value;
    const roleKeyInput = document.getElementById('roleKey');

    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const roleKeyError = document.getElementById('roleKey-error');

    nameError.textContent = '';
    emailError.textContent = '';
    passwordError.textContent = '';
    if (roleKeyError) roleKeyError.textContent = '';

    let isValid = true;
    if (!name) {
      nameError.textContent = 'Name is required';
      isValid = false;
    }

    if (!window.utils.validateEmail(email)) {
      emailError.textContent = 'Please enter a valid email';
      isValid = false;
    }

    if (!window.utils.validatePassword(password)) {
      passwordError.textContent = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!isValid) return;

    try {
      const userData = { name, email, password };
      if (phone) userData.phone = phone;
      if (dob) userData.dob = dob;
      if (planId) userData.planId = planId;
      if (role) userData.role = role;
      if (roleKeyInput && roleKeyInput.value) userData.roleKey = roleKeyInput.value.trim();

      const response = await window.api.auth.register(userData);
      if (response && response.success && response.data && response.data.token) {
        window.api.setToken(response.data.token);
        window.utils.showToast('Registration successful!', 'success');
        setTimeout(() => {
          const r = response.data.user.role;
          if (r === 'admin') {
            window.location.href = 'admin-dashboard.html';
          } else if (r === 'trainer') {
            window.location.href = 'trainer-dashboard.html';
          } else {
            window.location.href = 'member-dashboard.html';
          }
        }, 500);
      }
    } catch (error) {
      window.utils.showToast(error.message || 'Registration failed', 'error');
    }
  });
})();
