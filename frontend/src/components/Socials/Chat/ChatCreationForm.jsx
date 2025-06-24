import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChatBubbleOvalLeftEllipsisIcon, UserIcon, BookOpenIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

const ChatCreationForm = ({ newChat, setNewChat, handleStartChat }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const inputClasses = "w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary placeholder-primary/60 focus:bg-white/20 transition-all duration-300";
  const labelClasses = "flex items-center space-x-2 text-sm font-medium text-primary mb-2";

  return (
    <motion.div
      className="bookish-glass rounded-2xl p-6 border border-white/20 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl">
            <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-lora font-bold text-primary">Start a New Chat</h3>
            <p className="text-sm text-primary/70">Connect with fellow readers</p>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-primary/70 hover:text-primary transition-colors duration-200 lg:hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </motion.button>
      </motion.div>

      <div className={`space-y-6 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Recipient and Book ID */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div>
            <label className={labelClasses}>
              <UserIcon className="w-4 h-4" />
              <span>Recipient User ID *</span>
            </label>
            <input
              type="text"
              value={newChat.recipient_id}
              onChange={e => setNewChat({ ...newChat, recipient_id: e.target.value })}
              className={inputClasses}
              placeholder="Enter user ID to chat with"
              required
            />
            <p className="text-xs text-primary/60 mt-1">
              💡 Tip: You can find user IDs in their profiles
            </p>
          </div>

          <div>
            <label className={labelClasses}>
              <BookOpenIcon className="w-4 h-4" />
              <span>Book ID (Optional)</span>
            </label>
            <input
              type="text"
              value={newChat.book_id}
              onChange={e => setNewChat({ ...newChat, book_id: e.target.value })}
              className={inputClasses}
              placeholder="Link conversation to a book"
            />
            <p className="text-xs text-primary/60 mt-1">
              📚 Start a conversation about a specific book
            </p>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          className="flex justify-end"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <motion.button
            onClick={handleStartChat}
            className="bookish-button-enhanced px-8 py-3 rounded-xl text-white font-semibold shadow-lg flex items-center space-x-2"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            disabled={!newChat.recipient_id}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
            <span>Start Chat</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ChatCreationForm;