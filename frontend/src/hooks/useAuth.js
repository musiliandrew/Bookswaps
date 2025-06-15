import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../utils/api';

export function useAuth() {
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false); // New flag
  const navigate = useNavigate();

  const clearAuthState = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    setProfile(null);
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        clearAuthState();
        return null;
      }
      const response = await api.post('/users/token/refresh/', { refresh });
      localStorage.setItem('access_token', response.data.access);
      setIsAuthenticated(true);
      return response.data;
    } catch (err) {
      console.warn('Token refresh failed:', err.response?.data?.detail || 'Unknown error');
      clearAuthState();
      return null;
    }
  }, [clearAuthState]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/users/logout/', { refresh: refreshToken });
      }
      clearAuthState();
      navigate('/');
      return true;
    } catch (err) {
      clearAuthState();
      setError(err.response?.data?.detail || 'Failed to logout');
      navigate('/');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, clearAuthState]);

  const getProfile = useCallback(async () => {
    if (isFetchingProfile) {
      console.log('getProfile: Already fetching, skipping');
      return null;
    }
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('getProfile: No access token');
      return null;
    }
    setIsFetchingProfile(true);
    setIsLoading(true);
    setError(null);
    try {
      console.log('getProfile: Fetching profile...');
      const response = await api.get('/users/me/profile/');
      setProfile(response.data);
      setIsAuthenticated(true);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch profile';
      console.error('getProfile Error:', errorMessage, err.response?.status);
      setError(errorMessage);
      if (err.response?.status !== 401) {
        toast.error(errorMessage);
      }
      return null;
    } finally {
      setIsLoading(false);
      setIsFetchingProfile(false);
    }
  }, [isFetchingProfile]);

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    if (!token && !refresh) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }
    if (!token && refresh) {
      const refreshResult = await refreshToken();
      if (refreshResult) {
        await getProfile();
      } else {
        clearAuthState();
        navigate('/');
      }
      setIsLoading(false);
      return;
    }
    try {
      await getProfile();
    } catch (err) {
      if (err.response?.status === 401 && refresh) {
        const refreshResult = await refreshToken();
        if (refreshResult) {
          await getProfile();
        } else {
          clearAuthState();
          navigate('/');
        }
      } else {
        clearAuthState();
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  }, [refreshToken, clearAuthState, navigate, getProfile]);

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (err) => Promise.reject(err)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (err) => {
        const originalRequest = err.config;
        if (originalRequest._retry || originalRequest.url?.includes('/token/refresh/')) {
          return Promise.reject(err);
        }
        if (err.response?.status === 401) {
          originalRequest._retry = true;
          const refreshResult = await refreshToken();
          if (refreshResult) {
            const newToken = localStorage.getItem('access_token');
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } else {
            clearAuthState();
            navigate('/');
            return Promise.reject(err);
          }
        }
        return Promise.reject(err);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [refreshToken, clearAuthState, navigate]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/users/login/', credentials);
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      await getProfile();
      toast.success('Logged in successfully!');
      navigate('/profile/me');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to login';
      setError(errorMessage);
      toast.error(errorMessage);
      clearAuthState();
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, getProfile, clearAuthState]);

  const register = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.keys(userData).forEach(key => {
        if (key === 'genres' && Array.isArray(userData[key])) {
          formData.append(key, JSON.stringify(userData[key]));
        } else if (userData[key] instanceof File) {
          formData.append(key, userData[key]);
        } else if (userData[key] !== undefined) {
          formData.append(key, userData[key]);
        }
      });
      const response = await api.post('/users/register/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      localStorage.setItem('access_token', response.data.token);
      localStorage.setItem('refresh_token', response.data.refresh);
      await getProfile();
      toast.success('Registered successfully!');
      navigate('/profile/me');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to register';
      setError(errorMessage);
      toast.error(errorMessage);
      clearAuthState();
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, getProfile, clearAuthState]);

  const requestPasswordReset = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/users/password/reset/', data);
      setSuccess('Password reset link sent!');
      toast.success('Password reset link sent!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to request password reset';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const confirmPasswordReset = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/users/password/reset/confirm/', data);
      setSuccess('Password reset successfully!');
      toast.success('Password reset successfully!');
      navigate('/login');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to reset password';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const updateProfile = useCallback(async (data) => {
    if (!isAuthenticated) return null;
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'genres' && Array.isArray(data[key])) {
          formData.append(key, JSON.stringify(data[key]));
        } else if (data[key] instanceof File) {
          formData.append(key, data[key]);
        } else if (data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });
      const response = await api.patch('/users/me/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(response.data);
      toast.success('Profile updated!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const updateAccountSettings = useCallback(async (data) => {
    try {
      await api.patch('/users/me/settings/account/', data);
      await getProfile();
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to update account settings';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getProfile]);

  const updateChatPreferences = useCallback(async (data) => {
    if (!isAuthenticated) return null;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch('/users/me/settings/preferences/', data);
      setProfile((prev) => ({ ...prev, chat_preferences: response.data.chat_preferences }));
      toast.success('Chat preferences updated!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to update chat preferences';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const deleteAccount = useCallback(async () => {
    if (!isAuthenticated) return false;
    setIsLoading(true);
    setError(null);
    try {
      await api.delete('/users/me/delete/', { data: { confirm: true } });
      clearAuthState();
      toast.success('Account deleted successfully!');
      navigate('/');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete account';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, navigate, clearAuthState]);

  return {
    login,
    register,
    refreshToken,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    getProfile,
    updateProfile,
    updateAccountSettings,
    updateChatPreferences,
    deleteAccount,
    profile,
    isAuthenticated,
    isLoading,
    error,
    success,
  };
}