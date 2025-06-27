import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  ShareIcon,
  BookmarkIcon,
  ChatBubbleLeftIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { 
  ArrowUpIcon as ArrowUpSolid, 
  ArrowDownIcon as ArrowDownSolid,
  BookmarkIcon as BookmarkSolid
} from '@heroicons/react/24/solid';

const EnhancedReactionBar = ({ 
  post, 
  onUpvote, 
  onDownvote, 
  onReprint, 
  onBookmark,
  onReact,
  isUpvoted = false,
  isDownvoted = false,
  isBookmarked = false,
  showComments = true
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Enhanced reaction types for readers
  const reactionTypes = [
    { emoji: '💡', label: 'Insightful', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { emoji: '😭', label: 'Emotional', color: 'text-blue-600', bg: 'bg-blue-50' },
    { emoji: '🔥', label: 'Controversial', color: 'text-red-600', bg: 'bg-red-50' },
    { emoji: '🧠', label: 'Mind-blowing', color: 'text-purple-600', bg: 'bg-purple-50' },
    { emoji: '🧩', label: 'Confusing', color: 'text-gray-600', bg: 'bg-gray-50' },
    { emoji: '❤️', label: 'Loved it', color: 'text-pink-600', bg: 'bg-pink-50' },
    { emoji: '📚', label: 'Educational', color: 'text-green-600', bg: 'bg-green-50' }
  ];

  const handleReaction = (reactionType) => {
    if (onReact) {
      onReact(post.discussion_id, reactionType);
    }
    setShowReactions(false);
  };

  const handleShare = (platform) => {
    const url = `${window.location.origin}/socials/discussions/post/${post.discussion_id}`;
    const text = `Check out this discussion: ${post.title}`;
    
    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(url);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      default:
        break;
    }
    setShowShareMenu(false);
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white/30 backdrop-blur-sm border-t border-white/20">
      <div className="flex items-center space-x-6">
        {/* Traditional Voting (for sorting) */}
        <div className="flex items-center space-x-1">
          <motion.button
            onClick={() => onUpvote && onUpvote(post.discussion_id)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-all font-open-sans ${
              isUpvoted
                ? 'bg-success/20 text-success'
                : 'hover:bg-white/50 text-primary/70'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isUpvoted ? (
              <ArrowUpSolid className="w-4 h-4" />
            ) : (
              <ArrowUpIcon className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{post.upvotes || 0}</span>
          </motion.button>

          <motion.button
            onClick={() => onDownvote && onDownvote(post.discussion_id)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-all font-open-sans ${
              isDownvoted
                ? 'bg-error/20 text-error'
                : 'hover:bg-white/50 text-primary/70'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isDownvoted ? (
              <ArrowDownSolid className="w-4 h-4" />
            ) : (
              <ArrowDownIcon className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{post.downvotes || 0}</span>
          </motion.button>
        </div>

        {/* Enhanced Reactions */}
        <div className="relative">
          <motion.button
            onClick={() => setShowReactions(!showReactions)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/50 text-primary/70 transition-all font-open-sans"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-lg">😊</span>
            <span className="text-sm font-medium">React</span>
          </motion.button>

          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute bottom-full left-0 mb-2 bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg p-3 z-10"
              >
                <div className="grid grid-cols-4 gap-2">
                  {reactionTypes.map((reaction) => (
                    <motion.button
                      key={reaction.label}
                      onClick={() => handleReaction(reaction)}
                      className={`flex flex-col items-center p-2 rounded-lg transition-all ${reaction.bg} hover:scale-110`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title={reaction.label}
                    >
                      <span className="text-lg mb-1">{reaction.emoji}</span>
                      <span className={`text-xs font-medium ${reaction.color}`}>
                        {reaction.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Comments */}
        {showComments && (
          <motion.button
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/50 text-primary/70 transition-all font-open-sans"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChatBubbleLeftIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{post.notes_count || 0}</span>
          </motion.button>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Share */}
        <div className="relative">
          <motion.button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/50 text-primary/70 transition-all font-open-sans"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ShareIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Share</span>
          </motion.button>

          <AnimatePresence>
            {showShareMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute bottom-full right-0 mb-2 bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg p-2 z-10 min-w-[120px]"
              >
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 rounded-lg transition-colors"
                >
                  📋 Copy Link
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 rounded-lg transition-colors"
                >
                  🐦 Twitter
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 rounded-lg transition-colors"
                >
                  📘 Facebook
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bookmark */}
        <motion.button
          onClick={() => onBookmark && onBookmark(post.discussion_id)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all font-open-sans ${
            isBookmarked
              ? 'bg-accent/20 text-accent'
              : 'hover:bg-white/50 text-primary/70'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isBookmarked ? (
            <BookmarkSolid className="w-4 h-4" />
          ) : (
            <BookmarkIcon className="w-4 h-4" />
          )}
        </motion.button>

        {/* More Options */}
        <motion.button
          className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/50 text-primary/70 transition-all font-open-sans"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <EllipsisHorizontalIcon className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
};

export default EnhancedReactionBar;
