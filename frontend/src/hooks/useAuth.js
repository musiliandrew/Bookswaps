import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import debounce from 'lodash/debounce';

export function useAuth() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState(null);

  const [searchResults, setSearchResults] = useState(null);
  const [publicProfile, setPublicProfile] = useState(null);
  const [books, setBooks] = useState(null);
  const [topBooks, setTopBooks] = useState(null);
  const [recommendedUsers, setRecommendedUsers] = useState(null);
  const [followers, setFollowers] = useState(null);
  const [following, setFollowing] = useState(null);
  const [followStatus, setFollowStatus] = useState(null);
  const isAuthenticated = !!localStorage.getItem('access_token');

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Sending login request with credentials:', credentials); // Debug
      const response = await api.post('/users/login/', credentials);
      const { access_token, refresh_token } = response.data;
      console.log('Login response:', response.data); // Debug
      console.log('Storing tokens:', { access_token, refresh_token }); // Debug
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      // Verify storage
      console.log('Stored access_token:', localStorage.getItem('access_token'));
      toast.success('Welcome back!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Invalid credentials';
      console.error('Login error:', err.response?.data); // Debug
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
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
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
    setSearchResults(null);
    setPublicProfile(null);
    setBooks(null);
    setTopBooks(null);
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getProfile = useCallback(
    debounce(async () => {
      if (!isAuthenticated) return;
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token');
        console.log('Fetching profile with token:', token);
        const response = await api.get('/users/me/profile/');
        console.log('Profile response:', response.data);
        setProfile(response.data);
      } catch (err) {
        const errorMessage = err.response?.data?.detail || 'Failed to fetch profile';
        console.error('Profile error:', err.response?.data);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }, 500), // Debounce for 500ms
    [isAuthenticated]
  );

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
        data: { confirm: true }
      });
      logout(true, navigateFn);
      toast.success('Account deleted successfully!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete account';
      console.error('Delete account error:', err.response?.data);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  const searchUsers = async (data) => {
    setIsLoading(true);
    setError(null);
    setSearchResults(null);
    try {
      const params = new URLSearchParams();
      if (data.username) params.append('username', data.username);
      if (data.genres.length) params.append('genres', data.genres.join(','));
      const response = await api.get(`/users/search/?${params.toString()}`);
      setSearchResults(response.data);
      toast.success(`Found ${response.data.length} users!`);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to search users';
      setError(errorMessage);
      toast.error(errorMessage);
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
      if (filters.genres.length) params.append('genres', filters.genres.join(','));
      const [booksResponse, topBooksResponse] = await Promise.all([
        api.get(`/library/posts/?${params.toString()}`),
        api.get('/library/top-posts/')
      ]);
      setBooks(booksResponse.data);
      setTopBooks(topBooksResponse.data);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch books';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const bookmarkBook = async (discussionId, bookmark) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to bookmark books');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await api.post(`/discussions/posts/${discussionId}/notes/`, { content: bookmark ? 'bookmark' : 'unbookmark' });
      toast.success(bookmark ? 'Book bookmarked!' : 'Bookmark removed!');
      getBooks({}); // Refresh books to update bookmark status
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

  const getRecommendedUsers = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendedUsers(null);
    try {
      const response = await api.get('/users/recommended/');
      setRecommendedUsers(response.data);
      toast.success('Recommended users loaded!');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch recommended users';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
    searchUsers,
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
    searchResults,
    publicProfile,
    books,
    topBooks,
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