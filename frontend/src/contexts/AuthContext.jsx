import { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import { handleApiCall, handleApiCallWithResult } from '../utils/apiUtils';
import { API_ENDPOINTS } from '../utils/constants';
import debounce from 'lodash/debounce';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
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
  const initializationRef = useRef(false);

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
      () => api.post(API_ENDPOINTS.TOKEN_REFRESH, { refresh: refresh }),
      setIsLoading,
      setError,
      null, // Don't show success toast for token refresh
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
      const currentProfile = profile;

      // If already fetching or recently fetched (and not forcing), return existing profile
      if (profileFetchRef.current || (now - lastProfileFetch.current < 10000 && !forceFetch && currentProfile)) {
        return currentProfile;
      }

      // Try cached profile first (only if not forcing fetch)
      if (!forceFetch && !currentProfile) {
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
          setProfile(result);
          localStorage.setItem('user_profile', JSON.stringify(result));
          setIsAuthenticated(true);
          return result;
        }

        return null;
      } catch (err) {
        profileFetchRef.current = false;

        // Handle network errors or other issues
        if (err.name === 'AbortError') {
          return null;
        }

        // If it's a 401 error and we haven't tried refresh yet
        if (!forceFetch && (err.response?.status === 401 || err.toString().includes('401'))) {
          const newToken = await refreshToken();
          if (newToken) {
            return await getProfileInternal(true);
          }
        }

        return null;
      }
    },
    [refreshToken, profile]
  );

  const debouncedGetProfile = useMemo(
    () => debounce(getProfileInternal, 300),
    [getProfileInternal]
  );

  const getProfile = useCallback(
    (forceFetch = false) => debouncedGetProfile(forceFetch),
    [debouncedGetProfile]
  );

  // Initialize authentication state once
  useEffect(() => {
    const initializeAuth = async () => {
      if (initializationRef.current) return;
      initializationRef.current = true;

      const token = localStorage.getItem('access_token');
      const cachedProfile = localStorage.getItem('user_profile');

      if (token) {
        // Set the authorization header
        api.defaults.headers.Authorization = `Bearer ${token}`;
        
        // If we have a cached profile, use it immediately
        if (cachedProfile) {
          try {
            const parsedProfile = JSON.parse(cachedProfile);
            setProfile(parsedProfile);
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
          } catch (error) {
            localStorage.removeItem('user_profile');
          }
        }

        // Fetch fresh profile
        try {
          await getProfile(true);
        } catch (error) {
          console.error('Error fetching profile on init:', error);
          setIsLoading(false);
        }
      } else {
        // No token, user is not authenticated
        setIsLoading(false);
        setIsAuthenticated(false);
      }
    };

    initializeAuth();
  }, []); // Empty dependency array - only run once

  // Handle auth events
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

    return () => {
      window.removeEventListener('auth:error', handleAuthError);
      window.removeEventListener('auth:logout', handleAuthLogout);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      debouncedGetProfile.cancel();
    };
  }, [clearAuthState, debouncedGetProfile]);

  const login = useCallback(
    async (credentials) => {
      const result = await handleApiCall(
        () => api.post(API_ENDPOINTS.LOGIN, credentials),
        setIsLoading,
        setError,
        null,
        'Login'
      );

      if (!result) {
        return false;
      }

      // Handle both possible field name variations
      const accessToken = result.access_token || result.token;
      const refreshToken = result.refresh_token || result.refresh;
      
      if (!accessToken) {
        setError('Missing access token in login response');
        toast.error('Invalid login response - missing access token');
        clearAuthState();
        return false;
      }

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      api.defaults.headers.Authorization = `Bearer ${accessToken}`;

      // Clear any existing errors before fetching profile
      setError(null);

      // Call getProfileInternal directly to bypass debouncing
      const profileData = await getProfileInternal(true);
      if (profileData) {
        setIsAuthenticated(true);
        toast.success('Login successful!');
        return true;
      }

      // Since the profile fetch failed but tokens are valid, 
      // let's still consider login successful
      setIsAuthenticated(true);
      toast.success('Login successful!');
      return true;
    },
    [getProfileInternal, clearAuthState]
  );

  const logout = useCallback(() => {
    clearAuthState();
    toast.success('Logged out successfully');
  }, [clearAuthState]);

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

  // New simplified registration methods
  const simpleRegister = useCallback(
    async (userData) => {
      const result = await handleApiCall(
        () => api.post(API_ENDPOINTS.SIMPLE_REGISTER, userData),
        setIsLoading,
        setError,
        null, // Don't show success toast yet
        'Simple registration'
      );

      if (result) {
        // Store tokens
        localStorage.setItem('access_token', result.token);
        localStorage.setItem('refresh_token', result.refresh);
        api.defaults.headers.Authorization = `Bearer ${result.token}`;
        setIsAuthenticated(true);

        // Fetch profile data
        await getProfileInternal(true);
      }

      return result;
    },
    [getProfileInternal]
  );

  const completeProfileStep = useCallback(
    async (profileData) => {
      const result = await handleApiCall(
        () => api.patch(API_ENDPOINTS.PROFILE_STEP, profileData),
        setIsLoading,
        setError,
        'Profile completed successfully!',
        'Profile completion'
      );

      if (result) {
        // Update profile data
        await getProfileInternal(true);
      }

      return result;
    },
    [getProfileInternal]
  );

  const requestPasswordReset = useCallback(
    async (email) => {
      return await handleApiCall(
        () => api.post(API_ENDPOINTS.PASSWORD_RESET_REQUEST, { email }),
        setIsLoading,
        setError,
        'Password reset email sent!',
        'Password reset request'
      );
    },
    []
  );

  const confirmPasswordReset = useCallback(
    async (token, password) => {
      return await handleApiCall(
        () => api.post(API_ENDPOINTS.PASSWORD_RESET_CONFIRM, { token, password }),
        setIsLoading,
        setError,
        'Password reset successful!',
        'Password reset confirmation'
      );
    },
    []
  );

  const updateProfile = useCallback(
    async (profileData) => {
      if (!isAuthenticated) return false;

      console.log('AuthContext updateProfile received:', profileData); // Debug log

      const formData = new FormData();
      Object.keys(profileData).forEach((key) => {
        const value = profileData[key];

        if (key === 'genres' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          // Only append non-empty values to avoid overwriting with empty strings
          if (value !== '' || key === 'about_you') { // Allow empty about_you to clear it
            formData.append(key, value);
          }
        }
      });

      // Debug: Log what's being sent to backend
      console.log('FormData being sent to backend:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const result = await handleApiCallWithResult(
        () => api.patch(API_ENDPOINTS.UPDATE_PROFILE, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
        setIsLoading,
        setError,
        'Profile updated successfully!',
        'Profile update'
      );

      if (result) {
        // Update profile state and cache
        setProfile(result);
        localStorage.setItem('user_profile', JSON.stringify(result));

        // Reset cache timestamp to ensure fresh data on next fetch (if needed)
        lastProfileFetch.current = 0;
      }
      return result;
    },
    [isAuthenticated]
  );

  const updateAccountSettings = useCallback(
    async (settingsData) => {
      if (!isAuthenticated) return false;
      const result = await handleApiCallWithResult(
        () => api.patch(API_ENDPOINTS.UPDATE_ACCOUNT_SETTINGS, settingsData),
        setIsLoading,
        setError,
        'Account settings updated successfully!',
        'Account settings update'
      );

      if (result) {
        setProfile(result);
        localStorage.setItem('user_profile', JSON.stringify(result));
      }
      return result;
    },
    [isAuthenticated]
  );

  const updateChatPreferences = useCallback(
    async (chatPrefs) => {
      if (!isAuthenticated) return false;
      const result = await handleApiCallWithResult(
        () => api.patch(API_ENDPOINTS.UPDATE_CHAT_PREFERENCES, chatPrefs),
        setIsLoading,
        setError,
        'Chat preferences updated successfully!',
        'Chat preferences update'
      );

      if (result) {
        setProfile(result);
        localStorage.setItem('user_profile', JSON.stringify(result));
      }
      return result;
    },
    [isAuthenticated]
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

  const value = {
    login,
    register,
    simpleRegister,
    completeProfileStep,
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
    clearAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
