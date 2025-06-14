import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import { useNotifications } from './useNotifications';

export function useUsers() {
  const [publicProfile, setPublicProfile] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [followStatus, setFollowStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    followers: { next: null, previous: null, page: 1, totalPages: 1 },
    following: { next: null, previous: null, page: 1, totalPages: 1 },
    search: { next: null, previous: null, page: 1, totalPages: 1 },
    recommended: { next: null, previous: null, page: 1, totalPages: 1 },
  });

  const { notifications, isWebSocketConnected } = useNotifications();

  const getUserProfile = useCallback(async (identifier) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/users/profile/${identifier}/`);
      setPublicProfile(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch user profile';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const followUser = useCallback(async (userId, source = 'Search') => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/users/follow/${userId}/`, { source });
      setFollowStatus({ user_id: userId, is_following: true });
      toast.success('User followed!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to follow user';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unfollowUser = useCallback(async (userId) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/users/unfollow/${userId}/`);
      setFollowStatus({ user_id: userId, is_following: false });
      toast.success('User unfollowed!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to unfollow user';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFollowStatus = useCallback(async (userId, otherUserId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/users/follow-status/${userId}/?other_user_id=${otherUserId}`);
      setFollowStatus(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch follow status';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFollowers = useCallback(async (userId, page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/users/followers/${userId}/?page=${page}`);
      setFollowers(response.data.results || []);
      setPagination((prev) => ({
        ...prev,
        followers: {
          next: response.data.next,
          previous: response.data.previous,
          page,
          totalPages: Math.ceil(response.data.count / (response.data.results?.length || 1)),
        },
      }));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch followers';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFollowing = useCallback(async (userId, page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/users/following/${userId}/?page=${page}`);
      setFollowing(response.data.results || []);
      setPagination((prev) => ({
        ...prev,
        following: {
          next: response.data.next,
          previous: response.data.previous,
          page,
          totalPages: Math.ceil(response.data.count / (response.data.results?.length || 1)),
        },
      }));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch following';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRecommendedUsers = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/users/recommended/?page=${page}`);
      console.log('Recommended users response:', response.data); // Debug log
      const results = response.data.results || [];
      setRecommendedUsers(results);
      setPagination((prev) => ({
        ...prev,
        recommended: {
          next: response.data.next,
          previous: response.data.previous,
          page,
          totalPages: Math.ceil((response.data.count || results.length || 0) / (results.length || 1)),
        },
      }));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch recommended users';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchUsers = useCallback(async (filters = {}, page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page });
      if (filters.query) params.append('q', filters.query);
      if (filters.genres?.length) params.append('genres', filters.genres.join(','));
      const response = await api.get(`/users/search/?${params.toString()}`);
      setSearchResults(response.data.results || []);
      setPagination((prev) => ({
        ...prev,
        search: {
          next: response.data.next,
          previous: response.data.previous,
          page,
          totalPages: Math.ceil(response.data.count / (response.data.results?.length || 1)),
        },
      }));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to search users';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isWebSocketConnected || !notifications?.length) return;

    const lastNotification = notifications[notifications.length - 1];
    if (lastNotification?.type === 'notification' && lastNotification.user_id) {
      setFollowStatus((prev) =>
        prev?.user_id === lastNotification.user_id
          ? { ...prev, is_following: true }
          : prev
      );
      getFollowers(lastNotification.user_id);
    }
  }, [notifications, isWebSocketConnected, getFollowers]);

  return {
    getUserProfile,
    followUser,
    unfollowUser,
    getFollowStatus,
    getFollowers,
    getFollowing,
    getRecommendedUsers,
    searchUsers,
    publicProfile,
    followers,
    following,
    recommendedUsers,
    searchResults,
    followStatus,
    isLoading,
    error,
    pagination,
  };
}
