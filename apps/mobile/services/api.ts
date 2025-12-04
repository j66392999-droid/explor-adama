import axios from 'axios';
import { logger } from '../shared/utils/logging/logger';
import { CONFIG } from '../constants/config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: CONFIG.API.BASE_URL,
  timeout: CONFIG.API.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    try {
      // Lazily require the store at request time to avoid require cycles
      // (store -> authSlice -> services/auth -> services/api -> store)
      // Accessing the store here ensures it has been initialized.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { store } = require('../store');
      const token = store.getState().auth?.token;
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // If store is unavailable (very early boot), just continue without token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid. Lazily dispatch logout to avoid require cycle.
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { store } = require('../store');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { logout } = require('../store/authSlice');
        store.dispatch(logout());
      } catch (e) {
        // ignore if store/authSlice aren't available yet
      }
      // Redirect to login if needed
    }
    
    if (error.response?.status === 500) {
      try { logger.error('Server error', error); } catch { try { console.error('Server error:', error); } catch {} }
    }
    
    return Promise.reject(error);
  }
);

export default api;