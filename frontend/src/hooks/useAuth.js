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
    // Remove Authorization header
    delete api.defaults.headers.Authorization;
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
      () => api.post(API_ENDPOINTS.TOKEN_REFRESH, { refresh_token: refresh }),
      setIsLoading,
      setError,
      'Token refresh successful',
      'Token refresh'
    );

    if (result) {
      const newAccessToken = result.access_token || result.access;
      const newRefreshToken = result.refresh_token || result.refresh;
      
      if (newAccessToken) {
        localStorage.setItem('access_token', newAccessToken);
        api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }
        
        setIsAuthenticated(true);
        refreshInProgress.current = false;
        return newAccessToken;
      }
    }

    clearAuthState();
    refreshInProgress.current = false;
    return null;
  }, [clearAuthState]);

  const getProfileInternal = useCallback(
    async (forceFetch = false) => {
      const now = Date.now();
      if (profileFetchRef.current || (now - lastProfileFetch.current < 5000 && !forceFetch)) {
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
      
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      console.log('Fetching profile with token:', token ? 'Present' : 'Missing');

      try {
        const result = await handleApiCall(
          () => api.get(API_ENDPOINTS.PROFILE, { 
            signal: abortControllerRef.current.signal 
          }),
          setIsLoading,
          setError,
          null,
          'Profile fetch'
        );

        profileFetchRef.current = false;
        
        if (result) {
          console.log('Profile fetch successful:', result);
          setProfile(result);
          localStorage.setItem('user_profile', JSON.stringify(result));
          setIsAuthenticated(true);
          return result;
        }

        console.log('Profile fetch failed, no result returned');
        
        // Check if we got a 401 and haven't already tried refreshing
        if (!forceFetch && error && error.toString().includes('401')) {
          console.log('Attempting token refresh due to 401 error');
          const newToken = await refreshToken();
          if (newToken) {
            console.log('Token refreshed, retrying profile fetch');
            return await getProfileInternal(true);
          }
        }

        return null;
      } catch (err) {
        profileFetchRef.current = false;
        console.error('Profile fetch error:', err);
        
        // Handle network errors or other issues
        if (err.name === 'AbortError') {
          return null;
        }
        
        // If it's a 401 error and we haven't tried refresh yet
        if (!forceFetch && (err.response?.status === 401 || err.toString().includes('401'))) {
          console.log('Attempting token refresh due to error:', err);
          const newToken = await refreshToken();
          if (newToken) {
            console.log('Token refreshed, retrying profile fetch');
            return await getProfileInternal(true);
          }
        }
        
        return null;
      }
    },
    [profile, refreshToken, error]
  );

  const debouncedGetProfile = useMemo(
    () => debounce(getProfileInternal, 300),
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

    console.log('Checking auth status - Token:', token ? 'Present' : 'Missing', 'Refresh:', refresh ? 'Present' : 'Missing');

    if (!token && !refresh) {
      clearAuthState();
      setIsLoading(false);
      return;
    }

    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (!decoded?.exp) throw new Error('Invalid token: Missing expiration');
        
        console.log('Token expires at:', new Date(decoded.exp * 1000), 'Current time:', new Date());
        
        if (decoded.exp * 1000 < Date.now()) {
          console.log('Token expired, attempting refresh');
          
          if (!refresh) {
            clearAuthState();
            setIsLoading(false);
            return;
          }
          
          const newToken = await refreshToken();
          if (newToken) {
            await getProfile(true);
          } else {
            clearAuthState();
          }
        } else {
          console.log('Token is valid, fetching profile');
          // Set the Authorization header immediately
          api.defaults.headers.Authorization = `Bearer ${token}`;
          await getProfile();
        }
      } catch (tokenError) {
        console.log('Token decode error:', tokenError);
        
        if (refresh) {
          const newToken = await refreshToken();
          if (newToken) {
            await getProfile(true);
          } else {
            clearAuthState();
          }
        } else {
          clearAuthState();
        }
      }
    } else if (refresh) {
      console.log('No access token but have refresh token, attempting refresh');
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
    const handleAuthError = () => {
      console.log('Auth error event received');
      clearAuthState();
      toast.error('Authentication error, redirecting to login');
    };

    const handleAuthLogout = (event) => {
      console.log('Auth logout event received:', event.detail);
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
      console.log('Attempting login with credentials:', credentials);

      const result = await handleApiCall(
        () => api.post(API_ENDPOINTS.LOGIN, credentials),
        setIsLoading,
        setError,
        null,
        'Login'
      );

      if (!result) {
        console.log('Login failed - no result');
        return false;
      }

      console.log('Login response:', result);

      // Handle both possible field name variations
      const accessToken = result.access_token || result.token;
      const refreshToken = result.refresh_token || result.refresh;
      
      if (!accessToken) {
        console.error('No access token in login response:', result);
        setError('Missing access token in login response');
        toast.error('Invalid login response - missing access token');
        clearAuthState();
        return false;
      }

      if (!refreshToken) {
        console.error('No refresh token in login response:', result);
        setError('Missing refresh token in login response');
        toast.error('Invalid login response - missing refresh token');
        clearAuthState();
        return false;
      }

      console.log('Storing tokens and setting headers');

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      api.defaults.headers.Authorization = `Bearer ${accessToken}`;

      console.log('Fetching profile after login');

      // Clear any existing errors before fetching profile
      setError(null);

      // Call getProfileInternal directly to bypass debouncing
      const profileData = await getProfileInternal(true);
      if (profileData) {
        console.log('Login successful, profile fetched:', profileData);
        setIsAuthenticated(true);
        toast.success('Login successful!');
        return true;
      }

      console.log('Profile fetch failed after login');
      // Since the profile fetch failed but tokens are valid, 
      // let's still consider login successful - checkAuthStatus will handle profile fetch
      setIsAuthenticated(true);
      toast.success('Login successful!');
      return true;
    },
    [getProfileInternal, clearAuthState]
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
        const accessToken = result.access_token || result.token;
        const refreshToken = result.refresh_token || result.refresh;
        
        if (accessToken && refreshToken) {
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
          api.defaults.headers.Authorization = `Bearer ${accessToken}`;
          
          await getProfile(true);
          navigate('/profile/me', { replace: true });
          return true;
        }
      }

      clearAuthState();
      return false;
    },
    [navigate, getProfile, clearAuthState]
  );

  const logout = useCallback(async () => {
    const refreshTokenValue = localStorage.getItem('refresh_token');
    const result = await handleApiCall(
      () => api.post(API_ENDPOINTS.LOGOUT, { refresh_token: refreshTokenValue }),
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