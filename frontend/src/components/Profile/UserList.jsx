import { motion } from 'framer-motion';

const UserList = ({ users, onViewProfile, onFollow, onUnfollow, userFollowStatuses, isLoading }) => {
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
            <button
              onClick={() =>
                followStatus.is_following
                  ? onUnfollow(user.user_id)
                  : onFollow(user.user_id, 'Connections')
              }
              className="bookish-button-enhanced px-4 py-2 rounded-lg text-[var(--secondary)] text-xs font-['Open_Sans']"
            >
              {followStatus.is_following ? 'Unfollow' : 'Follow'}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
};

export default UserList;