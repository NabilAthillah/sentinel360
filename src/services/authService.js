import api from '../utils/api';

// Authentication service
const authService = {
  // Login admin
  login: async (loginData) => {
    try {
      const response = await api.post('/auth/login', loginData);

      if (response.data) {
        return response.data;
      }
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },

  // Login user
  loginUser: async (phone, password) => {
    try {
      const response = await api.post('/auth/user/login', {
        phone: phone,
        password: password
      });
      if (response.data) {
        return response.data;
      }
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh-token');
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },

  updateProfile: async (data, id) => {
    try {
      const response = await api.post(`/auth/update-profile/${id}`, data)

      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },

  checkToken: async (token) => {
    try {
      const response = await api.get('/check-token', token);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  }
};

export default authService;
