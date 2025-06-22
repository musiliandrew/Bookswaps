import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { handleApiCall, handleApiCallWithResult } from '../utils/apiUtils';
import { API_ENDPOINTS } from '../utils/constants';
import { useNotifications } from './useNotifications';
import debounce from 'lodash/debounce';

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

  const updatePagination = (data, key, page) => {
    setPagination((prev) => ({
      ...prev,
      [key]: {
        next: data.next || null,
        previous: data.previous || null,
        page,
        totalPages: Math.ceil(data.count / (data.results?.length || 1)) || 1,
      },
    }));
  };

  const getUserProfile = useCallback(async (identifier) => {
    const result = await handleApiCall(
      () => api.get(API_ENDPOINTS.GET_USER_PROFILE(identifier)),
      setIsLoading,
      setError,
      null,
      'Fetch user profile'
    );
    if (!result) {
      console.error('Profile fetch failed:', error);
    } else {
      console.log('Profile fetched:', result);
      setPublicProfile(result);
    }
    return result;
  }, [error]);

  const followUser = useCallback(async (userId, source = 'Search') => {
    const result = await handleApiCall(
      () => api.post(API_ENDPOINTS.FOLLOW_USER(userId), { followed_id: userId, source }),
      setIsLoading,
      setError,
      'User followed!',
      'Follow user'
    );
    if (result) {
      setFollowStatus((prev) => ({
        ...prev,
        [userId]: { is_following: true, is_mutual: result.is_mutual },
      }));
    }
    return result;
  }, []);

  const unfollowUser = useCallback(async (userId) => {
    const result = await handleApiCallWithResult(
      () => api.delete(API_ENDPOINTS.UNFOLLOW_USER(userId)),
      setIsLoading,
      setError,
      'User unfollowed!',
      'Unfollow user'
    );
    if (result) {
      setFollowStatus((prev) => ({
        ...prev,
        [userId]: { is_following: false, is_mutual: false },
      }));
    }
    return result;
  }, []);

  const removeFollower = useCallback(async (userId) => {
    const result = await handleApiCallWithResult(
      () => api.delete(API_ENDPOINTS.REMOVE_FOLLOWER(userId)),
      setIsLoading,
      setError,
      'Follower removed!',
      'Remove follower'
    );
    if (result) {
      setFollowers((prev) => prev.filter((follower) => follower.user_id !== userId));
      setFollowStatus((prev) => ({
        ...prev,
        [userId]: { is_following: false, is_mutual: false },
      }));
    }
    return result;
  }, []);

  const getFollowStatus = useCallback(async (userId, otherUserId) => {
    const params = new URLSearchParams({ other_user_id: otherUserId });
    const result = await handleApiCall(
      () => api.get(`${API_ENDPOINTS.GET_FOLLOW_STATUS(userId)}?${params.toString()}`),
      setIsLoading,
      setError,
      null,
      'Fetch follow status'
    );
    if (result) {
      setFollowStatus(result);
    }
    return result;
  }, []);

  const getFollowers = useCallback(async (userId, page = 1) => {
    const result = await handleApiCall(
      () => api.get(`${API_ENDPOINTS.GET_FOLLOWERS(userId)}?page=${page}`),
      setIsLoading,
      setError,
      null,
      'Fetch followers'
    );
    if (result) {
      setFollowers(result.results || []);
      updatePagination(result, 'followers', page);
      return {
        results: result.results || [],
        next: result.next,
        previous: result.previous,
        count: result.count || 0,
      };
    }
    return null;
  }, []);

  const getFollowing = useCallback(async (userId, page = 1) => {
    const result = await handleApiCall(
      () => api.get(`${API_ENDPOINTS.GET_FOLLOWING(userId)}?page=${page}`),
      setIsLoading,
      setError,
      null,
      'Fetch following'
    );
    if (result) {
      setFollowing(result.results || []);
      updatePagination(result, 'following', page);
      return {
        results: result.results || [],
        next: result.next,
        previous: result.previous,
        count: result.count || 0,
      };
    }
    return null;
  }, []);

  const getRecommendedUsers = useCallback(async (page = 1) => {
    const result = await handleApiCall(
      () => api.get(`${API_ENDPOINTS.GET_RECOMMENDED_USERS}?page=${page}`),
      setIsLoading,
      setError,
      null,
      'Fetch recommended users'
    );
    if (result) {
      const results = Array.isArray(result) ? result : result.results || [];
      const next = result.next || null;
      const previous = result.previous || null;
      const count = result.count || results.length || 0;
      setRecommendedUsers(results);
      updatePagination({ results, next, previous, count }, 'recommended', page);
      return { results, next, previous, count };
    }
    return null;
  }, []);

  const searchUsers = useCallback(async (filters = {}, page = 1) => {
    const params = new URLSearchParams({ page });
    if (filters.query) params.append('q', filters.query.trim());
    if (filters.genres?.length) params.append('genres', filters.genres.join(','));

    const result = await handleApiCall(
      () => api.get(`${API_ENDPOINTS.SEARCH_USERS}?${params.toString()}`),
      setIsLoading,
      setError,
      null,
      'Search users'
    );
    if (result) {
      const results = Array.isArray(result) ? result : result.results || [];
      const next = result.next || null;
      const previous = result.previous || null;
      const count = result.count || results.length || 0;
      setSearchResults(results);
      updatePagination({ results, next, previous, count }, 'search', page);
      return { results, next, previous, count };
    }
    return null;
  }, []);

  // Create debounced functions with useRef to avoid dependency issues
  const debouncedGetFollowersRef = useRef(
    debounce(async (id, page) => {
      if (fetchingRef.current.followers) return;
      fetchingRef.current.followers = true;
      try {
        await getFollowers(id, page);
      } finally {
        fetchingRef.current.followers = false;
      }
    }, 1000)
  );

  const debouncedGetFollowingRef = useRef(
    debounce(async (id, page) => {
      if (fetchingRef.current.following) return;
      fetchingRef.current.following = true;
      try {
        await getFollowing(id, page);
      } finally {
        fetchingRef.current.following = false;
      }
    }, 1000)
  );

  const debouncedGetRecommendedUsersRef = useRef(
    debounce(async (page) => {
      if (fetchingRef.current.recommended) return;
      fetchingRef.current.recommended = true;
      try {
        await getRecommendedUsers(page);
      } finally {
        fetchingRef.current.recommended = false;
      }
    }, 1000)
  );

  const debouncedSearchUsersRef = useRef(
    debounce(async (query, page) => {
      if (fetchingRef.current.search) return;
      fetchingRef.current.search = true;
      try {
        await searchUsers({ query }, page);
      } finally {
        fetchingRef.current.search = false;
      }
    }, 1000)
  );

  // Update the debounced functions when dependencies change
  useEffect(() => {
    debouncedGetFollowersRef.current = debounce(async (id, page) => {
      if (fetchingRef.current.followers) return;
      fetchingRef.current.followers = true;
      try {
        await getFollowers(id, page);
      } finally {
        fetchingRef.current.followers = false;
      }
    }, 1000);
  }, [getFollowers]);

  useEffect(() => {
    debouncedGetFollowingRef.current = debounce(async (id, page) => {
      if (fetchingRef.current.following) return;
      fetchingRef.current.following = true;
      try {
        await getFollowing(id, page);
      } finally {
        fetchingRef.current.following = false;
      }
    }, 1000);
  }, [getFollowing]);

  useEffect(() => {
    debouncedGetRecommendedUsersRef.current = debounce(async (page) => {
      if (fetchingRef.current.recommended) return;
      fetchingRef.current.recommended = true;
      try {
        await getRecommendedUsers(page);
      } finally {
        fetchingRef.current.recommended = false;
      }
    }, 1000);
  }, [getRecommendedUsers]);

  useEffect(() => {
    debouncedSearchUsersRef.current = debounce(async (query, page) => {
      if (fetchingRef.current.search) return;
      fetchingRef.current.search = true;
      try {
        await searchUsers({ query }, page);
      } finally {
        fetchingRef.current.search = false;
      }
    }, 1000);
  }, [searchUsers]);

  useEffect(() => {
    if (!isWebSocketConnected || !notifications?.length) return;

    const lastNotification = notifications[notifications.length - 1];
    if (lastNotification?.type === 'notification' && lastNotification.user_id) {
      setFollowStatus((prev) =>
        prev?.user_id === lastNotification.user_id
          ? { ...prev, is_following: true }
          : prev
      );
      debouncedGetFollowersRef.current(lastNotification.user_id, 1);
    }
  }, [notifications, isWebSocketConnected]);

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
    debouncedGetFollowers: debouncedGetFollowersRef.current,
    debouncedGetFollowing: debouncedGetFollowingRef.current,
    debouncedGetRecommendedUsers: debouncedGetRecommendedUsersRef.current,
    debouncedSearchUsers: debouncedSearchUsersRef.current,
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