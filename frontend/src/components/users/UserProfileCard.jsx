import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import { UserIcon } from '@heroicons/react/24/outline';

function UserProfileCard({ user, onShowFollowers, onShowFollowing, className = '' }) {
  const navigate = useNavigate();
  const { getFollowStatus, followUser, unfollowUser, isAuthenticated, followStatus, isLoading } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user.id) {
      getFollowStatus(user.id).catch(() => setError('Failed to load follow status.'));
    }
  }, [user.id, isAuthenticated, getFollowStatus]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      if (followStatus?.is_following) {
        await unfollowUser(user.id);
      } else {
        await followUser(user.id);
      }
    } catch {
      setError('Failed to update follow status.');
    }
  };

  return (
    <motion.div
      className={`bookish-glass bookish-shadow p-8 rounded-2xl ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
    >
      {/* Avatar and Username */}
      <div className="flex items-center space-x-4">
        <motion.div
          className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#FF6F61]"
          whileHover={{ scale: 1.05 }}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={`${user.username}'s avatar`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#F5E8C7] flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-[#333]" />
            </div>
          )}
        </motion.div>
        <h3 className="text-xl font-['Playfair_Display'] text-[#FF6F61]">
          {user.username}
        </h3>
      </div>

      {/* Bio */}
      <p className="mt-4 text-sm text-[#333] font-['Poppins']">
        {user.bio || 'No bio provided'}
      </p>

      {/* City */}
      <p className="mt-2 text-sm text-[#333] font-['Poppins']">
        City: {user.city || 'Not set'}
      </p>

      {/* Genres */}
      <div className="mt-4">
        <label className="block text-sm font-['Poppins'] text-[#333]">
          Favorite Genres
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {user.genres?.length ? (
            user.genres.map((genre) => (
              <motion.span
                key={genre}
                className="genre-tag bg-[#FF6F61] text-white px-2 py-1 rounded-full text-sm font-['Caveat']"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {genre}
              </motion.span>
            ))
          ) : (
            <p className="text-sm text-[#333] font-['Poppins']">No genres selected</p>
          )}
        </div>
      </div>

      {/* Location Features */}
      <p className="mt-2 text-sm text-[#333] font-['Poppins']">
        Location Features: {user.chat_preferences?.location_enabled ? 'Enabled' : 'Disabled'}
      </p>

      {/* Followers/Following */}
      <div className="mt-4 flex space-x-4">
        <motion.button
          onClick={() => onShowFollowers(user.id)}
          className="text-[#333] hover:text-[#FFA726] font-['Poppins'] text-sm transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Show ${user.username}'s followers`}
        >
          Followers: {user.followers_count || 0}
        </motion.button>
        <motion.button
          onClick={() => onShowFollowing(user.id)}
          className="text-[#333] hover:text-[#FFA726] font-['Poppins'] text-sm transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Show ${user.username}'s following`}
        >
          Following: {user.following_count || 0}
        </motion.button>
      </div>

      {/* Error */}
      {error && (
        <motion.p
          className="mt-4 text-[#D32F2F] text-sm font-['Poppins']"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.p>
      )}

      {/* Follow Button */}
      <motion.div
        className="mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Button
          type="button"
          text={
            isLoading
              ? 'Processing...'
              : followStatus?.is_following
              ? 'Unfollow'
              : 'Follow'
          }
          onClick={handleFollowToggle}
          disabled={isLoading}
          className={`w-full bookish-button-enhanced ${
            followStatus?.is_following
              ? 'bg-[#D32F2F] text-white'
              : 'bg-[#FF6F61] text-white'
          }`}
          aria-label={followStatus?.is_following ? `Unfollow ${user.username}` : `Follow ${user.username}`}
        />
      </motion.div>
    </motion.div>
  );
}

export default UserProfileCard;