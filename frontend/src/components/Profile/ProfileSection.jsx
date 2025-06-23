import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useProfileData } from '../../hooks/useProfileData';
import { useUserInteractions } from '../../hooks/useUserInteractions';
import UserProfileCard from '../Profile/UserProfile/UserProfileCard';
import ConnectionsSection from '../Profile/UserProfile/ConnectionsSection';
import DiscoverSection from '../Profile/UserProfile/DiscoverSection';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorDisplay from '../Common/ErrorDisplay';

const ProfileSection = () => {
  const { profile } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [selectedUser, setSelectedUser] = useState(null);

  // Custom hook for managing profile data and pagination
  const {
    publicProfile,
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
  } = useProfileData(profile?.user_id);

  // Custom hook for user interactions (follow/unfollow)
  const {
    userFollowStatuses,
    handleFollow,
    handleUnfollow,
    handleRemoveFollower,
    viewUserProfile,
  } = useUserInteractions(profile?.user_id, {
    onDataChange: () => {
      // Refresh relevant data when interactions happen
      handlePageChange('followers', pagination.followers.page, true);
      handlePageChange('following', pagination.following.page, true);
    }
  });

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

  // Tab configuration
  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'connections', label: 'Connections' },
    { id: 'discover', label: 'Discover' },
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
    <div className="pt-4">
      {selectedUser ? (
        <UserProfileView
          user={selectedUser}
          currentUserId={profile.user_id}
          followStatus={userFollowStatuses[selectedUser.user_id]}
          onBack={handleBackToMain}
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
        />
      ) : (
        <MainProfileView
          activeTab={activeSubTab}
          tabs={tabs}
          onTabChange={setActiveSubTab}
          profile={profile}
          publicProfile={publicProfile}
          followers={followers}
          following={following}
          mutualFollowers={mutualFollowers}
          recommendedUsers={recommendedUsers}
          searchResults={searchResults}
          searchQuery={searchQuery}
          pagination={pagination}
          userFollowStatuses={userFollowStatuses}
          isLoading={isLoading}
          onSearch={handleSearch}
          onPageChange={handlePageChange}
          onViewProfile={handleViewUserProfile}
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
          onRemoveFollower={handleRemoveFollower}
        />
      )}
    </div>
  );
};

// Separate component for user profile view
const UserProfileView = ({ 
  user, 
  currentUserId, 
  followStatus, 
  onBack, 
  onFollow, 
  onUnfollow 
}) => (
  <motion.div
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    className="px-4 mb-4 rounded-xl"
  >
    <button
      onClick={onBack}
      className="flex items-center justify-center py-2 mb-2 text-sm text-[var(--accent)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded"
      aria-label="Go back to main profile view"
    >
      <span className="mr-2" aria-hidden="true">←</span> 
      Back
    </button>
    <UserProfileCard
      user={user}
      isOwnProfile={user.user_id === currentUserId}
      followStatus={followStatus || {}}
      onFollow={() => onFollow(user.user_id, 'Profile')}
      onUnFollow={() => onUnfollow(user.user_id)}
      onRefreshProfile={() => {}} // Handled by the hook
    />
  </motion.div>
);

// Separate component for main profile view with tabs
const MainProfileView = ({
  activeTab,
  tabs,
  onTabChange,
  profile,
  publicProfile,
  followers,
  following,
  mutualFollowers,
  recommendedUsers,
  searchResults,
  searchQuery,
  pagination,
  userFollowStatuses,
  isLoading,
  onSearch,
  onPageChange,
  onViewProfile,
  onFollow,
  onUnfollow,
  onRemoveFollower,
}) => (
  <>
    <TabNavigation 
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
    />
    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <TabContent
        activeTab={activeTab}
        profile={profile}
        publicProfile={publicProfile}
        followers={followers}
        following={following}
        mutualFollowers={mutualFollowers}
        recommendedUsers={recommendedUsers}
        searchResults={searchResults}
        searchQuery={searchQuery}
        pagination={pagination}
        userFollowStatuses={userFollowStatuses}
        isLoading={isLoading}
        onSearch={onSearch}
        onPageChange={onPageChange}
        onViewProfile={onViewProfile}
        onFollow={onFollow}
        onUnfollow={onUnfollow}
        onRemoveFollower={onRemoveFollower}
      />
    </motion.div>
  </>
);

// Tab navigation component
const TabNavigation = ({ tabs, activeTab, onTabChange }) => (
  <nav 
    className="flex mb-4 gap-2 border-b border-[var(--secondary)] pb-2 py-2"
    role="tablist"
    aria-label="Profile sections"
  >
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={`px-2 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
          activeTab === tab.id
            ? 'text-[var(--accent)] bg-[var(--accent)]/10'
            : 'text-[#456A76] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5'
        }`}
        role="tab"
        aria-selected={activeTab === tab.id}
        aria-controls={`tabpanel-${tab.id}`}
      >
        {tab.label}
      </button>
    ))}
  </nav>
);

// Tab content component
const TabContent = ({
  activeTab,
  profile,
  publicProfile,
  followers,
  following,
  mutualFollowers,
  recommendedUsers,
  searchResults,
  searchQuery,
  pagination,
  userFollowStatuses,
  isLoading,
  onSearch,
  onPageChange,
  onViewProfile,
  onFollow,
  onUnfollow,
  onRemoveFollower,
}) => {
  switch (activeTab) {
    case 'profile':
      return (
        <div role="tabpanel" id="tabpanel-profile" aria-labelledby="tab-profile">
          <UserProfileCard
            user={publicProfile}
            isOwnProfile={true}
            followStatus={userFollowStatuses[profile?.user_id] || {}}
            onFollow={() => {}}
            onUnFollow={() => {}}
            onViewProfile={() => {}}
          />
        </div>
      );
    
    case 'connections':
      return (
        <div role="tabpanel" id="tabpanel-connections" aria-labelledby="tab-connections">
          <ConnectionsSection
            followers={followers}
            following={following}
            mutualFollowers={mutualFollowers}
            pagination={pagination}
            currentPage={pagination}
            onPageChange={onPageChange}
            onViewProfile={onViewProfile}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            onRemoveFollower={onRemoveFollower}
            userFollowStatuses={userFollowStatuses}
            isLoading={isLoading}
          />
        </div>
      );
    
    case 'discover':
      return (
        <div role="tabpanel" id="tabpanel-discover" aria-labelledby="tab-discover">
          <DiscoverSection
            recommendedUsers={recommendedUsers}
            searchResults={searchResults}
            searchQuery={searchQuery}
            onSearch={onSearch}
            pagination={pagination}
            currentPage={pagination}
            onPageChange={onPageChange}
            onViewProfile={onViewProfile}
            onFollow={onFollow}
            onUnFollow={onUnfollow}
            userFollowStatuses={userFollowStatuses}
            isLoading={isLoading}
          />
        </div>
      );
    
    default:
      return null;
  }
};

export default ProfileSection;