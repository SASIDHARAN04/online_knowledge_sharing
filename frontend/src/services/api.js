import axios from 'axios';

/**
 * API Service
 * Centralized axios instance for API calls
 */
const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests using interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (config.headers.set) {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
