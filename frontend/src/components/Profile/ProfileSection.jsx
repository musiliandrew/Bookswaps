import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useUsers } from '../../hooks/useUsers';
import UserProfileCard from './UserProfileCard';
import ConnectionsSection from './ConnectionsSection';
import DiscoverSection from './DiscoverSection';
import { toast } from 'react-toastify';

const ProfileSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useAuth();
  const {
    getUserProfile,
    followUser,
    unfollowUser,
    removeFollower,
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
    isLoading: usersLoading,
    error: usersError,
  } = useUsers();

  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFollowStatuses, setUserFollowStatuses] = useState({});
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
    followStatus: false,
    mutual: false,
  });

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

  const debouncedGetFollowStatus = useDebounce(async (id, otherId) => {
    if (fetchingRef.current.followStatus) return;
    fetchingRef.current.followStatus = true;
    try {
      const status = await getFollowStatus(id, otherId);
      setUserFollowStatuses((prev) => ({
        ...prev,
        [otherId]: status,
      }));
    } finally {
      fetchingRef.current.followStatus = false;
    }
  }, 300);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Load initial data
  useEffect(() => {
    if (profile?.user_id && !dataLoaded) {
      const fetchInitialData = async () => {
        await Promise.all([
          getUserProfile(profile.user_id),
          debouncedGetFollowers(profile.user_id, pagination.followers.page),
          debouncedGetFollowing(profile.user_id, pagination.following.page),
          debouncedGetMutualFollowers(profile.user_id, pagination.mutual.page),
          debouncedGetRecommendedUsers(pagination.recommended.page),
        ]);
        setDataLoaded(true);
      };
      fetchInitialData();
    }
  }, [
    profile?.user_id,
    dataLoaded,
    getUserProfile,
    debouncedGetFollowers,
    debouncedGetFollowing,
    debouncedGetMutualFollowers,
    debouncedGetRecommendedUsers,
    pagination.followers.page,
    pagination.following.page,
    pagination.mutual.page,
    pagination.recommended.page,
  ]);

  // Fetch follow status for listed users
  useEffect(() => {
    if (profile?.user_id && dataLoaded) {
      const userIds = [...followers, ...following, ...mutualFollowers]
        .map((user) => user.user_id)
        .filter((userId) => !userFollowStatuses[userId]);
      if (userIds.length > 0) {
        Promise.all(userIds.map((userId) => debouncedGetFollowStatus(profile.user_id, userId)));
      }
    }
  }, [
    profile?.user_id,
    dataLoaded,
    followers,
    following,
    mutualFollowers,
    debouncedGetFollowStatus,
    userFollowStatuses,
  ]);

  // Handle page changes
  const handlePageChange = (type, page) => {
    const maxPage = pagination[type]?.totalPages || 1;
    if (page > 0 && page <= maxPage) {
      setPagination((prev) => ({
        ...prev,
        [type]: { ...prev[type], page },
      }));
      if (type === 'followers') debouncedGetFollowers(profile.user_id, page);
      if (type === 'following') debouncedGetFollowing(profile.user_id, page);
      if (type === 'mutual') debouncedGetMutualFollowers(profile.user_id, page);
      if (type === 'recommended') debouncedGetRecommendedUsers(page);
      if (type === 'search') debouncedSearchUsers(searchQuery, page);
    }
  };

  // Handle search
  const handleSearch = (e) => {
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
  };

  // Handle follow
  const handleFollow = async (userId, source = 'Search') => {
    if (!userId || typeof userId !== 'string') {
      toast.error('Invalid user ID');
      return;
    }
    const result = await followUser(userId, source);
    if (result) {
      await getUserProfile(publicProfile?.user_id || userId);
      debouncedGetFollowers(profile.user_id, pagination.followers.page);
      debouncedGetFollowing(profile.user_id, pagination.following.page);
      debouncedGetMutualFollowers(profile.user_id, pagination.mutual.page);
      debouncedGetRecommendedUsers(pagination.recommended.page);
      if (searchQuery) debouncedSearchUsers(searchQuery, pagination.search.page);
      setUserFollowStatuses((prev) => ({
        ...prev,
        [userId]: { is_following: true, is_mutual: result.is_mutual },
      }));
      toast.success('Followed user!');
    }
  };

  // Handle unfollow
  const handleUnfollow = async (userId) => {
    const result = await unfollowUser(userId);
    if (result) {
      await getUserProfile(publicProfile?.user_id || userId);
      debouncedGetFollowers(profile.user_id, pagination.followers.page);
      debouncedGetFollowing(profile.user_id, pagination.following.page);
      debouncedGetMutualFollowers(profile.user_id, pagination.mutual.page);
      debouncedGetRecommendedUsers(pagination.recommended.page);
      if (searchQuery) debouncedSearchUsers(searchQuery, pagination.search.page);
      setUserFollowStatuses((prev) => ({
        ...prev,
        [userId]: { is_following: false, is_mutual: false },
      }));
      toast.success('Unfollowed user!');
    }
  };

  // Handle remove follower
  const handleRemoveFollower = async (userId) => {
    const result = await removeFollower(userId);
    if (result) {
      debouncedGetFollowers(profile.user_id, pagination.followers.page);
      debouncedGetFollowing(profile.user_id, pagination.following.page);
      debouncedGetMutualFollowers(profile.user_id, pagination.mutual.page);
      if (searchQuery) debouncedSearchUsers(searchQuery, pagination.search.page);
      const status = await getFollowStatus(profile.user_id, userId);
      setUserFollowStatuses((prev) => ({
        ...prev,
        [userId]: status || { is_following: false, is_mutual: false },
      }));
      toast.success('Follower removed!');
    }
  };

  // View other user's profile
  const viewUserProfile = async (userId) => {
    const userProfile = await getUserProfile(userId);
    if (userProfile) {
      await debouncedGetFollowStatus(profile.user_id, userId);
      setSelectedUser(userProfile);
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen bg-bookish-gradient">
        <div className="bookish-spinner w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="text-center p-4 text-[var(--text)] bg-bookish-gradient h-screen">
        <p className="mb-4">{usersError || 'Failed to load profile data.'}</p>
        <button
          onClick={() => {
            setDataLoaded(false);
            fetchingRef.current = {
              followers: false,
              following: false,
              recommended: false,
              search: false,
              followStatus: false,
              mutual: false,
            };
            getUserProfile(profile?.user_id);
          }}
          className="py-2 px-2 rounded-xl text-[var(--secondary)]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="pt-4">
      {selectedUser ? (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          className="px-4 mb-4 rounded-xl px-2"
        >
          <button
            onClick={() => setSelectedUser(null)}
            className="flex items-center justify-center py-2 mb-2 text-sm text-[var(--accent)] hover:underline"
          >
            <span className="mr-2">←</span> Back
          </button>
          <UserProfileCard
            user={selectedUser || publicProfile}
            isOwnProfile={selectedUser?.user_id === profile.user_id}
            followStatus={userFollowStatuses[selectedUser?.user_id || profile?.user_id] || []}
            onFollow={() => handleFollow(selectedUser?.user_id, 'Profile')}
            onUnFollow={() => handleUnfollow(selectedUser?.user_id)}
            onRefreshProfile={() => getUserProfile(selectedUser?.user_id || profile.user_id)}
          />
        </motion.div>
      ) : (
        <>
          <nav className="flex mb-4 gap-2 border-b border-[var(--secondary)] pb-2 py-2">
            {[
              { id: 'profile', label: 'Profile' },
              { id: 'connections', label: 'Connections' },
              { id: 'discover', label: 'Discover' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-2 py-2 text-sm font-medium rounded-lg ${
                  activeSubTab === tab.id
                    ? 'text-[var(--accent)] bg-[var(--accent)]/10'
                    : 'text-[#456A76] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeSubTab === 'profile' && (
              <UserProfileCard
                user={publicProfile}
                isOwnProfile={true}
                followStatus={userFollowStatuses[profile?.user_id] || []}
                onFollow={() => {}}
                onUnFollow={() => {}}
                onViewProfile={() => {}}
              />
            )}
            {activeSubTab === 'connections' && (
              <ConnectionsSection
                followers={followers}
                following={following}
                mutualFollowers={mutualFollowers}
                pagination={pagination}
                currentPage={pagination}
                onPageChange={handlePageChange}
                onViewProfile={viewUserProfile}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
                onRemoveFollower={handleRemoveFollower}
                userFollowStatuses={userFollowStatuses}
                isLoading={usersLoading && dataLoaded}
              />
            )}
            {activeSubTab === 'discover' && (
              <DiscoverSection
                recommendedUsers={recommendedUsers}
                searchResults={searchResults}
                searchQuery={searchQuery}
                onSearch={handleSearch}
                pagination={pagination}
                currentPage={pagination}
                onPageChange={handlePageChange}
                onViewProfile={viewUserProfile}
                onFollow={handleFollow}
                onUnFollow={handleUnfollow}
                userFollowStatuses={userFollowStatuses}
                isLoading={usersLoading && dataLoaded}
              />
            )}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default ProfileSection;