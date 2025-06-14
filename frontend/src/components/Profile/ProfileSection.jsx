import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useUsers } from '../../hooks/useUsers';
import UserProfileCard from './UserProfileCard';
import ConnectionsSection from './ConnectionsSection';
import DiscoverSection from './DiscoverSection';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const ProfileSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated, profile, isLoading: authLoading, error: authError, getProfile } = useAuth();
  const {
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
    isLoading: usersLoading,
    error: usersError,
    pagination,
  } = useUsers();

  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState({
    followers: 1,
    following: 1,
    search: 1,
    recommended: 1,
    mutual: 1,
  });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFollowStatuses, setUserFollowStatuses] = useState({});
  const [mutualFollowers, setMutualFollowers] = useState([]);
  const [localPagination, setLocalPagination] = useState({});
  const searchRef = useRef(null);
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
    return useCallback((...args) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    }, [callback, delay]);
  };

  // Debounced API calls
  const debouncedGetFollowers = useDebounce(async (id, page) => {
    if (fetchingRef.current.followers) return;
    fetchingRef.current.followers = true;
    try {
      await getFollowers(id, page);
    } finally {
      fetchingRef.current.followers = false;
    }
  }, 300);

  const debouncedGetFollowing = useDebounce(async (id, page) => {
    if (fetchingRef.current.following) return;
    fetchingRef.current.following = true;
    try {
      await getFollowing(id, page);
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
      const mutuals = followersData.results.filter((follower) =>
        followingData.results.some((followed) => followed.user_id === follower.user_id),
      );
      setMutualFollowers(mutuals);
      setLocalPagination((prev) => ({
        ...prev,
        mutual: {
          next: followersData.next,
          previous: followersData.previous,
          page,
          totalPages: Math.ceil(followersData.count / (followersData.results?.length || 1)),
        },
      }));
    } finally {
      fetchingRef.current.mutual = false;
    }
  }, 300);

  const debouncedGetRecommendedUsers = useDebounce(async (page) => {
    if (fetchingRef.current.recommended) return;
    fetchingRef.current.recommended = true;
    try {
      await getRecommendedUsers(page);
    } finally {
      fetchingRef.current.recommended = false;
    }
  }, 300);

  const debouncedSearchUsers = useDebounce(async (query, page) => {
    if (fetchingRef.current.search) return;
    fetchingRef.current.search = true;
    try {
      await searchUsers({ query }, page);
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
      return;
    }
    if (!profile) {
      getProfile();
    }
  }, [isAuthenticated, navigate, getProfile, profile]);

  // Load initial data
  useEffect(() => {
    if (profile?.user_id && !dataLoaded) {
      getUserProfile(profile.user_id);
      debouncedGetFollowers(profile.user_id, currentPage.followers);
      debouncedGetFollowing(profile.user_id, currentPage.following);
      debouncedGetMutualFollowers(profile.user_id, currentPage.mutual);
      debouncedGetRecommendedUsers(currentPage.recommended);
      setDataLoaded(true);
    }
  }, [
    profile?.user_id,
    dataLoaded,
    currentPage,
    getUserProfile,
    debouncedGetFollowers,
    debouncedGetFollowing,
    debouncedGetMutualFollowers,
    debouncedGetRecommendedUsers,
  ]);

  // Fetch follow status for listed users
  useEffect(() => {
    if (profile?.user_id && dataLoaded) {
      const userIds = [...followers, ...following, ...mutualFollowers].map((user) => user.user_id);
      userIds.forEach((userId) => {
        if (!userFollowStatuses[userId]) {
          debouncedGetFollowStatus(profile.user_id, userId);
        }
      });
    }
  }, [profile?.user_id, followers, following, mutualFollowers, dataLoaded, debouncedGetFollowStatus, userFollowStatuses]);

  // Handle page changes
  const handlePageChange = (type, page) => {
    setCurrentPage((prev) => {
      const maxPage = (localPagination[type] || pagination[type])?.totalPages || 1;
      if (page > 0 && page <= maxPage) {
        return { ...prev, [type]: page };
      }
      return prev;
    });
    if (type === 'followers') debouncedGetFollowers(profile.user_id, page);
    if (type === 'following') debouncedGetFollowing(profile.user_id, page);
    if (type === 'mutual') debouncedGetMutualFollowers(profile.user_id, page);
    if (type === 'recommended') debouncedGetRecommendedUsers(page);
    if (type === 'search') debouncedSearchUsers(searchQuery, page);
  };

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage((prev) => ({ ...prev, search: 1 }));
    if (query.trim()) {
      debouncedSearchUsers(query, 1);
    }
  };
  // Handle follow/unfollow
  const handleFollow = async (userId, source = 'Search') => {
    const result = await followUser(userId, source);
    if (result) {
      debouncedGetFollowers(profile.user_id, currentPage.followers);
      debouncedGetFollowing(profile.user_id, currentPage.following);
      debouncedGetMutualFollowers(profile.user_id, currentPage.mutual);
      debouncedGetRecommendedUsers(currentPage.recommended);
      if (searchQuery) debouncedSearchUsers(searchQuery, currentPage.search);
      setUserFollowStatuses((prev) => ({
        ...prev,
        [userId]: { is_following: true, is_mutual: result.is_mutual },
      }));
      toast.success('Followed user!');
    }
  };

  const handleUnfollow = async (userId) => {
    const result = await unfollowUser(userId);
    if (result) {
      debouncedGetFollowers(profile.user_id, currentPage.followers);
      debouncedGetFollowing(profile.user_id, currentPage.following);
      debouncedGetMutualFollowers(profile.user_id, currentPage.mutual);
      debouncedGetRecommendedUsers(currentPage.recommended);
      if (searchQuery) debouncedSearchUsers(searchQuery, currentPage.search);
      setUserFollowStatuses((prev) => ({
        ...prev,
        [userId]: { is_following: false, is_mutual: false },
      }));
      toast.success('Unfollowed user!');
    }
  };

  // View other user's profile
  const viewUserProfile = async (userId) => {
    const userProfile = await getUserProfile(userId);
    if (userProfile) {
      await debouncedGetFollowStatus(profile.user_id, userId);
      debouncedGetFollowStatus(profile.user_id, userId);
      setSelectedUser(userProfile);
    }
  };
  if (authLoading || (usersLoading && !dataLoaded)) {
    return (
      <div className="flex justify-center items-center h-screen bg-bookish-gradient">
        <div className="bookish-spinner w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError || usersError) {
    return (
      <div className="text-center p-4 text-[var(--text)] bg-bookish-gradient h-screen">
        <p className="mb-4">{authError || usersError || 'Failed to load profile data.'}</p>
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
            getProfile();
          }}
          className="bookish-button-enhanced px-4 py-2 rounded-xl text-[var(--secondary)]"
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
          exit={{ opacity: 0, x: -100 }}
          className="bookish-glass p-4 rounded-xl mb-6"
        >
          <button
            onClick={() => setSelectedUser(null)}
            className="flex items-center text-[var(--accent)] mb-4 hover:underline text-sm"
          >
            <span className="mr-2">←</span> Back
          </button>
          <UserProfileCard
            user={selectedUser}
            isOwnProfile={selectedUser.user_id === profile.user_id}
            followStatus={userFollowStatuses[selectedUser.user_id] || { is_following: false, is_mutual: false }}
            onFollow={() => handleFollow(selectedUser.user_id, 'Profile')}
            onUnfollow={() => handleUnfollow(selectedUser.user_id)}
            onViewProfile={() => {}}
          />
        </motion.div>
      ) : (
        <>
          <div className="relative w-full max-w-md mx-auto mb-4">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#456A76]" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search book readers..."
              className="bookish-input w-full pl-10 pr-4 py-2 rounded-xl text-[var(--text)] text-sm focus:outline-none"
            />
          </div>
          <nav className="flex space-x-2 mb-4 border-b border-[var(--secondary)]/20">
            {[
              { id: 'profile', label: 'Profile' },
              { id: 'connections', label: 'Connections' },
              { id: 'discover', label: 'Discover' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center px-3 py-1.5 font-['Open_Sans'] text-sm ${
                  activeSubTab === tab.id
                    ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                    : 'text-[#456A76] hover:text-[var(--accent)]'
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
                followStatus={userFollowStatuses[profile?.user_id] || { is_following: false, is_mutual: false }}
                onFollow={() => {}}
                onUnfollow={() => {}}
                onViewProfile={() => {}}
              />
            )}
            {activeSubTab === 'connections' && (
              <ConnectionsSection
                followers={followers}
                following={following}
                mutualFollowers={mutualFollowers}
                pagination={{ ...pagination, ...localPagination }}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onViewProfile={viewUserProfile}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
                userFollowStatuses={userFollowStatuses}
                isLoading={usersLoading && dataLoaded}
              />
            )}
            {activeSubTab === 'discover' && (
              <DiscoverSection
                recommendedUsers={recommendedUsers}
                searchResults={searchResults}
                searchQuery={searchQuery}
                pagination={pagination}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onViewProfile={viewUserProfile}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
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