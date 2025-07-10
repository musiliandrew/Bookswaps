import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  SpeakerWaveIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import EnhancedPostCard from './EnhancedPostCard';

const EchoFeedItem = ({
  echo,
  originalPost,
  onAgree,
  onDisagree,
  onReprint,
  onBookmark,
  currentUser
}) => {
  const isOwnEcho = currentUser && echo.user && currentUser.user_id === echo.user.user_id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bookish-glass rounded-2xl border border-white/20 overflow-hidden bookish-shadow"
    >
      {/* Echo Attribution Header */}
      <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <SpeakerWaveIcon className="w-4 h-4 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-[var(--accent)] to-[var(--dark-accent)] rounded-full flex items-center justify-center">
                {echo.user?.profile_picture ? (
                  <img 
                    src={echo.user.profile_picture} 
                    alt={echo.user.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-3 h-3 text-white" />
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <Link 
                  to={`/profile/${echo.user?.username}`}
                  className="font-medium text-[var(--dark-primary)] hover:text-[var(--accent)] transition-colors font-open-sans"
                >
                  {isOwnEcho ? 'You' : echo.user?.username || 'Someone'}
                </Link>
                <span className="text-[var(--text)]">echoed this</span>
                <div className="flex items-center space-x-1 text-xs text-[var(--text)]">
                  <ClockIcon className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(echo.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
            
            {/* Echo comment if any */}
            {echo.comment && echo.comment.trim() && (
              <div className="mt-2 text-sm text-[var(--text)] font-open-sans italic">
                "{echo.comment}"
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Original Post Content */}
      <div className="p-1">
        <EnhancedPostCard
          post={originalPost}
          onAgree={onAgree}
          onDisagree={onDisagree}
          onReprint={onReprint}
          onBookmark={onBookmark}
          isAgreed={originalPost.is_upvoted}
          isDisagreed={originalPost.is_downvoted}
          isBookmarked={false}
          showFullContent={false}
          isEmbedded={true} // Flag to show this is embedded in an echo
        />
      </div>
    </motion.div>
  );
};

export default EchoFeedItem;
