import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FunnelIcon, 
  ChevronDownIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const MobileFilterDropdown = ({ activeFilter, setActiveFilter, filterOptions }) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeOption = filterOptions.find(option => option.value === activeFilter);

  const handleFilterSelect = (value) => {
    setActiveFilter(value);
    setIsOpen(false);
  };

  return (
    <div className="relative mobile-filter-dropdown">
      {/* Filter Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 bg-[var(--bg-card)]/80 backdrop-blur-sm rounded-xl border border-white/20 text-primary font-medium mobile-button mobile-touch-feedback"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{activeOption?.label || 'All Posts'}</span>
          {activeOption?.count !== undefined && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
              {activeOption.count}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="w-4 h-4" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-card)]/95 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg z-50 overflow-hidden dropdown-menu"
          >
            {filterOptions.map((option, index) => (
              <motion.button
                key={option.value}
                onClick={() => handleFilterSelect(option.value)}
                className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors mobile-button mobile-touch-feedback ${
                  activeFilter === option.value
                    ? 'bg-primary/10 text-primary'
                    : 'text-primary/70 hover:bg-primary/5 hover:text-primary'
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{option.label}</span>
                  {option.count !== undefined && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {option.count}
                    </span>
                  )}
                </div>
                {activeFilter === option.value && (
                  <CheckIcon className="w-4 h-4 text-primary" />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileFilterDropdown;
