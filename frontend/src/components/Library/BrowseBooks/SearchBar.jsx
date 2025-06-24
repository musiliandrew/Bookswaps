import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';

const SearchBar = ({ searchQuery, onSearch }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onSearch('');
  };

  return (
    <div className="relative">
      <motion.div
        className={`relative transition-all duration-300 ${
          isFocused ? 'transform scale-105' : ''
        }`}
        whileHover={{ scale: 1.02 }}
      >
        {/* Enhanced Search Input */}
        <input
          type="text"
          placeholder="🔍 Search by title, author, genre, or ISBN..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full px-6 py-4 pl-14 pr-12 bookish-input rounded-2xl border-0 bg-white/20 backdrop-blur-sm text-primary placeholder-primary/60 transition-all duration-300 ${
            isFocused ? 'bg-white/30 shadow-lg' : 'bg-white/10'
          }`}
        />

        {/* Search Icon */}
        <motion.div
          className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
            isFocused ? 'text-accent' : 'text-primary/60'
          }`}
          animate={isFocused ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <MagnifyingGlassIcon className="w-6 h-6" />
        </motion.div>

        {/* Clear Button */}
        {searchQuery && (
          <motion.button
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-primary/20 hover:bg-primary/30 text-primary transition-all duration-200"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <XMarkIcon className="w-4 h-4" />
          </motion.button>
        )}

        {/* Focus Ring */}
        {isFocused && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-accent/50 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>

      {/* Search Suggestions/Tips */}
      {isFocused && !searchQuery && (
        <motion.div
          className="absolute top-full left-0 right-0 mt-2 p-4 bookish-glass rounded-xl border border-white/20 z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center mb-2">
            <SparklesIcon className="w-4 h-4 text-accent mr-2" />
            <span className="text-sm font-medium text-primary">Search Tips</span>
          </div>
          <div className="text-xs text-primary/70 space-y-1">
            <p>• Try searching by book title: "The Great Gatsby"</p>
            <p>• Find books by author: "F. Scott Fitzgerald"</p>
            <p>• Search by genre: "Fiction" or "Mystery"</p>
            <p>• Use ISBN for exact matches</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SearchBar;