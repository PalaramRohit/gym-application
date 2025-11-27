// Authentication utilities

// Check if user is authenticated
const isAuthenticated = () => {
  return !!window.api.getToken();
};

// Get current user
const getCurrentUser = async () => {
  try {
    const response = await window.api.auth.getMe();
    return response.data;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};

// Redirect based on role
const redirectByRole = (role) => {
  switch (role) {
    case 'admin':
      window.location.href = 'pages/admin-dashboard.html';
      break;
    case 'trainer':
      window.location.href = 'pages/trainer-dashboard.html';
      break;
    case 'member':
      window.location.href = 'pages/member-dashboard.html';
      break;
    default:
      window.location.href = 'index.html';
  }
};

// Logout
const logout = async () => {
  try {
    await window.api.auth.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    window.api.removeToken();
    window.location.href = '../index.html';
  }
};

// Protect route - check authentication
const protectRoute = async () => {
  if (!isAuthenticated()) {
    window.location.href = '../index.html';
    return false;
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      window.location.href = '../index.html';
      return false;
    }
    return user;
  } catch (error) {
    console.error('Auth check failed:', error);
    window.api.removeToken();
    window.location.href = '../index.html';
    return false;
  }
};

// Export
window.authUtils = {
  isAuthenticated,
  getCurrentUser,
  redirectByRole,
  logout,
  protectRoute,
};

