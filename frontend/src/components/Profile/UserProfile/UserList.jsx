import { motion } from 'framer-motion';
import { getProfilePictureUrl } from '../../../utils/imageUtils';

const UserList = ({
  users,
  onViewProfile,
  onFollow,
  onUnfollow,
  onRemoveFollower,
  userFollowStatuses,
  isLoading,
  listType,
  currentUserId
}) => {
  if (isLoading) return <p className="text-[var(--text)] text-center">Loading...</p>;
  if (!users.length) return <p className="text-[var(--text)] text-center">No users found.</p>;

  return (
    <div className="space-y-3">
      {users.map((user) => {
        const followStatus = userFollowStatuses[user.user_id] || { is_following: false, is_mutual: false, is_follower: false };
        const isOwnProfile = currentUserId === user.user_id;

        // Button logic
        let buttons = [];
        if (!isOwnProfile) {
          if (listType === 'following') {
            // You follow them
            buttons.push({
              text: 'Unfollow',
              action: () => onUnfollow(user.user_id),
              className: 'bg-gray-500 hover:bg-gray-600 text-white'
            });
          } else if (listType === 'followers') {
            // They follow you
            if (followStatus.is_mutual) {
              // Mutual: show "Mutual" badge and "Remove"
              buttons.push({
                text: 'Remove',
                shortText: 'Remove',
                action: () => onRemoveFollower && onRemoveFollower(user.user_id),
                className: 'border border-red-300 text-red-600 hover:bg-red-50 bg-[var(--bg-card)]'
              });
            } else {
              // Not mutual: show "Follow Back" and "Remove"
              buttons.push({
                text: 'Follow Back',
                shortText: 'Follow',
                action: () => onFollow(user.user_id, 'Connections'),
                className: 'bg-[var(--primary)] hover:bg-[var(--accent)] text-white'
              });
              buttons.push({
                text: 'Remove',
                shortText: 'Remove',
                action: () => onRemoveFollower && onRemoveFollower(user.user_id),
                className: 'border border-red-300 text-red-600 hover:bg-red-50 bg-[var(--bg-card)]'
              });
            }
          } else if (listType === 'mutual') {
            // Both follow each other: show "Unfollow" and "Remove"
            buttons.push({
              text: 'Unfollow',
              shortText: 'Unfollow',
              action: () => onUnfollow(user.user_id),
              className: 'bg-gray-500 hover:bg-gray-600 text-white'
            });
            buttons.push({
              text: 'Remove',
              shortText: 'Remove',
              action: () => onRemoveFollower && onRemoveFollower(user.user_id),
              className: 'border border-red-300 text-red-600 hover:bg-red-50 bg-[var(--bg-card)]'
            });
          } else {
            // Search/Recommended
            if (followStatus.is_following) {
              buttons.push({
                text: 'Unfollow',
                shortText: 'Unfollow',
                action: () => onUnfollow(user.user_id),
                className: 'bg-gray-500 hover:bg-gray-600 text-white'
              });
            } else {
              buttons.push({
                text: 'Follow',
                shortText: 'Follow',
                action: () => onFollow(user.user_id, 'Connections'),
                className: 'bg-[var(--primary)] hover:bg-[var(--accent)] text-white'
              });
            }
          }
        }

        return (
          <motion.div
            key={user.user_id}
            className="flex items-center justify-between p-2 sm:p-3 rounded-lg card"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="flex items-center gap-2 sm:gap-3 flex-1 cursor-pointer"
              onClick={() => onViewProfile(user.user_id)}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-[var(--secondary)]">
                {getProfilePictureUrl(user, 'S') ? (
                  <img
                    src={getProfilePictureUrl(user, 'S')}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.username?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
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
            <div className="flex gap-1 sm:gap-2">
              {buttons.map((btn, idx) => (
                <button
                  key={idx}
                  onClick={btn.action}
                  className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-['Open_Sans'] transition-colors ${btn.className}`}
                >
                  <span className="hidden sm:inline">{btn.text}</span>
                  <span className="sm:hidden">{btn.shortText || btn.text}</span>
                </button>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default UserList;