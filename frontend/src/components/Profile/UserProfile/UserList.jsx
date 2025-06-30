import { motion } from 'framer-motion';

const UserList = ({ users, onViewProfile, onFollow, onUnfollow, onRemoveFollower, userFollowStatuses, isLoading, listType, currentUserId }) => {
  if (isLoading) {
    return <p className="text-[var(--text)] text-center">Loading...</p>;
  }
  if (!users.length) {
    return <p className="text-[var(--text)] text-center">No users found.</p>;
  }

  return (
    <div className="space-y-3">
      {users.map((user) => {
        const followStatus = userFollowStatuses[user.user_id] || { is_following: false, is_mutual: false };
        const isFollowerList = listType === 'followers';
        const isMutualList = listType === 'mutual';
        const isFollowingList = listType === 'following';
        const isOwnProfile = currentUserId === user.user_id;

        // Determine button text and styling
        const getButtonConfig = () => {
          if (isOwnProfile) {
            return null; // Don't show follow button for own profile
          }

          // Determine if user is actually following this person
          const isActuallyFollowing = followStatus.is_following || isFollowingList || isMutualList;

          if (isActuallyFollowing) {
            return {
              text: 'Following',
              action: () => onUnfollow(user.user_id),
              className: 'bg-gray-500 hover:bg-gray-600 text-white'
            };
          } else {
            // For followers list: if not following them back, show "Follow Back"
            // For discovery/search: show "Follow"
            const buttonText = isFollowerList ? 'Follow Back' : 'Follow';
            return {
              text: buttonText,
              action: () => onFollow(user.user_id, 'Connections'),
              className: 'bg-[var(--primary)] hover:bg-[var(--accent)] text-white'
            };
          }
        };

        const buttonConfig = getButtonConfig();
        
        return (
          <motion.div
            key={user.user_id}
            className="flex items-center justify-between p-3 bg-[var(--background)]/50 rounded-lg bookish-glass"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="flex items-center gap-3 flex-1 cursor-pointer"
              onClick={() => onViewProfile(user.user_id)}
            >
              <img
                src={user.profile_picture || '/default-avatar.png'}
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover border border-[var(--secondary)]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-['Open_Sans'] text-[#456A76] text-sm">{user.username}</p>
                  {followStatus.is_mutual && (
                    <span className="text-xs bg-[var(--accent)] text-[var(--primary)] px-1.5 py-0.5 rounded-full">
                      Mutual
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--secondary)]">{user.city || 'Unknown'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {(isFollowerList || isMutualList) && !isOwnProfile && onRemoveFollower && (
                <button
                  onClick={() => onRemoveFollower(user.user_id)}
                  className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-xs font-['Open_Sans'] transition-colors"
                >
                  Remove
                </button>
              )}
              {buttonConfig && (
                <button
                  onClick={buttonConfig.action}
                  className={`px-4 py-1.5 rounded-lg text-xs font-['Open_Sans'] transition-colors ${buttonConfig.className}`}
                >
                  {buttonConfig.text}
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default UserList;