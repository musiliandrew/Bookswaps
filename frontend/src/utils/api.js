import axios from 'axios';

// For Vite, use import.meta.env; adjust as needed for your build tool
const isDev = import.meta.env.VITE_ENABLED === 'true';

const createApi = (refreshTokenFn) => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';
  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  // Track if we're currently refreshing to avoid multiple refresh attempts
  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

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
      if (isDev) {
        console.log('API response:', {
          status: response.status,
          url: response.config.url,
          data: response.data,
        });
      }
      return response;
    },
    async (error) => {
      if (isDev) {
        console.error('Response error:', {
          status: error.response?.status,
          url: error.config?.url,
          data: error.response?.data,
        });
      }

      // Handle network errors
      if (!error.response) {
        console.error('Network error - server may be down');
        return Promise.reject(error);
      }

      const originalRequest = error.config;

      // Skip token refresh for login, register, and refresh endpoints
      if (
        originalRequest.url.includes('/users/login/') ||
        originalRequest.url.includes('/users/register/') ||
        originalRequest.url.includes('/users/token/refresh/')
      ) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Queue requests if already refreshing
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;
        const refreshToken = localStorage.getItem('refresh_token');
        console.log('Interceptor: Refresh token:', refreshToken ? 'Present' : 'Missing');

        if (!refreshToken) {
          console.warn('Interceptor: No refresh token available');
          processQueue(error, null);
          isRefreshing = false;
          window.dispatchEvent(
            new CustomEvent('auth:logout', { detail: { reason: 'no_refresh_token' } })
          );
          return Promise.reject(error);
        }

        try {
          console.log('Interceptor: Attempting token refresh');
          const newAccessToken = await refreshTokenFn();
          if (!newAccessToken) {
            throw new Error('Token refresh returned no access token');
          }

          console.log('Interceptor: Token refresh successful, new token:', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          isRefreshing = false;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Interceptor: Token refresh failed:', {
            message: refreshError.message,
            status: refreshError.response?.status,
            data: refreshError.response?.data,
          });
          processQueue(refreshError, null);
          isRefreshing = false;
          window.dispatchEvent(
            new CustomEvent('auth:logout', { detail: { reason: 'token_refresh_failed' } })
          );
          return Promise.reject(refreshError);
        }
      }

      // For non-401 errors or after retry, dispatch auth error if applicable
      if (error.response?.status === 401) {
        window.dispatchEvent(
          new CustomEvent('auth:error', {
            detail: { status: 401, url: originalRequest.url, error: error.response?.data },
          })
        );
      }

      return Promise.reject(error);
    }
  );

  return api;
};

// Updated refresh function to match your backend's token format
const refreshTokenFunction = async () => {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) return null;
  
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/'}users/token/refresh/`,
      { refresh: refresh } // Backend expects 'refresh' field name
    );
    
    // Handle both possible response formats
    const newAccessToken = response.data.access_token || response.data.access;
    const newRefreshToken = response.data.refresh_token || response.data.refresh;
    
    if (newAccessToken) {
      localStorage.setItem('access_token', newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem('refresh_token', newRefreshToken);
      }
      return newAccessToken;
    }
    
    console.error('No access token in refresh response:', response.data);
    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};

// Create an instance of the API with the proper refresh function
const api = createApi(refreshTokenFunction);

export { createApi, api };