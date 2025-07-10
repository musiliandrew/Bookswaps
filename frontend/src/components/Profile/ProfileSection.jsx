import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';

// Context and hooks
import { useAuth } from '../../contexts/AuthContext';
import { useProfileData } from '../../hooks/useProfileData';
import { useUserInteractions } from '../../hooks/useUserInteractions';
import { useUserStats } from '../../hooks/useUserStats';

// Components
import ProfileHeader from './ProfileHeader';
import ProfileNavigation from './ProfileNavigation';
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
    // Navigate to settings tab in ProfilePage
    setSearchParams({ tab: 'settings' });
  };

  const handleUploadPhoto = () => {
    // Navigate to settings tab in ProfilePage
    setSearchParams({ tab: 'settings' });
  };

  // Only refresh profile data if we don't have it yet (removed excessive refresh)
  // The AuthContext already handles profile fetching and caching properly

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
      // Refresh relevant data when interactions happen
      handlePageChange('followers', pagination.followers.page, true);
      handlePageChange('following', pagination.following.page, true);
    }
  });

  // Fetch real user statistics
  const { stats: userStats } = useUserStats();

  // Process stats for display using utility function
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

  // Simple sections like in settings
  const sections = [
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤'
    },
    {
      id: 'connections',
      label: 'Community',
      icon: '👥'
    },
    {
      id: 'discover',
      label: 'Discover',
      icon: '🔍'
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
    <div className="min-h-screen font-open-sans text-text">
      <div className="container mx-auto px-4 py-8">
        <ProfileHeader />



      <div className="relative z-10 pt-4">
        {selectedUser ? (
          <UserProfileView
            user={selectedUser}
            currentUserId={profile.user_id}
            followStatus={userFollowStatuses[selectedUser.user_id]}
            onBack={handleBackToMain}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            currentUserStats={userStats} // Pass current user stats to avoid redundant API calls
          />
        ) : (
          <div>


            <ProfileNavigation
              sections={sections}
              activeTab={activeSubTab}
              onTabChange={setActiveSubTab}
            />

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
          </div>
        )}

        {/* Share Profile Expandable Section - appears below the entire profile card */}
        <AnimatePresence>
          {showShareModal && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="mt-6 overflow-hidden"
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
      </div>
      </div>


    </div>
  );
};

export default ProfileSection;