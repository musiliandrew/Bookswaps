import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const UserProfileCard = ({ 
  user, 
  isOwnProfile, 
  followStatus, 
  onFollow, 
  onUnfollow,
  onRefreshProfile // Add this new prop
}) => {
  const [localUser, setLocalUser] = useState(user);
  const [localFollowStatus, setLocalFollowStatus] = useState(followStatus);
  const [isProcessing, setIsProcessing] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  useEffect(() => {
    setLocalFollowStatus(followStatus);
  }, [followStatus]);

  if (!localUser) return <p className="text-[var(--text)] text-center">Profile data not available.</p>;

  const handleFollow = async () => {
    if (!onFollow) return;
    
    setIsProcessing(true);
    try {
      // Optimistically update UI
      setLocalUser(prev => ({
        ...prev,
        followers_count: (prev.followers_count || 0) + 1
      }));
      setLocalFollowStatus({
        is_following: true,
        is_mutual: false
      });
      
      // Perform the actual follow action
      await onFollow();
      
      // Refresh profile data from server
      if (onRefreshProfile) {
        await onRefreshProfile();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnfollow = async () => {
    if (!onUnfollow) return;
    
    setIsProcessing(true);
    try {
      // Optimistically update UI
      setLocalUser(prev => ({
        ...prev,
        followers_count: Math.max((prev.followers_count || 1) - 1, 0)
      }));
      setLocalFollowStatus({
        is_following: false,
        is_mutual: false
      });
      
      // Perform the actual unfollow action
      await onUnfollow();
      
      // Refresh profile data from server
      if (onRefreshProfile) {
        await onRefreshProfile();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      className="bookish-glass p-4 rounded-xl mb-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <img
          src={localUser.profile_picture || '/default-avatar.png'}
          alt={localUser.username}
          className="w-24 h-24 rounded-full object-cover border-2 border-[var(--accent)]"
        />
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-['Lora'] text-[#456A76]">{localUser.username}</h2>
            {localFollowStatus?.is_mutual && !isOwnProfile && (
              <span className="text-xs bg-[var(--accent)] text-[var(--primary)] px-1.5 py-0.5 rounded-full">
                Mutual
              </span>
            )}
          </div>
          <p className="text-[var(--text)] font-['Open_Sans'] text-sm">
            {localUser.city}, {localUser.country}
          </p>
          <p className="text-[var(--text)] font-['Open_Sans'] text-sm mt-1">
            {localUser.about_you || 'No bio yet.'}
          </p>
          <div className="flex flex-wrap gap-1 mt-1 justify-center sm:justify-start">
            {localUser.genres?.map((genre) => (
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
              <span className="font-bold">{localUser.followers_count || 0}</span> Followers
            </p>
            <p className="text-[var(--text)] font-['Open_Sans'] text-sm">
              <span className="font-bold">{localUser.following_count || 0}</span> Following
            </p>
          </div>
          {!isOwnProfile && (
            <div className="mt-3">
              {localFollowStatus?.is_following ? (
                <button
                  onClick={handleUnfollow}
                  disabled={isProcessing}
                  className="bookish-button-enhanced px-4 py-2 rounded-lg text-[var(--text)] text-sm"
                >
                  {isProcessing ? 'Processing...' : 'Unfollow'}
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={isProcessing}
                  className="bookish-button-enhanced px-4 py-2 rounded-lg text-[var(--text)] text-sm"
                >
                  {isProcessing ? 'Processing...' : 'Follow'}
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