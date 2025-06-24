import { useState, useEffect, useCallback, useRef } from 'react';
import { useUsers } from './useUsers';
import { useDebounce } from './useDebounce';

export const useProfileData = (userId) => {
  const {
    getUserProfile,
    getFollowers,
    getFollowing,
    getRecommendedUsers,
    searchUsers,
    publicProfile,
    followers,
    following,
    recommendedUsers,
    searchResults,
    isLoading,
    error,
  } = useUsers();

  const [searchQuery, setSearchQuery] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [mutualFollowers, setMutualFollowers] = useState([]);
  const [pagination, setPagination] = useState({
    followers: { next: null, previous: null, page: 1, totalPages: 1 },
    following: { next: null, previous: null, page: 1, totalPages: 1 },
    search: { next: null, previous: null, page: 1, totalPages: 1 },
    recommended: { next: null, previous: null, page: 1, totalPages: 1 },
    mutual: { next: null, previous: null, page: 1, totalPages: 1 },
  });

  const fetchingRef = useRef({
    followers: false,
    following: false,
    recommended: false,
    search: false,
    mutual: false,
  });

  const lastUserIdRef = useRef(null);

  // Memoized API call functions to prevent recreation on every render
  const memoizedGetFollowers = useCallback(async (id, page) => {
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
  }, [getFollowers]);

  const memoizedGetFollowing = useCallback(async (id, page) => {
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
  }, [getFollowing]);

  const memoizedGetMutualFollowers = useCallback(async (id, page) => {
    if (fetchingRef.current.mutual) return;
    fetchingRef.current.mutual = true;
    try {
      const followersData = await getFollowers(id, page);
      const followingData = await getFollowing(id, page);
      if (followersData && followingData) {
        const mutuals = followersData.results.filter((follower) =>
          followingData.results.some((followed) => followed.user_id === follower.user_id)
        );
        setMutualFollowers(mutuals);
        setPagination((prev) => ({
          ...prev,
          mutual: {
            next: followersData.next,
            previous: followersData.previous,
            page,
            totalPages: Math.ceil(followersData.count / (followersData.results?.length || 1)) || 1,
          },
        }));
      }
    } finally {
      fetchingRef.current.mutual = false;
    }
  }, [getFollowers, getFollowing]);

  const memoizedGetRecommendedUsers = useCallback(async (page) => {
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
  }, [getRecommendedUsers]);

  const memoizedSearchUsers = useCallback(async (query, page) => {
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
            totalPages: Math.ceil(data.count / (data.results?.length || 10)) || 1,
          },
        }));
      }
    } finally {
      fetchingRef.current.search = false;
    }
  }, [searchUsers]);

  // Create debounced versions using useDebounce
  const debouncedGetFollowers = useDebounce(memoizedGetFollowers, 300);
  const debouncedGetFollowing = useDebounce(memoizedGetFollowing, 300);
  const debouncedGetMutualFollowers = useDebounce(memoizedGetMutualFollowers, 300);
  const debouncedGetRecommendedUsers = useDebounce(memoizedGetRecommendedUsers, 300);
  const debouncedSearchUsers = useDebounce(memoizedSearchUsers, 300);

  // Load initial data - only when userId changes
  useEffect(() => {
    if (!userId || userId === lastUserIdRef.current) return;

    lastUserIdRef.current = userId;
    setDataLoaded(false);

    const fetchInitialData = async () => {
      try {
        await Promise.all([
          getUserProfile(userId),
          memoizedGetFollowers(userId, 1),
          memoizedGetFollowing(userId, 1),
          memoizedGetMutualFollowers(userId, 1),
          memoizedGetRecommendedUsers(1),
        ]);
        setDataLoaded(true);
      } catch (error) {
        console.error('Error fetching initial profile data:', error);
        setDataLoaded(true); // Still set to true to prevent infinite retries
      }
    };

    fetchInitialData();
  }, [userId, getUserProfile, memoizedGetFollowers, memoizedGetFollowing, memoizedGetMutualFollowers, memoizedGetRecommendedUsers]);

  // Handle search
  const handleSearch = useCallback((e) => {
    const query = e.target.value.trim();
    setSearchQuery(query);
    setPagination((prev) => ({
      ...prev,
      search: { ...prev.search, page: 1, totalPages: 1 },
    }));
    if (query) {
      debouncedSearchUsers(query, 1);
    } else {
      setPagination((prev) => ({
        ...prev,
        search: { next: null, previous: null, page: 1, totalPages: 1 },
      }));
    }
  }, [debouncedSearchUsers]);

  // Handle page changes - memoized with stable dependencies
  const handlePageChange = useCallback((type, page, forceRefresh = false) => {
    const maxPage = pagination[type]?.totalPages || 1;
    if (page > 0 && page <= maxPage) {
      setPagination((prev) => ({
        ...prev,
        [type]: { ...prev[type], page },
      }));

      // Execute the appropriate API call
      switch (type) {
        case 'followers':
          if (forceRefresh) {
            memoizedGetFollowers(userId, page);
          } else {
            debouncedGetFollowers(userId, page);
          }
          break;
        case 'following':
          if (forceRefresh) {
            memoizedGetFollowing(userId, page);
          } else {
            debouncedGetFollowing(userId, page);
          }
          break;
        case 'mutual':
          if (forceRefresh) {
            memoizedGetMutualFollowers(userId, page);
          } else {
            debouncedGetMutualFollowers(userId, page);
          }
          break;
        case 'recommended':
          if (forceRefresh) {
            memoizedGetRecommendedUsers(page);
          } else {
            debouncedGetRecommendedUsers(page);
          }
          break;
        case 'search':
          if (forceRefresh) {
            memoizedSearchUsers(searchQuery, page);
          } else {
            debouncedSearchUsers(searchQuery, page);
          }
          break;
      }
    }
  }, [userId, searchQuery, pagination, memoizedGetFollowers, memoizedGetFollowing, memoizedGetMutualFollowers, memoizedGetRecommendedUsers, memoizedSearchUsers, debouncedGetFollowers, debouncedGetFollowing, debouncedGetMutualFollowers, debouncedGetRecommendedUsers, debouncedSearchUsers]);

  // Retry loading data
  const retryLoad = useCallback(() => {
    setDataLoaded(false);
    lastUserIdRef.current = null; // Reset to force refetch
    fetchingRef.current = {
      followers: false,
      following: false,
      recommended: false,
      search: false,
      mutual: false,
    };
    if (userId) {
      getUserProfile(userId);
    }
  }, [userId, getUserProfile]);

  return {
    publicProfile,
    followers,
    following,
    mutualFollowers,
    recommendedUsers,
    searchResults,
    searchQuery,
    pagination,
    isLoading: isLoading || !dataLoaded,
    error,
    handleSearch,
    handlePageChange,
    retryLoad,
  };
};