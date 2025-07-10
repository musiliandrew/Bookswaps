import { motion } from 'framer-motion';
import UserProfileCard from './UserProfile/UserProfileCard';

/**
 * UserProfileView - Component for displaying another user's profile
 * Features back navigation and profile card display
 */
const UserProfileView = ({
  user,
  currentUserId,
  followStatus,
  onBack,
  onFollow,
  onUnfollow,
  currentUserStats = null // Add stats prop to avoid redundant API calls
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
      stats={user.user_id === currentUserId ? currentUserStats : null} // Pass stats for current user to avoid redundant API calls
    />
  </motion.div>
);

export default UserProfileView;
