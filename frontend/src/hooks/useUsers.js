import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { handleApiCall, handleApiCallWithResult } from '../utils/apiUtils';
import { API_ENDPOINTS } from '../utils/constants';
import { useNotifications } from './useNotifications';
import { cachedApiCall, requestCache } from '../utils/requestCache';
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
    const cacheKey = `user_profile_${identifier}`;

    try {
      const result = await cachedApiCall(
        () => handleApiCall(
          () => api.get(API_ENDPOINTS.GET_USER_PROFILE(identifier)),
          setIsLoading,
          setError,
          null,
          'Fetch user profile'
        ),
        cacheKey,
        60000 // Cache for 1 minute
      );

      if (!result) {
        console.error('Profile fetch failed:', error);
      } else {
        console.log('Profile fetched:', result);
        setPublicProfile(result);
      }
      return result;
    } catch (err) {
      console.error('Profile fetch error:', err);
      return null;
    }
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
    const cacheKey = `followers_${userId}_page_${page}`;

    try {
      const result = await cachedApiCall(
        () => handleApiCall(
          () => api.get(`${API_ENDPOINTS.GET_FOLLOWERS(userId)}?page=${page}`),
          setIsLoading,
          setError,
          null,
          'Fetch followers'
        ),
        cacheKey,
        30000 // Cache for 30 seconds
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
    } catch (err) {
      console.error('Followers fetch error:', err);
      return null;
    }
  }, []);

  const getFollowing = useCallback(async (userId, page = 1) => {
    const cacheKey = `following_${userId}_page_${page}`;

    try {
      const result = await cachedApiCall(
        () => handleApiCall(
          () => api.get(`${API_ENDPOINTS.GET_FOLLOWING(userId)}?page=${page}`),
          setIsLoading,
          setError,
          null,
          'Fetch following'
        ),
        cacheKey,
        30000 // Cache for 30 seconds
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
    } catch (err) {
      console.error('Following fetch error:', err);
      return null;
    }
  }, []);

  const getRecommendedUsers = useCallback(async (page = 1) => {
    const cacheKey = `recommended_users_page_${page}`;

    try {
      const result = await cachedApiCall(
        () => handleApiCall(
          () => api.get(`${API_ENDPOINTS.GET_RECOMMENDED_USERS}?page=${page}`),
          setIsLoading,
          setError,
          null,
          'Fetch recommended users'
        ),
        cacheKey,
        120000 // Cache for 2 minutes (recommended users change less frequently)
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
    } catch (err) {
      console.error('Recommended users fetch error:', err);
      return null;
    }
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

  const getUserBooks = useCallback(async (userId, page = 1) => {
    const cacheKey = `user_books_${userId}_page_${page}`;

    try {
      const result = await cachedApiCall(
        () => handleApiCall(
          () => api.get(`${API_ENDPOINTS.GET_USER_LIBRARY(userId)}?page=${page}`),
          setIsLoading,
          setError,
          null,
          'Fetch user books'
        ),
        cacheKey,
        60000 // Cache for 1 minute
      );

      if (result) {
        const results = Array.isArray(result) ? result : result.results || [];
        return {
          results,
          next: result.next || null,
          previous: result.previous || null,
          count: result.count || results.length || 0,
        };
      }
      return null;
    } catch (err) {
      console.error('User books fetch error:', err);
      return null;
    }
  }, []);

  // Create stable debounced functions using useRef to avoid dependency issues
  const debouncedGetFollowersRef = useRef(null);
  const debouncedGetFollowingRef = useRef(null);
  const debouncedGetRecommendedUsersRef = useRef(null);
  const debouncedSearchUsersRef = useRef(null);

  // Initialize debounced functions once
  if (!debouncedGetFollowersRef.current) {
    debouncedGetFollowersRef.current = debounce(async (id, page) => {
      if (fetchingRef.current.followers) return;
      fetchingRef.current.followers = true;
      try {
        await getFollowers(id, page);
      } finally {
        fetchingRef.current.followers = false;
      }
    }, 1000);
  }

  if (!debouncedGetFollowingRef.current) {
    debouncedGetFollowingRef.current = debounce(async (id, page) => {
      if (fetchingRef.current.following) return;
      fetchingRef.current.following = true;
      try {
        await getFollowing(id, page);
      } finally {
        fetchingRef.current.following = false;
      }
    }, 1000);
  }

  if (!debouncedGetRecommendedUsersRef.current) {
    debouncedGetRecommendedUsersRef.current = debounce(async (page) => {
      if (fetchingRef.current.recommended) return;
      fetchingRef.current.recommended = true;
      try {
        await getRecommendedUsers(page);
      } finally {
        fetchingRef.current.recommended = false;
      }
    }, 1000);
  }

  if (!debouncedSearchUsersRef.current) {
    debouncedSearchUsersRef.current = debounce(async (query, page) => {
      if (fetchingRef.current.search) return;
      fetchingRef.current.search = true;
      try {
        await searchUsers({ query }, page);
      } finally {
        fetchingRef.current.search = false;
      }
    }, 1000);
  }

  // Remove the problematic useEffect hooks that were causing infinite loops
  // The debounced functions are now stable and don't need to be recreated

  useEffect(() => {
    if (!isWebSocketConnected || !notifications?.length) return;

    const lastNotification = notifications[notifications.length - 1];
    if (lastNotification?.type === 'notification' && lastNotification.user_id) {
      setFollowStatus((prev) =>
        prev?.user_id === lastNotification.user_id
          ? { ...prev, is_following: true }
          : prev
      );
      // Only call if the debounced function exists
      if (debouncedGetFollowersRef.current) {
        debouncedGetFollowersRef.current(lastNotification.user_id, 1);
      }
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
    getUserBooks,
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