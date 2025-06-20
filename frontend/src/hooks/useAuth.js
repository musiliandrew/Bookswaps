import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import { jwtDecode } from 'jwt-decode';

export function useAuth() {
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);
  const refreshInProgress = useRef(false);
  const profileFetchRef = useRef(false); // Prevent redundant profile fetches

  const clearAuthState = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_profile');
    setIsAuthenticated(false);
    setProfile(null);
    setError(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const refreshToken = useCallback(async () => {
    if (refreshInProgress.current) {
      console.log('Refresh already in progress, skipping');
      return null;
    }

    refreshInProgress.current = true;
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
      console.warn('No refresh token found');
      clearAuthState();
      refreshInProgress.current = false;
      return null;
    }

    try {
      const response = await api.post('/users/token/refresh/', { refresh });
      localStorage.setItem('access_token', response.data.access);
      setIsAuthenticated(true);
      refreshInProgress.current = false;
      return response.data.access;
    } catch (err) {
      console.warn('Token refresh failed:', err.response?.data?.detail || err);
      clearAuthState();
      refreshInProgress.current = false;
      toast.error('Session expired, please log in again');
      return null;
    }
  }, [clearAuthState]);

  const getProfile = useCallback(
    async (forceFetch = false) => {
      if (profileFetchRef.current && !forceFetch) {
        console.log('Profile fetch skipped, already in progress or completed');
        return profile;
      }

      console.log('Fetching profile...');
      if (!forceFetch) {
        const cachedProfile = localStorage.getItem('user_profile');
        if (cachedProfile) {
          const parsedProfile = JSON.parse(cachedProfile);
          console.log('Using cached profile:', parsedProfile);
          setProfile(parsedProfile);
          setIsAuthenticated(true);
          setIsLoading(false);
          return parsedProfile;
        }
      }

      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('No access token found');
        setIsLoading(false);
        setIsAuthenticated(false);
        return null;
      }

      setIsLoading(true);
      setError(null);
      abortControllerRef.current = new AbortController();
      profileFetchRef.current = true;

      try {
        const response = await api.get('/users/me/profile/', {
          signal: abortControllerRef.current.signal,
        });
        console.log('Profile fetched:', response.data);
        setProfile(response.data);
        localStorage.setItem('user_profile', JSON.stringify(response.data));
        setIsAuthenticated(true);
        return response.data;
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Profile fetch aborted');
          return null;
        }
        const errorMessage = err.response?.data?.detail || 'Failed to fetch profile';
        console.error('Profile fetch error:', errorMessage);
        setError(errorMessage);
        if (err.response?.status === 401) {
          const newToken = await refreshToken();
          if (newToken) {
            return await getProfile(true);
          }
        }
        toast.error(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
        profileFetchRef.current = false;
      }
    },
    [refreshToken, profile]
  );

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');

    if (!token && !refresh) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          console.log('Access token expired');
          if (refresh) {
            const newToken = await refreshToken();
            if (newToken) {
              await getProfile(true);
            }
          } else {
            clearAuthState();
          }
        } else {
          await getProfile();
        }
      } catch (err) {
        console.warn('Invalid token:', err);
        if (refresh) {
          const newToken = await refreshToken();
          if (newToken) {
            await getProfile(true);
          }
        } else {
          clearAuthState();
        }
      }
    } else if (refresh) {
      const newToken = await refreshToken();
      if (newToken) {
        await getProfile(true);
      } else {
        clearAuthState();
      }
    }

    setIsLoading(false);
  }, [refreshToken, clearAuthState, getProfile]);

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
          const newToken = await refreshToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } else {
            clearAuthState();
            return Promise.reject(err);
          }
        }
        return Promise.reject(err);
      }
    );

    const handleAuthError = () => {
      clearAuthState();
      toast.error('Authentication error, redirecting to login');
    };
    window.addEventListener('auth:error', handleAuthError);

    checkAuthStatus();

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
      window.removeEventListener('auth:error', handleAuthError);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [checkAuthStatus, clearAuthState, refreshToken]);

  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/users/login/', credentials);
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      api.defaults.headers.Authorization = `Bearer ${response.data.access_token}`;
      const profileData = await getProfile(true);
      if (profileData) {
        setIsAuthenticated(true);
        toast.success('Login successful!');
        return true;
      } else {
        clearAuthState();
        toast.error('Failed to fetch profile after login');
        return false;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
      clearAuthState();
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getProfile, clearAuthState]);

  const register = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.keys(userData).forEach((key) => {
        if (key === 'genres' && Array.isArray(userData[key])) {
          formData.append(key, JSON.stringify(userData[key]));
        } else if (userData[key] instanceof File) {
          formData.append(key, userData[key]);
        } else if (userData[key] !== undefined) {
          formData.append(key, userData[key]);
        }
      });
      const response = await api.post('/users/register/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      await getProfile(true);
      toast.success('Registered successfully!');
      navigate('/profile/me', { replace: true });
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

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/users/logout/', { refresh: refreshToken });
      }
      clearAuthState();
      navigate('/', { replace: true });
      return true;
    } catch {
      clearAuthState();
      navigate('/', { replace: true });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, clearAuthState]);

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
      navigate('/login', { replace: true });
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
      Object.keys(data).forEach((key) => {
        if (key === 'genres' && Array.isArray(data[key])) {
          formData.append(key, JSON.stringify(data[key]));
        } else if (data[key] instanceof File) {
          formData.append(key, data[key]);
        } else if (data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });
      const response = await api.patch('/users/me/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(response.data);
      localStorage.setItem('user_profile', JSON.stringify(response.data));
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
      await getProfile(true);
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
      localStorage.setItem('user_profile', JSON.stringify({ ...profile, chat_preferences: response.data.chat_preferences }));
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
  }, [isAuthenticated, profile]);

  const deleteAccount = useCallback(async () => {
    if (!isAuthenticated) return false;
    setIsLoading(true);
    setError(null);
    try {
      await api.delete('/users/me/delete/', { data: { confirm: true } });
      clearAuthState();
      toast.success('Account deleted successfully!');
      navigate('/', { replace: true });
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