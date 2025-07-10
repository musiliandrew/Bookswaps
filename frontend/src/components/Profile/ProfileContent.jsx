import { motion } from 'framer-motion';
import SimpleUserProfileCard from './SimpleUserProfileCard';
import ConnectionsSection from './UserProfile/ConnectionsSection';
import DiscoverSection from './UserProfile/DiscoverSection';

/**
 * ProfileContent - Main content area for profile sections
 * Handles rendering of different profile tabs with animations
 */
const ProfileContent = ({
  activeSubTab,
  profile,
  profileStats,
  onShareProfile,
  onEditProfile,
  onUploadPhoto,
  // Connections props
  followers,
  following,
  mutualFollowers,
  userFollowStatuses,
  isLoading,
  onViewProfile,
  onFollow,
  onUnfollow,
  onRemoveFollower,
  onShowFollowers,
  onShowFollowing,
  connectionsActiveList,
  // Discover props
  recommendedUsers,
  searchResults,
  searchQuery,
  pagination,
  onSearch,
  onPageChange
}) => {
  return (
    <div className="bookish-glass rounded-lg p-6">
      {activeSubTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SimpleUserProfileCard
            profile={profile}
            stats={profileStats}
            onShareProfile={onShareProfile}
            onEditProfile={onEditProfile}
            onUploadPhoto={onUploadPhoto}
            isMobile={window.innerWidth <= 768}
          />
        </motion.div>
      )}

      {activeSubTab === 'connections' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ConnectionsSection
            followers={followers}
            following={following}
            mutualFollowers={mutualFollowers}
            userFollowStatuses={userFollowStatuses}
            isLoading={isLoading}
            onViewProfile={onViewProfile}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            onRemoveFollower={onRemoveFollower}
            onShowFollowers={onShowFollowers}
            onShowFollowing={onShowFollowing}
            connectionsActiveList={connectionsActiveList}
          />
        </motion.div>
      )}

      {activeSubTab === 'discover' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DiscoverSection
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
          />
        </motion.div>
      )}
    </div>
  );
};

export default ProfileContent;
