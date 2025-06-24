import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FunnelIcon, TagIcon, ArrowsRightLeftIcon, ArrowsUpDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Filters = ({ filters, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const filterOptions = {
    genre: {
      icon: <TagIcon className="w-4 h-4" />,
      label: 'Genre',
      options: [
        { value: '', label: '📚 All Genres' },
        { value: 'fiction', label: '📖 Fiction' },
        { value: 'non-fiction', label: '📰 Non-Fiction' },
        { value: 'mystery', label: '🔍 Mystery' },
        { value: 'sci-fi', label: '🚀 Sci-Fi' },
        { value: 'fantasy', label: '🧙‍♂️ Fantasy' },
        { value: 'romance', label: '💕 Romance' },
        { value: 'thriller', label: '😱 Thriller' },
        { value: 'biography', label: '👤 Biography' },
        { value: 'history', label: '🏛️ History' },
        { value: 'science', label: '🔬 Science' },
      ]
    },
    available: {
      icon: <ArrowsRightLeftIcon className="w-4 h-4" />,
      label: 'Availability',
      options: [
        { value: '', label: '🌐 All Availability' },
        { value: 'exchange', label: '🔄 Available for Exchange' },
        { value: 'borrow', label: '📖 Available for Borrow' },
        { value: 'both', label: '✨ Both Exchange & Borrow' },
      ]
    },
    sort: {
      icon: <ArrowsUpDownIcon className="w-4 h-4" />,
      label: 'Sort By',
      options: [
        { value: 'title', label: '📝 Title (A-Z)' },
        { value: 'author', label: '👤 Author (A-Z)' },
        { value: 'created_at', label: '📅 Recently Added' },
        { value: 'year', label: '🗓️ Publication Year' },
      ]
    }
  };

  const hasActiveFilters = filters.genre || filters.available || filters.sort !== 'title';

  const clearAllFilters = () => {
    onFilterChange('genre', '');
    onFilterChange('available', '');
    onFilterChange('sort', 'title');
  };

  const selectClasses = "w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary appearance-none cursor-pointer transition-all duration-300 hover:bg-white/20 focus:bg-white/30";

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-2">
          <FunnelIcon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-primary">Filters</h3>
          {hasActiveFilters && (
            <motion.div
              className="bg-accent text-white text-xs px-2 py-1 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              Active
            </motion.div>
          )}
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
          className={`grid grid-cols-1 lg:grid-cols-3 gap-4 ${isExpanded ? 'block' : 'hidden lg:grid'}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          {Object.entries(filterOptions).map(([filterKey, filterData]) => (
            <motion.div
              key={filterKey}
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <label className="flex items-center space-x-2 text-sm font-medium text-primary mb-2">
                {filterData.icon}
                <span>{filterData.label}</span>
              </label>

              <div className="relative">
                <select
                  name={filterKey}
                  value={filters[filterKey]}
                  onChange={(e) => onFilterChange(e.target.name, e.target.value)}
                  className={selectClasses}
                >
                  {filterData.options.map((option) => (
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
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <motion.div
          className="flex flex-wrap gap-2 pt-2 border-t border-white/10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <span className="text-xs text-primary/60">Active filters:</span>
          {filters.genre && (
            <motion.span
              className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full flex items-center space-x-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <span>{filterOptions.genre.options.find(opt => opt.value === filters.genre)?.label}</span>
              <button
                onClick={() => onFilterChange('genre', '')}
                className="hover:text-red-500 transition-colors duration-200"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </motion.span>
          )}
          {filters.available && (
            <motion.span
              className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full flex items-center space-x-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <span>{filterOptions.available.options.find(opt => opt.value === filters.available)?.label}</span>
              <button
                onClick={() => onFilterChange('available', '')}
                className="hover:text-red-500 transition-colors duration-200"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </motion.span>
          )}
          {filters.sort !== 'title' && (
            <motion.span
              className="text-xs bg-blue-500/20 text-blue-600 px-2 py-1 rounded-full flex items-center space-x-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <span>{filterOptions.sort.options.find(opt => opt.value === filters.sort)?.label}</span>
              <button
                onClick={() => onFilterChange('sort', 'title')}
                className="hover:text-red-500 transition-colors duration-200"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </motion.span>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Filters;