import { useState, useCallback, useEffect, useRef } from 'react';
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
    recommended: { next: null, previous: null, page: 1, totalPages: 1 },
    search: { next: null, previous: null, page: 1, totalPages: 1 },
  });

  const fetchingRef = useRef({
    followers: false,
    following: false,
    recommended: false,
    search: false,
  });

  const { notifications, isWebSocketConnected } = useNotifications();

  // Debounce utility
  const useDebounce = (callback, delay) => {
    const timeoutRef = useRef(null);
    return useCallback(
      (...args) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => callback(...args), delay);
      },
      [callback, delay]
    );
  };

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
      const response = await api.post(`/users/follow/${userId}/`, {
        followed_id: userId,
        source,
      });
      setFollowStatus((prev) => ({
        ...prev,
        [userId]: { is_following: true, is_mutual: response.data.is_mutual },
      }));
      toast.success('User followed!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to follow user';
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
      setFollowStatus((prev) => ({
        ...prev,
        [userId]: { is_following: false, is_mutual: false },
      }));
      toast.success('User unfollowed!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to unfollow user';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeFollower = useCallback(async (userId) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/users/remove-follower/${userId}/`);
      setFollowers((prev) => prev.filter((follower) => follower.user_id !== userId));
      setFollowStatus((prev) => ({
        ...prev,
        [userId]: { is_following: false, is_mutual: false },
      }));
      toast.success('Follower removed!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to remove follower';
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
      return {
        results: response.data.results || [],
        next: response.data.next,
        previous: response.data.previous,
        count: response.data.count || 0,
      };
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
      return {
        results: response.data.results || [],
        next: response.data.next,
        previous: response.data.previous,
        count: response.data.count || 0,
      };
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
      let results, next, previous, count;
      if (Array.isArray(response.data)) {
        results = response.data;
        next = null;
        previous = null;
        count = response.data.length;
      } else {
        results = response.data.results || [];
        next = response.data.next;
        previous = response.data.previous;
        count = response.data.count || 0;
      }
      setRecommendedUsers(results);
      return { results, next, previous, count };
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
      const params = new URLSearchParams();
      params.append('page', page);
      if (filters.query) params.append('q', filters.query.trim());
      if (filters.genres?.length) params.append('genres', filters.genres.join(','));

      const response = await api.get(`/users/search/?${params.toString()}`);
      const responseData = {
        results: Array.isArray(response.data) ? response.data : response.data.results || [],
        count: response.data.count || response.data.length || 0,
        next: response.data.next || null,
        previous: response.data.previous || null,
      };
      setSearchResults(responseData.results);
      return responseData;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to search users';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced API calls
  const debouncedGetFollowers = useDebounce(async (id, page) => {
    if (fetchingRef.current.followers) return;
    fetchingRef.current.followers = true;
    try {
      const data = await getFollowers(id, page);
      if (data) {
        setPagination((prev) => ({
          ...prev,
          followers: {
            next: data.next,
            previous: data.previous,
            page,
            totalPages: Math.ceil(data.count / (data.results?.length || 1)) || 1,
          },
        }));
      }
    } finally {
      fetchingRef.current.followers = false;
    }
  }, 1000);

  const debouncedGetFollowing = useDebounce(async (id, page) => {
    if (fetchingRef.current.following) return;
    fetchingRef.current.following = true;
    try {
      const data = await getFollowing(id, page);
      if (data) {
        setPagination((prev) => ({
          ...prev,
          following: {
            next: data.next,
            previous: data.previous,
            page,
            totalPages: Math.ceil(data.count / (data.results?.length || 1)) || 1,
          },
        }));
      }
    } finally {
      fetchingRef.current.following = false;
    }
  }, 1000);

  const debouncedGetRecommendedUsers = useDebounce(async (page) => {
    if (fetchingRef.current.recommended) return;
    fetchingRef.current.recommended = true;
    try {
      const data = await getRecommendedUsers(page);
      if (data) {
        setPagination((prev) => ({
          ...prev,
          recommended: {
            next: data.next,
            previous: data.previous,
            page,
            totalPages: Math.ceil(data.count / (data.results?.length || 1)) || 1,
          },
        }));
      }
    } finally {
      fetchingRef.current.recommended = false;
    }
  }, 1000);

  const debouncedSearchUsers = useDebounce(async (query, page) => {
    if (fetchingRef.current.search) return;
    fetchingRef.current.search = true;
    try {
      const data = await searchUsers({ query }, page);
      if (data) {
        setPagination((prev) => ({
          ...prev,
          search: {
            next: data.next,
            previous: data.previous,
            page,
            totalPages: Math.ceil(data.count / (data.results?.length || 1)) || 1,
          },
        }));
      }
    } finally {
      fetchingRef.current.search = false;
    }
  }, 1000);

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
    removeFollower,
    getFollowStatus,
    getFollowers,
    getFollowing,
    getRecommendedUsers,
    searchUsers,
    debouncedGetFollowers,
    debouncedGetFollowing,
    debouncedGetRecommendedUsers,
    debouncedSearchUsers,
    publicProfile,
    followers,
    following,
    recommendedUsers,
    searchResults,
    setSearchResults,
    followStatus,
    isLoading,
    error,
    pagination,
    setPagination,
  };
}