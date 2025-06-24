import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FunnelIcon, SparklesIcon, BookOpenIcon, TagIcon, XMarkIcon } from '@heroicons/react/24/outline';

const PostFilters = ({ postFilters, setPostFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const filterOptions = {
    type: {
      icon: <SparklesIcon className="w-4 h-4" />,
      label: 'Post Type',
      options: [
        { value: '', label: '📚 All Types' },
        { value: 'Article', label: '📝 Article' },
        { value: 'Synopsis', label: '📖 Synopsis' },
        { value: 'Query', label: '❓ Query' },
      ]
    }
  };

  const hasActiveFilters = postFilters.type || postFilters.book_id || postFilters.tag;

  const clearAllFilters = () => {
    setPostFilters({ type: '', book_id: '', tag: '' });
  };

  const selectClasses = "w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary appearance-none cursor-pointer transition-all duration-300 hover:bg-white/20 focus:bg-white/30";
  const inputClasses = "w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary placeholder-primary/60 focus:bg-white/20 transition-all duration-300";

  return (
    <motion.div
      className="bookish-glass rounded-2xl p-6 border border-white/20 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Filter Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl">
            <FunnelIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary">Filter Posts</h3>
            {hasActiveFilters && (
              <motion.div
                className="bg-accent text-white text-xs px-2 py-1 rounded-full inline-block mt-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                Active Filters
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <motion.button
              onClick={clearAllFilters}
              className="text-xs text-primary/70 hover:text-red-500 transition-colors duration-200 flex items-center space-x-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <XMarkIcon className="w-3 h-3" />
              <span>Clear All</span>
            </motion.button>
          )}

          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden text-primary/70 hover:text-primary transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </motion.button>
        </div>
      </motion.div>

      {/* Filter Controls */}
      <AnimatePresence>
        <motion.div
          className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${isExpanded ? 'block' : 'hidden lg:grid'}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Post Type Filter */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <label className="flex items-center space-x-2 text-sm font-medium text-primary mb-2">
              <SparklesIcon className="w-4 h-4" />
              <span>Post Type</span>
            </label>

            <div className="relative">
              <select
                value={postFilters.type}
                onChange={e => setPostFilters({ ...postFilters, type: e.target.value })}
                className={selectClasses}
              >
                {filterOptions.type.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Custom dropdown arrow */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Book ID Filter */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <label className="flex items-center space-x-2 text-sm font-medium text-primary mb-2">
              <BookOpenIcon className="w-4 h-4" />
              <span>Book ID</span>
            </label>
            <input
              type="text"
              value={postFilters.book_id}
              onChange={e => setPostFilters({ ...postFilters, book_id: e.target.value })}
              className={inputClasses}
              placeholder="Filter by book ID"
            />
          </motion.div>

          {/* Tag Filter */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <label className="flex items-center space-x-2 text-sm font-medium text-primary mb-2">
              <TagIcon className="w-4 h-4" />
              <span>Tag</span>
            </label>
            <input
              type="text"
              value={postFilters.tag}
              onChange={e => setPostFilters({ ...postFilters, tag: e.target.value })}
              className={inputClasses}
              placeholder="Filter by tag"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <motion.div
          className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-white/10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <span className="text-xs text-primary/60">Active filters:</span>
          {postFilters.type && (
            <motion.span
              className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full flex items-center space-x-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <span>{filterOptions.type.options.find(opt => opt.value === postFilters.type)?.label}</span>
              <button
                onClick={() => setPostFilters({ ...postFilters, type: '' })}
                className="hover:text-red-500 transition-colors duration-200"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </motion.span>
          )}
          {postFilters.book_id && (
            <motion.span
              className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full flex items-center space-x-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <span>Book: {postFilters.book_id}</span>
              <button
                onClick={() => setPostFilters({ ...postFilters, book_id: '' })}
                className="hover:text-red-500 transition-colors duration-200"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </motion.span>
          )}
          {postFilters.tag && (
            <motion.span
              className="text-xs bg-blue-500/20 text-blue-600 px-2 py-1 rounded-full flex items-center space-x-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <span>Tag: {postFilters.tag}</span>
              <button
                onClick={() => setPostFilters({ ...postFilters, tag: '' })}
                className="hover:text-red-500 transition-colors duration-200"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </motion.span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default PostFilters;