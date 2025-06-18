import axios from 'axios';

// For ViteX, use import.meta.env; adjust as needed for your build tool
const isDev = import.meta.env.VITE_ENABLED === 'true';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (isDev) {
      console.log('API request:', config.method.toUpperCase(), config.url, config.data);
    }
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    if (isDev) console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (isDev) console.log('API response:', response.status, response.data);
    return response;
  },
  async (error) => {
    if (isDev) console.error('Response error:', error.response?.status, error.response?.data);
    
    const originalRequest = error.config;
    
    if (error.response?.status === 401) {
      if (!originalRequest._retry && !originalRequest.url.includes('/users/login/') && !originalRequest.url.includes('/users/token/refresh/')) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) throw new Error('No refresh token available');
          const response = await api.post('/users/token/refresh/', { refresh: refreshToken });
          localStorage.setItem('access_token', response.data.access);
          if (response.data.refresh) localStorage.setItem('refresh_token', response.data.refresh);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_profile');
          window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'token_refresh_failed' } }));
          return Promise.reject(refreshError);
        }
      }
      window.dispatchEvent(new CustomEvent('auth:error', { 
        detail: { status: 401, url: originalRequest.url, error: error.response?.data }
      }));
      return Promise.reject(error);
    }
    
    if (isDev) console.error('API error:', error.response?.data);
    return Promise.reject(error);
  }
);

export { api };