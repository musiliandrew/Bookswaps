import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useAuth } from '../../hooks/useAuth';
import { useUsers } from '../../hooks/useUsers';
import UserCard from '../../components/Profile/UserCard';
import UserList from '../../components/Profile/UserList';
import ProfileSettings from '../../components/Profile/ProfileSettings';
import { UserIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, profile, isLoading: authLoading, error: authError, getProfile } = useAuth();
  const {
    getFollowers,
    getFollowing,
    followers,
    following,
    isLoading: usersLoading,
    error: usersError,
    pagination,
    getFollowStatus,
  } = useUsers();
  
  const [activeTab, setActiveTab] = useState('my-profile');
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);
  const [currentPage, setCurrentPage] = useState({ followers: 1, following: 1 });
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Use refs to track if data is being fetched to prevent duplicate calls
  const fetchingRef = useRef({
    followers: false,
    following: false,
    followStatus: false
  });

  // Debounce utility function
  const useDebounce = (callback, delay) => {
    const timeoutRef = useRef(null);
    
    return useCallback((...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
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

  const debouncedGetFollowStatus = useDebounce(async (id, otherId) => {
    if (fetchingRef.current.followStatus) return;
    fetchingRef.current.followStatus = true;
    try {
      await getFollowStatus(id, otherId);
    } finally {
      fetchingRef.current.followStatus = false;
    }
  }, 300);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    // Only call getProfile if we don't have profile data
    if (!profile) {
      getProfile();
    }
  }, [isAuthenticated, navigate, getProfile, profile]);

  // Load user data when profile is available
  useEffect(() => {
    if (profile?.id && !dataLoaded) {
      debouncedGetFollowers(profile.id, currentPage.followers);
      debouncedGetFollowing(profile.id, currentPage.following);
      debouncedGetFollowStatus(profile.id, profile.id);
      setDataLoaded(true);
    }
  }, [profile?.id, dataLoaded, currentPage.followers, currentPage.following, debouncedGetFollowers, debouncedGetFollowing, debouncedGetFollowStatus]);

  // Handle page changes
  useEffect(() => {
    if (profile?.id && dataLoaded) {
      // Only fetch if page actually changed
      if (currentPage.followers > 1 || followers.length === 0) {
        debouncedGetFollowers(profile.id, currentPage.followers);
      }
      if (currentPage.following > 1 || following.length === 0) {
        debouncedGetFollowing(profile.id, currentPage.following);
      }
    }
  }, [currentPage.followers, currentPage.following, profile?.id, dataLoaded, debouncedGetFollowers, debouncedGetFollowing, followers.length, following.length]);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: () => activeTab === 'my-profile' && setActiveTab('settings'),
    onSwipedRight: () => activeTab === 'settings' && setActiveTab('my-profile'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const tabs = [
    { id: 'my-profile', label: 'My Profile', icon: <UserIcon className="w-6 h-6" /> },
    { id: 'settings', label: 'Settings', icon: <Cog6ToothIcon className="w-6 h-6" /> },
  ];

  const handlePageChange = (type, direction) => {
    setCurrentPage((prev) => {
      const newPage = direction === 'next' ? prev[type] + 1 : prev[type] - 1;
      const maxPage = pagination[type]?.totalPages || 1;
      
      if (newPage > 0 && newPage <= maxPage) {
        return { ...prev, [type]: newPage };
      }
      return prev;
    });
  };

  const handleRetry = () => {
    setDataLoaded(false);
    fetchingRef.current = {
      followers: false,
      following: false,
      followStatus: false
    };
    
    if (!profile) {
      getProfile();
    }
    
    if (profile?.id) {
      debouncedGetFollowers(profile.id, currentPage.followers);
      debouncedGetFollowing(profile.id, currentPage.following);
      debouncedGetFollowStatus(profile.id, profile.id);
    }
  };

  if (authLoading || (usersLoading && !dataLoaded)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bookish-spinner w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError || usersError) {
    return (
      <div className="text-center p-4 text-[var(--text)]">
        <p className="mb-4">
          {authError || usersError || 'Failed to load profile data. Please try again later.'}
        </p>
        <button
          onClick={handleRetry}
          className="bookish-button-enhanced px-4 py-2 rounded-xl"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bookish-gradient p-4" {...handlers}>
      <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md bg-[var(--primary)] bookish-glass rounded-xl p-2 flex justify-around items-center z-10 shadow-lg">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${
              activeTab === tab.id
                ? 'text-[#D4A017] underline'
                : 'text-[var(--secondary)] hover:text-[var(--accent)]'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSmallScreen ? (
              tab.icon
            ) : (
              <span className="text-sm font-['Open_Sans']">{tab.label}</span>
            )}
            {!isSmallScreen && activeTab === tab.id && (
              <motion.div
                className="w-2 h-1 bg-[#D4A017] rounded-full mt-1"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
        ))}
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 'my-profile' ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTab === 'my-profile' ? -100 : 100 }}
          transition={{ duration: 0.3 }}
          className="mt-20 mb-20"
        >
          {activeTab === 'my-profile' ? (
            <MyProfileSection
              profile={profile}
              followers={followers}
              following={following}
              pagination={pagination}
              onPageChange={handlePageChange}
              currentPage={currentPage}
              isLoading={usersLoading && dataLoaded}
            />
          ) : (
            <SettingsSection />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const MyProfileSection = ({ profile, followers, following, pagination, onPageChange, currentPage, isLoading }) => {
  return (
    <motion.div
      className="bookish-glass p-6 rounded-xl max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-['Lora'] text-[var(--primary)] mb-4">My Profile</h1>
      {profile ? (
        <UserCard
          user={{
            id: profile.id,
            username: profile.username,
            avatar: profile.avatar,
            city: profile.city,
            genres: profile.genres,
            followers_count: followers.length,
          }}
          className="mb-6"
        />
      ) : (
        <p className="text-[var(--text)]">Profile data not available.</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-['Lora'] text-[var(--primary)] mb-2">
            Followers
            {isLoading && <span className="ml-2 text-sm text-[var(--secondary)]">Loading...</span>}
          </h2>
          <UserList users={followers} />
          {pagination.followers?.totalPages > 1 && (
            <div className="flex justify-between mt-4">
              <button
                onClick={() => onPageChange('followers', 'prev')}
                disabled={currentPage.followers === 1}
                className="bookish-button-enhanced px-4 py-2 rounded-xl disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-[var(--text)] font-['Open_Sans']">
                Page {currentPage.followers} of {pagination.followers.totalPages}
              </span>
              <button
                onClick={() => onPageChange('followers', 'next')}
                disabled={currentPage.followers === pagination.followers.totalPages}
                className="bookish-button-enhanced px-4 py-2 rounded-xl disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-['Lora'] text-[var(--primary)] mb-2">
            Following
            {isLoading && <span className="ml-2 text-sm text-[var(--secondary)]">Loading...</span>}
          </h2>
          <UserList users={following} />
          {pagination.following?.totalPages > 1 && (
            <div className="flex justify-between mt-4">
              <button
                onClick={() => onPageChange('following', 'prev')}
                disabled={currentPage.following === 1}
                className="bookish-button-enhanced px-4 py-2 rounded-xl disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-[var(--text)] font-['Open_Sans']">
                Page {currentPage.following} of {pagination.following.totalPages}
              </span>
              <button
                onClick={() => onPageChange('following', 'next')}
                disabled={currentPage.following === pagination.following.totalPages}
                className="bookish-button-enhanced px-4 py-2 rounded-xl disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const SettingsSection = () => {
  return (
    <motion.div
      className="bookish-glass p-6 rounded-xl max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ProfileSettings />
    </motion.div>
  );
};

export default ProfilePage;