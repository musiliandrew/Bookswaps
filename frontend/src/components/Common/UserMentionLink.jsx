import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../hooks/useAuth';

const UserPreviewTooltip = ({ user, position, onClose, onStartChat }) => {
  if (!user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed z-50 bg-[var(--bg-card)] rounded-lg shadow-xl border border-gray-200 p-4 max-w-xs"
        style={{
          left: Math.min(position.x, window.innerWidth - 320),
          top: Math.max(position.y - 10, 10),
        }}
        onMouseEnter={(e) => e.stopPropagation()}
        onMouseLeave={onClose}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {user.profile_picture ? (
              <img 
                src={user.profile_picture} 
                alt={user.username}
                className="w-12 h-12 object-cover rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm truncate">
              {user.username}
            </h4>
            {user.city && user.country && (
              <p className="text-xs text-gray-600 mb-1">
                {user.city}, {user.country}
              </p>
            )}
            {user.genres && user.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {user.genres.slice(0, 2).map((genre, index) => (
                  <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {genre}
                  </span>
                ))}
                {user.genres.length > 2 && (
                  <span className="text-xs text-gray-500">+{user.genres.length - 2} more</span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 flex space-x-2">
          <button
            onClick={() => window.location.href = `/profile/${user.username}`}
            className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md transition-colors"
          >
            View Profile
          </button>
          <button
            onClick={() => onStartChat(user)}
            className="flex-1 text-xs bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white px-3 py-2 rounded-md transition-colors flex items-center justify-center space-x-1"
          >
            <ChatBubbleLeftIcon className="w-3 h-3" />
            <span>Chat</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const UserMentionLink = ({ 
  username, 
  userId = null, 
  className = "",
  showTooltip = true,
  onUserClick = null 
}) => {
  const [hoveredUser, setHoveredUser] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const { getUserByUsername } = useUsers();
  const { user: currentUser } = useAuth();

  const handleUserHover = async (username, event) => {
    if (!showTooltip) return;
    
    const rect = event.target.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 5
    });

    try {
      const user = await getUserByUsername(username);
      if (user) {
        setHoveredUser(user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const handleUserClick = (username) => {
    if (onUserClick) {
      onUserClick(username);
    } else {
      navigate(`/profile/${username}`);
    }
  };

  const handleStartChat = (user) => {
    setHoveredUser(null);
    // Navigate to chat with pre-filled message
    navigate('/chat', { 
      state: { 
        startConversation: user,
        prefilledMessage: "Hey there! 👋"
      }
    });
  };

  // Don't show mention link for current user
  if (currentUser && username === currentUser.username) {
    return <span className={`text-[var(--primary)] font-medium ${className}`}>@{username}</span>;
  }

  return (
    <div className="relative inline-block">
      <motion.span
        className={`inline-flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md cursor-pointer hover:bg-blue-100 transition-colors font-medium ${className}`}
        onMouseEnter={(e) => handleUserHover(username, e)}
        onMouseLeave={() => setHoveredUser(null)}
        onClick={() => handleUserClick(username)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <UserIcon className="w-3 h-3" />
        <span className="text-sm">@{username}</span>
      </motion.span>

      {/* User preview tooltip */}
      {hoveredUser && showTooltip && (
        <UserPreviewTooltip
          user={hoveredUser}
          position={tooltipPosition}
          onClose={() => setHoveredUser(null)}
          onStartChat={handleStartChat}
        />
      )}
    </div>
  );
};

export default UserMentionLink;
