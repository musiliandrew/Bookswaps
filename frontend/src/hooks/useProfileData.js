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

  // Create debounced API calls
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
  }, 300);

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
  }, 300);

  const debouncedGetMutualFollowers = useDebounce(async (id, page) => {
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
  }, 300);

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
  }, 300);

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
            totalPages: Math.ceil(data.count / (data.results?.length || 10)) || 1,
          },
        }));
      }
    } finally {
      fetchingRef.current.search = false;
    }
  }, 300);

  // Load initial data
  useEffect(() => {
  if (!userId || dataLoaded) return;
  setDataLoaded(true); // Prevent duplicate fetches

  const fetchInitialData = async () => {
    await Promise.all([
      getUserProfile(userId),
      debouncedGetFollowers(userId, 1),
      debouncedGetFollowing(userId, 1),
      debouncedGetMutualFollowers(userId, 1),
      debouncedGetRecommendedUsers(1),
    ]);
  };
  fetchInitialData();
}, [userId, dataLoaded, getUserProfile, debouncedGetFollowers, debouncedGetFollowing, debouncedGetMutualFollowers, debouncedGetRecommendedUsers]);

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

  // Handle page changes
  const handlePageChange = useCallback((type, page) => {
    const maxPage = pagination[type]?.totalPages || 1;
    if (page > 0 && page <= maxPage) {
      setPagination((prev) => ({
        ...prev,
        [type]: { ...prev[type], page },
      }));
      
      // Execute the appropriate API call
      switch (type) {
        case 'followers':
          debouncedGetFollowers(userId, page);
          break;
        case 'following':
          debouncedGetFollowing(userId, page);
          break;
        case 'mutual':
          debouncedGetMutualFollowers(userId, page);
          break;
        case 'recommended':
          debouncedGetRecommendedUsers(page);
          break;
        case 'search':
          debouncedSearchUsers(searchQuery, page);
          break;
      }
    }
  }, [userId, searchQuery, pagination, debouncedGetFollowers, debouncedGetFollowing, debouncedGetMutualFollowers, debouncedGetRecommendedUsers, debouncedSearchUsers]);

  // Retry loading data
  const retryLoad = useCallback(() => {
    setDataLoaded(false);
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