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
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to refresh token';
      console.warn('Token refresh failed:', errorMessage);
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
      toast.success('Logged out successfully!');
      navigate('/');
      return true;
    } catch (err) {
      clearAuthState();
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to logout';
      setError(errorMessage);
      toast.error(errorMessage);
      navigate('/');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, clearAuthState]);

  // Define getProfile before checkAuthStatus to avoid initialization error
  const getProfile = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/users/me/profile/');
      setProfile(response.data);
      setIsAuthenticated(true);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch profile';
      setError(errorMessage);
      if (err.response?.status === 401) {
        // Don't show toast for 401 errors as they'll be handled by token refresh
        console.warn('Profile fetch failed with 401:', errorMessage);
      } else {
        toast.error(errorMessage);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    
    // No tokens at all - user is not authenticated
    if (!token && !refresh) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    // No access token but have refresh token - try to refresh
    if (!token && refresh) {
      const refreshResult = await refreshToken();
      if (refreshResult) {
        const profileData = await getProfile();
        if (profileData) {
          setIsAuthenticated(true);
          navigate('/profile/me');
        } else {
          clearAuthState();
          navigate('/');
        }
      } else {
        setIsAuthenticated(false);
        navigate('/');
      }
      setIsLoading(false);
      return;
    }

    // Have access token - try to get profile
    try {
      const profileData = await getProfile();
      if (profileData) {
        setIsAuthenticated(true);
        // Only navigate if we're on the root path to avoid disrupting user navigation
        if (window.location.pathname === '/') {
          navigate('/profile/me');
        }
      } else {
        throw new Error('Failed to get profile');
      }
    } catch (err) {
      // If 401 and we have refresh token, try to refresh
      if (err.response?.status === 401 && refresh) {
        const refreshResult = await refreshToken();
        if (refreshResult) {
          const profileData = await getProfile();
          if (profileData) {
            setIsAuthenticated(true);
            if (window.location.pathname === '/') {
              navigate('/profile/me');
            }
          } else {
            clearAuthState();
            navigate('/');
          }
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

  // Set up API interceptors
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
        
        // Avoid infinite loops
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
            // Only navigate if not already on home page
            if (window.location.pathname !== '/') {
              navigate('/');
            }
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

  // Check auth status on mount
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
      
      // Get profile after successful login
      const profileData = await getProfile();
      if (profileData) {
        setIsAuthenticated(true);
        toast.success('Logged in successfully!');
        navigate('/profile/me');
        return true;
      } else {
        throw new Error('Failed to get profile after login');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to login';
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
      const response = await api.post('/users/register/', userData);
      localStorage.setItem('access_token', response.data.token);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Get profile after successful registration
      const profileData = await getProfile();
      if (profileData) {
        setIsAuthenticated(true);
        toast.success('Registered successfully!');
        navigate('/profile/me');
        return true;
      } else {
        throw new Error('Failed to get profile after registration');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to register';
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
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to request password reset';
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
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to reset password';
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
      const response = await api.patch('/users/me/profile/', data);
      setProfile(response.data);
      toast.success('Profile updated!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const updateAccountSettings = useCallback(async (data) => {
    if (!isAuthenticated) return null;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch('/users/me/settings/account/', data);
      setProfile((prev) => ({ ...prev, ...response.data }));
      toast.success('Account settings updated!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to update account settings';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

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
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to update chat preferences';
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
      await api.delete('/users/me/delete/');
      clearAuthState();
      toast.success('Account deleted successfully!');
      navigate('/');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to delete account';
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