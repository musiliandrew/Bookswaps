import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const FollowButton = ({ userId, className = '' }) => {
  const { isAuthenticated, profile, followUser, unfollowUser, getFollowStatus, followStatus, isLoading } = useAuth();
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && userId && userId !== profile?.id) {
      getFollowStatus(userId);
    }
  }, [isAuthenticated, userId, profile?.id, getFollowStatus]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to follow/unfollow');
      navigate('/login');
      return;
    }
    if (userId === profile?.id) {
      toast.warning('You cannot follow yourself');
      return;
    }

    setIsFollowLoading(true);
    try {
      if (followStatus?.is_following) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
    } catch {
      toast.error('Failed to update follow status');
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleFollowToggle}
      disabled={isFollowLoading || isLoading || userId === profile?.id}
      className={`bookish-button-enhanced px-4 py-2 rounded-xl font-['Lora'] text-white ${
        followStatus?.is_following ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
      } ${isFollowLoading || isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      whileHover={{ scale: isFollowLoading || isLoading ? 1 : 1.05 }}
      whileTap={{ scale: isFollowLoading || isLoading ? 1 : 0.95 }}
      aria-label={followStatus?.is_following ? 'Unfollow user' : 'Follow user'}
    >
      {isFollowLoading || isLoading ? 'Processing...' : followStatus?.is_following ? 'Unfollow' : 'Follow'}
    </motion.button>
  );
};

export default FollowButton;