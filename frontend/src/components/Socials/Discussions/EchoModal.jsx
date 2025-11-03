import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  SpeakerWaveIcon,
  UserIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const EchoModal = ({ isOpen, onClose, onEcho, post, isLoading }) => {
  const [comment, setComment] = useState('');
  const [echoType, setEchoType] = useState('simple'); // 'simple' or 'quote'

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onEcho) {
      await onEcho(post.discussion_id, { comment: comment.trim() });
      setComment('');
      onClose();
    }
  };

  const handleClose = () => {
    setComment('');
    setEchoType('simple');
    onClose();
  };

  if (!isOpen || !post) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[var(--secondary)] rounded-2xl border border-[var(--primary)]/20 shadow-2xl max-w-md sm:max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden mx-2 sm:mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[var(--primary)]/20">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--primary)]/20 rounded-lg">
                <SpeakerWaveIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent)]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-lora font-semibold text-[var(--primary)]">Echo this post</h3>
                <p className="text-xs sm:text-sm text-[var(--primary)]/60 font-open-sans">Share with your thoughts</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-[var(--primary)]/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <XMarkIcon className="w-5 h-5 text-[var(--primary)]/60" />
            </button>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            {/* Echo Type Selection */}
            <div className="flex space-x-2">
              <button
                onClick={() => setEchoType('simple')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium font-open-sans transition-all min-h-[44px] ${
                  echoType === 'simple'
                    ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] text-white shadow-lg'
                    : 'bg-[var(--bg-card)]/50 text-[var(--primary)]/70 hover:bg-[var(--bg-card)]/70 border border-white/30'
                }`}
              >
                📢 Simple Echo
              </button>
              <button
                onClick={() => setEchoType('quote')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium font-open-sans transition-all min-h-[44px] ${
                  echoType === 'quote'
                    ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] text-white shadow-lg'
                    : 'bg-[var(--bg-card)]/50 text-[var(--primary)]/70 hover:bg-[var(--bg-card)]/70 border border-white/30'
                }`}
              >
                💬 Quote Echo
              </button>
            </div>

            {/* Comment Input (for quote echo) */}
            {echoType === 'quote' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-primary font-open-sans">
                  💭 Add your thoughts (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What do you think about this discussion? Share your perspective..."
                  className="w-full px-4 py-3 input rounded-xl font-open-sans resize-none focus:ring-2 focus:ring-accent/50 transition-all"
                  rows={3}
                  maxLength={280}
                />
                <div className="flex justify-between items-center">
                  <div className="text-xs text-primary/60 font-open-sans">
                    {comment.length}/280 characters
                  </div>
                  <div className="text-xs text-primary/50 font-open-sans">
                    💡 Tip: Share why this resonates with you
                  </div>
                </div>
              </div>
            )}

            {/* Original Post Preview */}
            <div className="card border border-white/30 rounded-xl p-4 bg-[var(--bg-card)]/30">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  {post.user?.profile_picture ? (
                    <img
                      src={post.user.profile_picture}
                      alt={post.user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-primary text-sm font-open-sans">
                      {post.user?.username || 'Unknown User'}
                    </span>
                    <span className="text-xs text-primary/60 font-open-sans">
                      {post.created_at && formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  <h4 className="font-lora font-semibold text-primary text-sm mb-2 line-clamp-2">
                    {post.title}
                  </h4>

                  {post.book && (
                    <div className="flex items-center space-x-1 text-xs text-accent mb-2 font-open-sans">
                      <BookOpenIcon className="w-3 h-3" />
                      <span>{post.book.title}</span>
                    </div>
                  )}

                  <p className="text-sm text-primary/80 line-clamp-3 font-open-sans leading-relaxed">
                    {post.content?.replace(/<[^>]*>/g, '') || 'No content available'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-2 p-3 sm:p-4 border-t border-[var(--primary)]/20 bg-[var(--primary)]/5">
            <button
              onClick={handleClose}
              className="px-3 py-2 text-xs sm:text-sm font-medium text-[var(--primary)]/70 hover:bg-[var(--primary)]/10 rounded-xl transition-colors font-open-sans min-h-[44px]"
            >
              Cancel
            </button>
            <motion.button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 btn btn-primary text-white text-xs sm:text-sm font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 font-open-sans min-h-[44px]"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Echoing...</span>
                </>
              ) : (
                <>
                  <SpeakerWaveIcon className="w-4 h-4" />
                  <span>Echo Post</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EchoModal;
