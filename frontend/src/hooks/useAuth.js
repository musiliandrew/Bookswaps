import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';

export function useAuth() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState(null);
  const [publicProfile, setPublicProfile] = useState(null);
  const [books, setBooks] = useState(null);
  const [recommendedUsers, setRecommendedUsers] = useState(null);
  const [followers, setFollowers] = useState(null);
  const [following, setFollowing] = useState(null);
  const [followStatus, setFollowStatus] = useState(null);
  const isAuthenticated = !!localStorage.getItem('access_token');

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/users/login/', credentials);
      const { access_token, refresh_token } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      toast.success('Welcome back!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Invalid credentials';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/users/register/', data);
      const { access_token, refresh_token } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      toast.success('Welcome to BookSwap!');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setProfile(null);
    setPublicProfile(null);
    setBooks(null);
    setRecommendedUsers(null);
    setFollowers(null);
    setFollowing(null);
    setFollowStatus(null);
    toast.success('Signed out successfully!');
  };

  const requestPasswordReset = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await api.post('/users/password/reset/', data);
      toast.success('Check your email for a reset link');
      setSuccess(true);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to send reset link';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmPasswordReset = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await api.post('/users/password/reset/confirm/', data);
      toast.success('Password reset successfully!');
      setSuccess(true);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Invalid or expired token';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getProfile = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/users/me/profile/');
      setProfile(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch('/users/me/profile/', data);
      setProfile(response.data);
      toast.success('Profile updated!');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAccountSettings = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch('/users/me/settings/account/', data);
      setProfile((prev) => ({ ...prev, ...response.data }));
      toast.success('Account settings updated!');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to update account settings';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateChatPreferences = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch('/users/me/settings/preferences/', data);
      setProfile((prev) => ({
        ...prev,
        chat_preferences: { ...prev.chat_preferences, ...response.data },
      }));
      toast.success('Chat preferences updated!');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to update chat preferences';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (navigateFn) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete('/users/me/delete/', {
        data: { confirm: true },
      });
      logout();
      navigateFn('/login');
      toast.success('Account deleted successfully!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete account';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserProfile = async (username) => {
    setIsLoading(true);
    setError(null);
    setPublicProfile(null);
    try {
      const response = await api.get(`/users/profile/${username}/`);
      setPublicProfile(response.data);
      toast.success('Profile loaded!');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'User not found';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getBooks = async (filters) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.genres?.length) params.append('genre', filters.genres.join(','));
      const response = await api.get(`/library/recommended/?${params.toString()}`);
      setBooks(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch books';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const bookmarkBook = async (bookId, bookmark) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to bookmark books');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = bookmark ? `/library/books/${bookId}/bookmark/` : `/library/books/${bookId}/bookmark/remove/`;
      await api.post(endpoint);
      toast.success(bookmark ? 'Book bookmarked!' : 'Bookmark removed!');
      getBooks({}); // Refresh books
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to bookmark book';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const followUser = async (userId) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to follow users');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await api.post(`/users/follow/${userId}/`);
      setFollowStatus({ is_following: true });
      setPublicProfile((prev) => ({
        ...prev,
        followers_count: (prev.followers_count || 0) + 1,
      }));
      toast.success('Followed user!');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to follow user';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const unfollowUser = async (userId) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to unfollow users');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/users/unfollow/${userId}/`);
      setFollowStatus({ is_following: false });
      setPublicProfile((prev) => ({
        ...prev,
        followers_count: (prev.followers_count || 1) - 1,
      }));
      toast.success('Unfollowed user!');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to unfollow user';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getFollowStatus = async (userId) => {
    if (!isAuthenticated) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/users/follow-status/${userId}/`);
      setFollowStatus(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch follow status';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getFollowers = async (userId) => {
    setIsLoading(true);
    setError(null);
    setFollowers(null);
    try {
      const response = await api.get(`/users/followers/${userId}/`);
      setFollowers(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch followers';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getFollowing = async (userId) => {
    setIsLoading(true);
    setError(null);
    setFollowing(null);
    try {
      const response = await api.get(`/users/following/${userId}/`);
      setFollowing(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch following';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendedUsers = useCallback(async () => {
    if (!isAuthenticated || recommendedUsers) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/users/recommended/');
      setRecommendedUsers(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch recommended users';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, recommendedUsers]);

  return {
    login,
    register,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    getProfile,
    updateProfile,
    updateAccountSettings,
    updateChatPreferences,
    deleteAccount,
    getUserProfile,
    getBooks,
    bookmarkBook,
    followUser,
    unfollowUser,
    getFollowStatus,
    getFollowers,
    getFollowing,
    getRecommendedUsers,
    profile,
    publicProfile,
    books,
    recommendedUsers,
    followers,
    following,
    followStatus,
    isAuthenticated,
    error,
    isLoading,
    success,
  };
}