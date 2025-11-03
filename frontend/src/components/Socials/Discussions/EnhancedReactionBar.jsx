import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckIcon,
  XMarkIcon,
  ShareIcon,
  BookmarkIcon,
  ChatBubbleLeftIcon,
  EllipsisHorizontalIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';
import {
  CheckIcon as CheckSolid,
  XMarkIcon as XMarkSolid,
  BookmarkIcon as BookmarkSolid,
  SpeakerWaveIcon as SpeakerWaveSolid
} from '@heroicons/react/24/solid';

const EnhancedReactionBar = ({
  post,
  onAgree,
  onDisagree,
  onReprint,
  onBookmark,
  onToggleComments,
  isAgreed = false,
  isDisagreed = false,
  isBookmarked = false,
  showComments = true
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const shareMenuRef = useRef(null);
  const moreMenuRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleMoreAction = (action) => {
    setShowMoreMenu(false);
    // Handle more actions here
    console.log(`More action: ${action}`);
  };

  return (
    <div className="px-2 sm:px-4 py-2 sm:py-3 bg-[var(--bg-card)]/30 backdrop-blur-sm border-t border-white/20">

      {/* Mobile Layout: Two Columns */}
      <div className="flex items-center justify-between sm:hidden">
        {/* LEFT COLUMN: Primary Actions */}
        <div className="flex items-center space-x-1">
          {/* Agree */}
          <motion.button
            onClick={() => onAgree && onAgree(post.discussion_id)}
            className={`flex items-center space-x-1 transition-all font-open-sans min-h-[40px] ${
              isAgreed
                ? 'text-green-600'
                : 'text-gray-500 hover:text-green-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Agree / Correct"
          >
            {isAgreed ? (
              <CheckSolid className="w-3 h-3" />
            ) : (
              <CheckIcon className="w-3 h-3" />
            )}
            <span className="text-xs font-medium">{post.upvotes || 0}</span>
          </motion.button>

          {/* Disagree */}
          <motion.button
            onClick={() => onDisagree && onDisagree(post.discussion_id)}
            className={`flex items-center space-x-1 transition-all font-open-sans min-h-[40px] ${
              isDisagreed
                ? 'text-red-600'
                : 'text-gray-500 hover:text-red-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Disagree / Wrong"
          >
            {isDisagreed ? (
              <XMarkSolid className="w-3 h-3" />
            ) : (
              <XMarkIcon className="w-3 h-3" />
            )}
            <span className="text-xs font-medium">{post.downvotes || 0}</span>
          </motion.button>

          {/* Echo */}
          <motion.button
            onClick={() => onReprint && onReprint(post)}
            className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-all font-open-sans min-h-[40px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Echo (Repost)"
          >
            <SpeakerWaveIcon className="w-3 h-3" />
            <span className="text-xs font-medium">{post.reprint_count || 0}</span>
          </motion.button>

          {/* Comments */}
          {showComments && (
            <motion.button
              onClick={() => onToggleComments && onToggleComments()}
              className="flex items-center space-x-1 text-gray-500 hover:text-purple-600 transition-all font-open-sans min-h-[40px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Notes"
            >
              <ChatBubbleLeftIcon className="w-3 h-3" />
              <span className="text-xs font-medium">{post.note_count || 0}</span>
            </motion.button>
          )}
        </div>

        {/* RIGHT COLUMN: Secondary Actions */}
        <div className="flex items-center space-x-1">
          {/* Bookmark */}
          <motion.button
            onClick={() => onBookmark && onBookmark(post.discussion_id)}
            className={`transition-all min-h-[40px] flex items-center justify-center ${
              isBookmarked
                ? 'text-yellow-600'
                : 'text-gray-400 hover:text-yellow-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Bookmark"
          >
            {isBookmarked ? (
              <BookmarkSolid className="w-3 h-3" />
            ) : (
              <BookmarkIcon className="w-3 h-3" />
            )}
          </motion.button>

          {/* Share */}
          <div className="relative" ref={shareMenuRef}>
            <motion.button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="text-gray-400 hover:text-gray-600 transition-all min-h-[40px] flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Share"
            >
              <ShareIcon className="w-3 h-3" />
            </motion.button>

            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-full right-0 mb-2 bg-[var(--bg-card)]/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-2 z-20 min-w-[120px]"
                >
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    📋 Copy Link
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    🐦 Twitter
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    📘 Facebook
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Desktop Layout: Original Three Groups */}
      <div className="hidden sm:flex items-center justify-between">
        {/* LEFT GROUP: Primary Actions */}
        <div className="flex items-center space-x-4">
          {/* Agree */}
          <motion.button
            onClick={() => onAgree && onAgree(post.discussion_id)}
            className={`flex items-center space-x-1 transition-all font-open-sans min-h-[44px] ${
              isAgreed
                ? 'text-green-600'
                : 'text-gray-500 hover:text-green-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Agree / Correct"
          >
            {isAgreed ? (
              <CheckSolid className="w-4 h-4" />
            ) : (
              <CheckIcon className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{post.upvotes || 0}</span>
          </motion.button>

          {/* Disagree */}
          <motion.button
            onClick={() => onDisagree && onDisagree(post.discussion_id)}
            className={`flex items-center space-x-1 transition-all font-open-sans min-h-[44px] ${
              isDisagreed
                ? 'text-red-600'
                : 'text-gray-500 hover:text-red-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Disagree / Wrong"
          >
            {isDisagreed ? (
              <XMarkSolid className="w-4 h-4" />
            ) : (
              <XMarkIcon className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{post.downvotes || 0}</span>
          </motion.button>

          {/* Echo */}
          <motion.button
            onClick={() => onReprint && onReprint(post)}
            className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-all font-open-sans min-h-[44px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Echo (Repost)"
          >
            <SpeakerWaveIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{post.reprint_count || 0}</span>
          </motion.button>

          {/* Comments */}
          {showComments && (
            <motion.button
              onClick={() => onToggleComments && onToggleComments()}
              className="flex items-center space-x-1 text-gray-500 hover:text-purple-600 transition-all font-open-sans min-h-[44px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Notes"
            >
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{post.note_count || 0}</span>
            </motion.button>
          )}
        </div>

        {/* CENTER GROUP: Comments */}
        <div className="flex items-center">
          {!showComments && (
            <motion.button
              onClick={() => onToggleComments && onToggleComments()}
              className="flex items-center space-x-1 text-gray-500 hover:text-purple-600 transition-all font-open-sans min-h-[44px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Notes"
            >
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{post.note_count || 0}</span>
            </motion.button>
          )}
        </div>

        {/* RIGHT GROUP: Secondary Actions */}
        <div className="flex items-center space-x-4">
          {/* Bookmark */}
          <motion.button
            onClick={() => onBookmark && onBookmark(post.discussion_id)}
            className={`transition-all min-h-[44px] flex items-center justify-center ${
              isBookmarked
                ? 'text-yellow-600'
                : 'text-gray-400 hover:text-yellow-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Bookmark"
          >
            {isBookmarked ? (
              <BookmarkSolid className="w-4 h-4" />
            ) : (
              <BookmarkIcon className="w-4 h-4" />
            )}
          </motion.button>

          {/* Share */}
          <div className="relative" ref={shareMenuRef}>
            <motion.button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="text-gray-400 hover:text-gray-600 transition-all min-h-[44px] flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Share"
            >
              <ShareIcon className="w-4 h-4" />
            </motion.button>

            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-full right-0 mb-2 bg-[var(--bg-card)]/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-2 z-20 min-w-[140px]"
                >
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    📋 Copy Link
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    🐦 Twitter
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    📘 Facebook
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* More Options */}
          <div className="relative" ref={moreMenuRef}>
            <motion.button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="text-gray-400 hover:text-gray-600 transition-all min-h-[44px] flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="More options"
            >
              <EllipsisHorizontalIcon className="w-4 h-4" />
            </motion.button>

            <AnimatePresence>
              {showMoreMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-full right-0 mb-2 bg-[var(--bg-card)]/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-2 z-20 min-w-[120px]"
                >
                  <button
                    onClick={() => handleMoreAction('report')}
                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded-lg transition-colors text-red-600"
                  >
                    🚨 Report
                  </button>
                  <button
                    onClick={() => handleMoreAction('hide')}
                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    👁️ Hide
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedReactionBar;
