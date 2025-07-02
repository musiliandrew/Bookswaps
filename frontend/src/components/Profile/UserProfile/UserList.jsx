import { motion } from 'framer-motion';

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
                action: () => onRemoveFollower && onRemoveFollower(user.user_id),
                className: 'border border-red-300 text-red-600 hover:bg-red-50 bg-white'
              });
            } else {
              // Not mutual: show "Follow Back" and "Remove"
              buttons.push({
                text: 'Follow Back',
                action: () => onFollow(user.user_id, 'Connections'),
                className: 'bg-[var(--primary)] hover:bg-[var(--accent)] text-white'
              });
              buttons.push({
                text: 'Remove',
                action: () => onRemoveFollower && onRemoveFollower(user.user_id),
                className: 'border border-red-300 text-red-600 hover:bg-red-50 bg-white'
              });
            }
          } else if (listType === 'mutual') {
            // Both follow each other: show "Unfollow" and "Remove"
            buttons.push({
              text: 'Unfollow',
              action: () => onUnfollow(user.user_id),
              className: 'bg-gray-500 hover:bg-gray-600 text-white'
            });
            buttons.push({
              text: 'Remove',
              action: () => onRemoveFollower && onRemoveFollower(user.user_id),
              className: 'border border-red-300 text-red-600 hover:bg-red-50 bg-white'
            });
          } else {
            // Search/Recommended
            if (followStatus.is_following) {
              buttons.push({
                text: 'Unfollow',
                action: () => onUnfollow(user.user_id),
                className: 'bg-gray-500 hover:bg-gray-600 text-white'
              });
            } else {
              buttons.push({
                text: 'Follow',
                action: () => onFollow(user.user_id, 'Connections'),
                className: 'bg-[var(--primary)] hover:bg-[var(--accent)] text-white'
              });
            }
          }
        }

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
              {buttons.map((btn, idx) => (
                <button
                  key={idx}
                  onClick={btn.action}
                  className={`px-3 py-1.5 rounded-lg text-xs font-['Open_Sans'] transition-colors ${btn.className}`}
                >
                  {btn.text}
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