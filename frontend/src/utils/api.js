import axios from 'axios';

// For Vite or similar, use import.meta.env; adjust as needed for your build tool
const isDev = import.meta.env.MODE === 'development';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log('API request:', config.method.toUpperCase(), config.url, config.data);
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('API response:', response.status, response.data);
    return response;
  },
  async (error) => {
    console.error('Response error:', error.response?.status, error.response?.data);
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/users/login/') &&
      !originalRequest.url.includes('/users/token/refresh/')
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (isDev) console.log('Attempting token refresh with:', refreshToken);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        const response = await api.post('/users/token/refresh/', { refresh: refreshToken });
        const { access, refresh } = response.data;
        if (isDev) console.log('Refresh response:', response.data);
        localStorage.setItem('access_token', access);
        if (refresh) {
          localStorage.setItem('refresh_token', refresh);
        }
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        if (isDev) console.error('Refresh error:', refreshError.response?.data);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    if (isDev) console.error('API error:', error.response?.data);
    return Promise.reject(error);
  }
);

export { api };
