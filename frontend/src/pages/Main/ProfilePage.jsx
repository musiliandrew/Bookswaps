import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useAuth } from '../../hooks/useAuth';
import { useUsers } from '../../hooks/useUsers';
import UserCard from '../../components/Profile/UserCard';
import ProfileSettings from '../../components/Profile/ProfileSettings';
import { UserIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

// Placeholder for icons (replace with asset paths once CSS confirms)
const MyProfileIcon = () => <UserIcon className="w-6 h-6" />;
const SettingsIcon = () => <Cog6ToothIcon className="w-6 h-6" />;

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

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    getProfile();
  }, [isAuthenticated, navigate, getProfile]);

  useEffect(() => {
    if (profile?.id) {
      getFollowers(profile.id, currentPage.followers);
      getFollowing(profile.id, currentPage.following);
      getFollowStatus(profile.id, profile.id); // Ensure follow status is set
    }
  }, [profile?.id, getFollowers, getFollowing, getFollowStatus, currentPage.followers, currentPage.following]);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => activeTab === 'my-profile' && setActiveTab('settings'),
    onSwipedRight: () => activeTab === 'settings' && setActiveTab('my-profile'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const tabs = [
    { id: 'my-profile', label: 'My Profile', icon: <MyProfileIcon /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  const handlePageChange = (type, direction) => {
    setCurrentPage((prev) => {
      const newPage = direction === 'next'
        ? prev[type] + 1
        : prev[type] - 1;
      if (newPage > 0 && newPage <= pagination[type].totalPages) {
        if (type === 'followers') getFollowers(profile.id, newPage);
        else getFollowing(profile.id, newPage);
        return { ...prev, [type]: newPage };
      }
      return prev;
    });
  };

  if (authLoading || usersLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bookish-spinner w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError || usersError) {
    return (
      <div className="text-center p-4 text-[var(--text)]">
        {authError || usersError || 'Failed to load profile data. Please try again later.'}
        <button
          onClick={() => { getProfile(); if (profile?.id) { getFollowers(profile.id); getFollowing(profile.id); } }}
          className="bookish-button-enhanced mt-4 px-4 py-2 rounded-xl"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bookish-gradient p-4" {...handlers}>
      {/* Bottom Navbar */}
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

      {/* Content */}
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
            />
          ) : (
            <SettingsSection />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// MyProfileSection Component
const MyProfileSection = ({ profile, followers, following, pagination, onPageChange, currentPage }) => {
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
          <h2 className="text-xl font-['Lora'] text-[var(--primary)] mb-2">Followers</h2>
          <UserList users={followers} />
          {pagination.followers.totalPages > 1 && (
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
          <h2 className="text-xl font-['Lora'] text-[var(--primary)] mb-2">Following</h2>
          <UserList users={following} />
          {pagination.following.totalPages > 1 && (
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

// SettingsSection Component
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