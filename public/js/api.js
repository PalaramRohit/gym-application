// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Get stored token
const getToken = () => {
  return localStorage.getItem('token');
};

// Set token
const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove token
const removeToken = () => {
  localStorage.removeItem('token');
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Try to parse JSON, but gracefully handle non-JSON responses (e.g., plain-text error)
    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      // Not JSON
      const text = await response.text();
      if (!response.ok) {
        // Throw text as error message when available
        throw new Error(text || 'Request failed');
      }
      // Successful response but not JSON - return text in data field
      return { success: true, data: text };
    }

    if (!response.ok) {
      throw new Error((data && data.message) || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: (email, password) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),

  logout: () => {
    removeToken();
    return apiRequest('/auth/logout', { method: 'POST' });
  },

  getMe: () => apiRequest('/auth/me'),
};

// Users API
const usersAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/users${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id) => apiRequest(`/users/${id}`),

  update: (id, data) => apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiRequest(`/users/${id}`, { method: 'DELETE' }),
};

// Trainers API
const trainersAPI = {
  getAll: () => apiRequest('/trainers'),
  getById: (id) => apiRequest(`/trainers/${id}`),
  create: (data) => apiRequest('/trainers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiRequest(`/trainers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Plans API
const plansAPI = {
  getAll: () => apiRequest('/plans'),
  getById: (id) => apiRequest(`/plans/${id}`),
  create: (data) => apiRequest('/plans', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiRequest(`/plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiRequest(`/plans/${id}`, { method: 'DELETE' }),
};

// Subscriptions API
const subscriptionsAPI = {
  create: (data) => apiRequest('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getByMember: (memberId) => apiRequest(`/subscriptions/member/${memberId}`),
  update: (id, data) => apiRequest(`/subscriptions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Workout Plans API
const workoutPlansAPI = {
  create: (data) => apiRequest('/workout-plans', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getByMember: (memberId) => apiRequest(`/workout-plans/member/${memberId}`),
  update: (id, data) => apiRequest(`/workout-plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Attendance API
const attendanceAPI = {
  checkin: (data) => apiRequest('/attendance/checkin', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/attendance${queryString ? `?${queryString}` : ''}`);
  },
  getToday: () => apiRequest('/attendance/today'),
};

// Upload API
const uploadAPI = {
  profilePhoto: async (file) => {
    const formData = new FormData();
    formData.append('photo', file);

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/upload/profile-photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    return data;
  },

  checkinPhoto: async (file) => {
    const formData = new FormData();
    formData.append('photo', file);

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/upload/checkin-photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    return data;
  },
};

// Reports API
const reportsAPI = {
  attendanceCSV: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const token = getToken();
    window.location.href = `${API_BASE_URL}/reports/attendance.csv${queryString ? `?${queryString}` : ''}?token=${token}`;
  },
  membersCSV: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const token = getToken();
    window.location.href = `${API_BASE_URL}/reports/members.csv${queryString ? `?${queryString}` : ''}?token=${token}`;
  },
};

// Export API object
window.api = {
  auth: authAPI,
  users: usersAPI,
  trainers: trainersAPI,
  plans: plansAPI,
  subscriptions: subscriptionsAPI,
  workoutPlans: workoutPlansAPI,
  attendance: attendanceAPI,
  upload: uploadAPI,
  reports: reportsAPI,
  getToken,
  setToken,
  removeToken,
};

