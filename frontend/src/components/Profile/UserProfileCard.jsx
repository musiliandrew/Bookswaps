import { motion } from 'framer-motion';

const UserProfileCard = ({ user, isOwnProfile, followStatus, onFollow, onUnfollow }) => {
  if (!user) return <p className="text-[var(--text)] text-center">Profile data not available.</p>;

  return (
    <motion.div
      className="bookish-glass p-4 rounded-xl mb-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <img
          src={user.profile_picture || '/default-avatar.png'}
          alt={user.username}
          className="w-24 h-24 rounded-full object-cover border-2 border-[var(--accent)]"
        />
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-['Lora'] text-[#456A76]">{user.username}</h2>
            {followStatus?.is_mutual && !isOwnProfile && (
              <span className="text-xs bg-[var(--accent)] text-[var(--primary)] px-1.5 py-0.5 rounded-full">
                Mutual
              </span>
            )}
          </div>
          <p className="text-[var(--text)] font-['Open_Sans'] text-sm">
            {user.city}, {user.country}
          </p>
          <p className="text-[var(--text)] font-['Open_Sans'] text-sm mt-1">
            {user.about_you || 'No bio yet.'}
          </p>
          <div className="flex flex-wrap gap-1 mt-1 justify-center sm:justify-start">
            {user.genres?.map((genre) => (
              <span
                key={genre}
                className="genre-tag px-2 py-0.5 rounded-full text-[var(--secondary)] text-xs"
              >
                {genre}
              </span>
            ))}
          </div>
          <div className="mt-2 flex gap-3 justify-center sm:justify-start">
            <p className="text-[var(--text)] font-['Open_Sans'] text-sm">
              <span className="font-bold">{user.followers_count || 0}</span> Followers
            </p>
            <p className="text-[var(--text)] font-['Open_Sans'] text-sm">
              <span className="font-bold">{user.following_count || 0}</span> Following
            </p>
          </div>
          {!isOwnProfile && (
            <div className="mt-3">
              {followStatus?.is_following ? (
                <button
                  onClick={onUnfollow}
                  className="bookish-button-enhanced px-4 py-2 rounded-lg text-[var(--text)] text-sm"
                >
                  Unfollow
                </button>
              ) : (
                <button
                  onClick={onFollow}
                  className="bookish-button-enhanced px-4 py-2 rounded-lg text-[var(--text)] text-sm"
                >
                  Follow
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfileCard;