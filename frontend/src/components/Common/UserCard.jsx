import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  ChatBubbleLeftIcon, 
  MapPinIcon,
  BookOpenIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { getProfilePictureUrl } from '../../utils/imageUtils';

const UserCard = ({ 
  user, 
  showDMButton = true, 
  showFollowButton = false,
  onFollow = null,
  onUnfollow = null,
  followStatus = null,
  className = "",
  size = "medium" // "small", "medium", "large"
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const isOwnProfile = currentUser && user && currentUser.user_id === user.user_id;

  const handleProfileClick = () => {
    navigate(`/profile/${user.username}`);
  };

  const handleStartChat = (e) => {
    e.stopPropagation();
    navigate('/chat', { 
      state: { 
        startConversation: user,
        prefilledMessage: "Hey there! 👋"
      }
    });
  };

  const handleFollowClick = (e) => {
    e.stopPropagation();
    if (followStatus?.is_following && onUnfollow) {
      onUnfollow(user);
    } else if (!followStatus?.is_following && onFollow) {
      onFollow(user);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return {
          container: "p-3",
          avatar: "w-10 h-10",
          name: "text-sm",
          details: "text-xs",
          button: "px-2 py-1 text-xs"
        };
      case "large":
        return {
          container: "p-6",
          avatar: "w-16 h-16",
          name: "text-lg",
          details: "text-sm",
          button: "px-4 py-2 text-sm"
        };
      default: // medium
        return {
          container: "p-4",
          avatar: "w-12 h-12",
          name: "text-base",
          details: "text-sm",
          button: "px-3 py-2 text-sm"
        };
    }
  };

  const sizeClasses = getSizeClasses();

  if (!user) return null;

  return (
    <motion.div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer ${sizeClasses.container} ${className}`}
      onClick={handleProfileClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center space-x-3">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          <div className={`${sizeClasses.avatar} rounded-full overflow-hidden border-2 border-[var(--primary)]/20`}>
            {getProfilePictureUrl(user, size === "large" ? "M" : "S") ? (
              <img
                src={getProfilePictureUrl(user, size === "large" ? "M" : "S")}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                <UserIcon className={`${size === "small" ? "w-5 h-5" : size === "large" ? "w-8 h-8" : "w-6 h-6"} text-white`} />
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-[var(--primary)] truncate ${sizeClasses.name}`}>
            {user.username}
          </h3>
          
          {user.city && user.country && (
            <div className={`flex items-center space-x-1 text-gray-500 mb-1 ${sizeClasses.details}`}>
              <MapPinIcon className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{user.city}, {user.country}</span>
            </div>
          )}

          {/* User Stats */}
          <div className={`flex items-center space-x-3 text-gray-400 ${sizeClasses.details}`}>
            {user.books_count !== undefined && (
              <div className="flex items-center space-x-1">
                <BookOpenIcon className="w-3 h-3" />
                <span>{user.books_count} books</span>
              </div>
            )}
            {user.followers_count !== undefined && (
              <div className="flex items-center space-x-1">
                <UsersIcon className="w-3 h-3" />
                <span>{user.followers_count} followers</span>
              </div>
            )}
          </div>

          {/* Genres */}
          {user.genres && user.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {user.genres.slice(0, 2).map((genre, index) => (
                <span
                  key={index}
                  className={`inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full ${size === "small" ? "text-xs" : "text-xs"}`}
                >
                  {genre}
                </span>
              ))}
              {user.genres.length > 2 && (
                <span className={`text-gray-500 ${sizeClasses.details}`}>
                  +{user.genres.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isOwnProfile && (
          <div className="flex flex-col space-y-2 flex-shrink-0">
            {/* DM Button */}
            {showDMButton && (
              <motion.button
                onClick={handleStartChat}
                className={`flex items-center space-x-1 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-lg transition-colors ${sizeClasses.button}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Send message"
              >
                <ChatBubbleLeftIcon className="w-3 h-3" />
                <span>DM</span>
              </motion.button>
            )}

            {/* Follow Button */}
            {showFollowButton && (onFollow || onUnfollow) && (
              <motion.button
                onClick={handleFollowClick}
                className={`flex items-center space-x-1 rounded-lg transition-colors ${sizeClasses.button} ${
                  followStatus?.is_following
                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    : 'bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={followStatus?.is_following ? "Unfollow" : "Follow"}
              >
                <UsersIcon className="w-3 h-3" />
                <span>{followStatus?.is_following ? 'Following' : 'Follow'}</span>
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Mutual Follow Indicator */}
      {followStatus?.is_mutual && (
        <div className="mt-2 flex items-center space-x-1 text-xs text-green-600">
          <UsersIcon className="w-3 h-3" />
          <span>Mutual connection</span>
        </div>
      )}
    </motion.div>
  );
};

export default UserCard;
