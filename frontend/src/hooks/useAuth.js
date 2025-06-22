import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import { handleApiCall, handleApiCallWithResult } from '../utils/apiUtils';
import { API_ENDPOINTS } from '../utils/constants';
import { jwtDecode } from 'jwt-decode';
import debounce from 'lodash/debounce';

export function useAuth() {
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);
  const refreshInProgress = useRef(false);
  const profileFetchRef = useRef(false);
  const lastProfileFetch = useRef(0);

  const clearAuthState = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_profile');
    setIsAuthenticated(false);
    setProfile(null);
    setError(null);
    refreshInProgress.current = false;
    profileFetchRef.current = false;
    navigate('/login', { replace: true });
  }, [navigate]);

  const refreshToken = useCallback(async () => {
    if (refreshInProgress.current) return null;
    refreshInProgress.current = true;

    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
      clearAuthState();
      return null;
    }

    const result = await handleApiCall(
      () => api.post(API_ENDPOINTS.TOKEN_REFRESH, { refresh }),
      setIsLoading,
      setError,
      'Token refresh successful',
      'Token refresh'
    );

    if (result) {
      localStorage.setItem('access_token', result.access);
      if (result.refresh) localStorage.setItem('refresh_token', result.refresh);
      setIsAuthenticated(true);
      refreshInProgress.current = false;
      return result.access;
    }

    clearAuthState();
    refreshInProgress.current = false;
    return null;
  }, [clearAuthState]);

  const getProfileInternal = useCallback(
    async (forceFetch = false) => {
      const now = Date.now();
      if (profileFetchRef.current || (now - lastProfileFetch.current < 500049 && !forceFetch)) {
        return profile;
      }

      if (!forceFetch) {
        const cachedProfile = localStorage.getItem('user_profile');
        if (cachedProfile) {
          try {
            const parsedProfile = JSON.parse(cachedProfile);
            setProfile(parsedProfile);
            setIsAuthenticated(true);
            setIsLoading(false);
            return parsedProfile;
          } catch {
            localStorage.removeItem('user_profile');
          }
        }
      }

      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsLoading(false);
        setIsAuthenticated(false);
        return null;
      }

      profileFetchRef.current = true;
      lastProfileFetch.current = now;
      abortControllerRef.current = new AbortController();

      const result = await handleApiCall(
        () =>
          api.get(API_ENDPOINTS.PROFILE, { signal: abortControllerRef.current.signal }),
        setIsLoading,
        setError,
        null,
        'Profile fetch'
      );

      profileFetchRef.current = false;
      if (result) {
        setProfile(result);
        localStorage.setItem('user_profile', JSON.stringify(result));
        setIsAuthenticated(true);
        return result;
      }

      if (error?.includes('401') && !forceFetch) {
        const newToken = await refreshToken();
        if (newToken) return await getProfileInternal(true);
      }

      return null;
    },
    [profile, refreshToken, error]
  );

  const debouncedGetProfile = useMemo(
    () => debounce(getProfileInternal, 1000),
    [getProfileInternal]
  );

  const getProfile = useCallback(
    (forceFetch = false) => debouncedGetProfile(forceFetch),
    [debouncedGetProfile]
  );

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');

    if (!token && !refresh) {
      clearAuthState();
      setIsLoading(false);
      return;
    }

    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (!decoded?.exp) throw new Error('Invalid token: Missing expiration');
        if (decoded.exp * 1000 < Date.now()) {
          if (!refresh) {
            clearAuthState();
            setIsLoading(false);
            return;
          }
          const newToken = await refreshToken();
          if (newToken) await getProfile(true);
          else clearAuthState();
        } else {
          await getProfile();
        }
      } catch {
        if (refresh) {
          const newToken = await refreshToken();
          if (newToken) await getProfile(true);
          else clearAuthState();
        } else {
          clearAuthState();
        }
      }
    } else if (refresh) {
      const newToken = await refreshToken();
      if (newToken) await getProfile(true);
      else clearAuthState();
    }

    setIsLoading(false);
  }, [refreshToken, clearAuthState, getProfile]);

  useEffect(() => {
    const handleAuthError = () => {
      clearAuthState();
      toast.error('Authentication error, redirecting to login');
    };

    const handleAuthLogout = (event) => {
      clearAuthState();
      if (event.detail?.reason === 'token_refresh_failed') {
        toast.error('Session expired, please log in again');
      }
    };

    window.addEventListener('auth:error', handleAuthError);
    window.addEventListener('auth:logout', handleAuthLogout);
    checkAuthStatus();

    return () => {
      window.removeEventListener('auth:error', handleAuthError);
      window.removeEventListener('auth:logout', handleAuthLogout);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      debouncedGetProfile.cancel();
    };
  }, [checkAuthStatus, clearAuthState, debouncedGetProfile]);

  const login = useCallback(
    async (credentials) => {
      const result = await handleApiCall(
        () => api.post(API_ENDPOINTS.LOGIN, credentials),
        setIsLoading,
        setError,
        null,
        'Login'
      );

      if (!result) return false;

      const { access_token, refresh_token } = result;
      if (!access_token || !refresh_token) {
        setError('Missing access_token or refresh_token in login response');
        toast.error('Invalid login response');
        clearAuthState();
        return false;
      }

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      api.defaults.headers.Authorization = `Bearer ${access_token}`;

      const profileData = await getProfile(true);
      if (profileData) {
        setIsAuthenticated(true);
        toast.success('Login successful!');
        return true;
      }

      clearAuthState();
      toast.error('Failed to fetch profile after login');
      return false;
    },
    [getProfile, clearAuthState]
  );

  const register = useCallback(
    async (userData) => {
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

      const result = await handleApiCall(
        () =>
          api.post(API_ENDPOINTS.REGISTER, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          }),
        setIsLoading,
        setError,
        'Registered successfully!',
        'Registration'
      );

      if (result) {
        localStorage.setItem('access_token', result.access_token || result.token);
        localStorage.setItem('refresh_token', result.refresh_token || result.refresh);
        await getProfile(true);
        navigate('/profile/me', { replace: true });
        return true;
      }

      clearAuthState();
      return false;
    },
    [navigate, getProfile, clearAuthState]
  );

  const logout = useCallback(async () => {
    const refreshTokenValue = localStorage.getItem('refresh_token');
    const result = await handleApiCall(
      () => api.post(API_ENDPOINTS.LOGOUT, { refresh: refreshTokenValue }),
      setIsLoading,
      setError,
      null,
      'Logout'
    );

    clearAuthState();
    navigate('/', { replace: true });
    return result !== null;
  }, [navigate, clearAuthState]);

  const requestPasswordReset = useCallback(
    async (data) => {
      const result = await handleApiCallWithResult(
        () => api.post(API_ENDPOINTS.PASSWORD_RESET, data),
        setIsLoading,
        setError,
        'Password reset link sent!',
        'Password reset request'
      );
      if (result) setSuccess('Password reset link sent!');
      return result;
    },
    []
  );

  const confirmPasswordReset = useCallback(
    async (data) => {
      const result = await handleApiCallWithResult(
        () => api.post(API_ENDPOINTS.PASSWORD_RESET_CONFIRM, data),
        setIsLoading,
        setError,
        'Password reset successfully!',
        'Password reset'
      );
      if (result) {
        setSuccess('Password reset successfully!');
        navigate('/login', { replace: true });
      }
      return result;
    },
    [navigate]
  );

  const updateProfile = useCallback(
    async (data) => {
      if (!isAuthenticated) return null;
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

      const result = await handleApiCall(
        () =>
          api.patch(API_ENDPOINTS.PROFILE, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          }),
        setIsLoading,
        setError,
        'Profile updated!',
        'Profile update'
      );

      if (result) {
        setProfile(result);
        localStorage.setItem('user_profile', JSON.stringify(result));
      }
      return result;
    },
    [isAuthenticated]
  );

  const updateAccountSettings = useCallback(
    async (data) => {
      const result = await handleApiCallWithResult(
        () => api.patch(API_ENDPOINTS.ACCOUNT_SETTINGS, data),
        setIsLoading,
        setError,
        null,
        'Account settings update'
      );
      if (result) await getProfile(true);
      return result;
    },
    [getProfile]
  );

  const updateChatPreferences = useCallback(
    async (data) => {
      if (!isAuthenticated) return null;
      const result = await handleApiCall(
        () => api.patch(API_ENDPOINTS.CHAT_PREFERENCES, data),
        setIsLoading,
        setError,
        'Chat preferences updated!',
        'Chat preferences update'
      );

      if (result) {
        const updatedProfile = { ...profile, chat_preferences: result.chat_preferences };
        setProfile(updatedProfile);
        localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
      }
      return result;
    },
    [isAuthenticated, profile]
  );

  const deleteAccount = useCallback(
    async () => {
      if (!isAuthenticated) return false;
      const result = await handleApiCallWithResult(
        () => api.delete(API_ENDPOINTS.DELETE_ACCOUNT, { data: { confirm: true } }),
        setIsLoading,
        setError,
        'Account deleted successfully!',
        'Account deletion'
      );

      if (result) {
        clearAuthState();
        navigate('/', { replace: true });
      }
      return result;
    },
    [isAuthenticated, navigate, clearAuthState]
  );

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