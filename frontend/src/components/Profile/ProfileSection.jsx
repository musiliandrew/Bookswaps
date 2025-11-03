import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { UserIcon, UsersIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { UserIcon as UserSolidIcon, UsersIcon as UsersSolidIcon, MagnifyingGlassIcon as MagnifyingGlassSolidIcon } from '@heroicons/react/24/solid';

// Context and hooks
import { useAuth } from '../../contexts/AuthContext';
import { useProfileData } from '../../hooks/useProfileData';
import { useUserInteractions } from '../../hooks/useUserInteractions';
import { useUserStats } from '../../hooks/useUserStats';

// Components
import ProfileContent from './ProfileContent';
import UserProfileView from './UserProfileView';
import ShareableProfileCard from './ShareableProfileCard';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorDisplay from '../Common/ErrorDisplay';

// Utils
import { processProfileStats } from '../../utils/profileStatsProcessor';

const ProfileSection = () => {
  const { profile } = useAuth();
  const [, setSearchParams] = useSearchParams();
  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [connectionsActiveList, setConnectionsActiveList] = useState('followers');

  // Navigation handlers
  const handleEditProfile = () => {
    setSearchParams({ tab: 'settings' });
  };

  const handleUploadPhoto = () => {
    setSearchParams({ tab: 'settings' });
  };

  // Custom hook for managing profile data and pagination
  const {
    followers,
    following,
    mutualFollowers,
    recommendedUsers,
    searchResults,
    searchQuery,
    pagination,
    isLoading,
    error,
    handleSearch,
    handlePageChange,
    retryLoad,
  } = useProfileData(profile?.user_id && typeof profile.user_id === 'string' ? profile.user_id : null);

  // Custom hook for user interactions (follow/unfollow)
  const {
    userFollowStatuses,
    handleFollow,
    handleUnfollow,
    handleRemoveFollower,
    viewUserProfile,
  } = useUserInteractions(profile?.user_id && typeof profile.user_id === 'string' ? profile.user_id : null, {
    onDataChange: () => {
      handlePageChange('followers', pagination.followers.page, true);
      handlePageChange('following', pagination.following.page, true);
    }
  });

  // Fetch real user statistics
  const { stats: userStats } = useUserStats();

  // Process stats for display
  const profileStats = processProfileStats(userStats, profile);

  // Handle viewing another user's profile
  const handleViewUserProfile = useCallback(async (userId) => {
    const userProfile = await viewUserProfile(userId);
    if (userProfile) {
      setSelectedUser(userProfile);
    }
  }, [viewUserProfile]);

  // Handle going back from user profile view
  const handleBackToMain = useCallback(() => {
    setSelectedUser(null);
  }, []);

  // Handle showing followers list
  const handleShowFollowers = useCallback(() => {
    setConnectionsActiveList('followers');
    setActiveSubTab('connections');
  }, []);

  // Handle showing following list
  const handleShowFollowing = useCallback(() => {
    setConnectionsActiveList('following');
    setActiveSubTab('connections');
  }, []);

  // Sub-navigation sections
  const sections = [
    {
      id: 'profile',
      label: 'Profile',
      icon: UserIcon,
      iconSolid: UserSolidIcon
    },
    {
      id: 'connections',
      label: 'Community',
      icon: UsersIcon,
      iconSolid: UsersSolidIcon
    },
    {
      id: 'discover',
      label: 'Discover',
      icon: MagnifyingGlassIcon,
      iconSolid: MagnifyingGlassSolidIcon
    },
  ];

  // Loading state
  if (!profile) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  // Error state
  if (error) {
    return (
      <ErrorDisplay
        message={error || 'Failed to load profile data.'}
        onRetry={retryLoad}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Page Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--primary-600)' }}>
          My Profile
        </h1>
        <p className="text-sm md:text-base" style={{ color: 'var(--neutral-600)' }}>
          Your reading journey, connections, and literary adventures
        </p>
      </motion.div>

      {selectedUser ? (
        <UserProfileView
          user={selectedUser}
          currentUserId={profile.user_id}
          followStatus={userFollowStatuses[selectedUser.user_id]}
          onBack={handleBackToMain}
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
          currentUserStats={userStats}
        />
      ) : (
        <>
          {/* Sub-Tab Navigation */}
          <motion.nav
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex gap-2 p-1 rounded-xl" style={{ backgroundColor: 'var(--neutral-100)' }}>
              {sections.map((section) => {
                const isActive = activeSubTab === section.id;
                const Icon = isActive ? section.iconSolid : section.icon;

                return (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSubTab(section.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all`}
                    style={{
                      backgroundColor: isActive ? 'white' : 'transparent',
                      color: isActive ? 'var(--primary-600)' : 'var(--neutral-600)',
                      boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{section.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.nav>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ProfileContent
              activeSubTab={activeSubTab}
              profile={profile}
              profileStats={profileStats}
              onShareProfile={() => setShowShareModal(true)}
              onEditProfile={handleEditProfile}
              onUploadPhoto={handleUploadPhoto}
              // Connections props
              followers={followers}
              following={following}
              mutualFollowers={mutualFollowers}
              userFollowStatuses={userFollowStatuses}
              isLoading={isLoading}
              onViewProfile={handleViewUserProfile}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
              onRemoveFollower={handleRemoveFollower}
              onShowFollowers={handleShowFollowers}
              onShowFollowing={handleShowFollowing}
              connectionsActiveList={connectionsActiveList}
              // Discover props
              recommendedUsers={recommendedUsers}
              searchResults={searchResults}
              searchQuery={searchQuery}
              pagination={pagination}
              onSearch={handleSearch}
              onPageChange={handlePageChange}
            />
          </motion.div>

          {/* Share Profile Modal */}
          <AnimatePresence>
            {showShareModal && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
              >
                <ShareableProfileCard
                  user={profile}
                  stats={profileStats}
                  onClose={() => setShowShareModal(false)}
                  isInline={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default ProfileSection;
