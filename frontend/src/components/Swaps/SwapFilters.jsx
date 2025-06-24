import React from 'react';
import { motion } from 'framer-motion';
import { 
  FunnelIcon, 
  ArrowPathIcon,
  PaperAirplaneIcon,
  InboxIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const SwapFilters = ({ filters, setFilters, onRefresh }) => {
  const statusOptions = [
    { value: '', label: 'All Statuses', icon: EyeIcon },
    { value: 'Requested', label: 'Requested', icon: PaperAirplaneIcon },
    { value: 'Accepted', label: 'Accepted', icon: InboxIcon },
    { value: 'Confirmed', label: 'Confirmed', icon: ArrowPathIcon },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Swaps' },
    { value: 'sent', label: 'Sent by Me' },
    { value: 'received', label: 'Received by Me' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="bookish-glass p-6 rounded-2xl border border-white/20"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl">
          <FunnelIcon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-lora font-bold text-primary">Filter Swaps</h3>
          <p className="text-sm text-primary/70">Customize your swap view</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Status Filter */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <label className="flex items-center space-x-2 text-sm font-medium text-primary mb-3">
            <EyeIcon className="w-4 h-4" />
            <span>Status</span>
          </label>
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary appearance-none cursor-pointer transition-all duration-300 hover:bg-white/20 focus:bg-white/30"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Type Filter */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <label className="flex items-center space-x-2 text-sm font-medium text-primary mb-3">
            <ArrowPathIcon className="w-4 h-4" />
            <span>Type</span>
          </label>
          <div className="relative">
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary appearance-none cursor-pointer transition-all duration-300 hover:bg-white/20 focus:bg-white/30"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Actions */}
        <div className="flex flex-col justify-end gap-3">
          <motion.button
            onClick={onRefresh}
            className="flex items-center justify-center gap-2 px-4 py-3 bookish-button-enhanced text-white rounded-xl font-medium shadow-lg"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowPathIcon className="w-4 h-4" />
            Refresh
          </motion.button>

          <motion.button
            onClick={() => setFilters({ status: '', type: 'all' })}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-primary rounded-xl hover:bg-white/20 transition-all duration-300 font-medium border border-white/20"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear Filters
          </motion.button>
        </div>
      </div>

      {/* Enhanced Quick Filter Buttons */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
          <p className="text-sm font-semibold text-primary">Quick Filters</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <motion.button
            onClick={() => setFilters({ status: 'Requested', type: 'received' })}
            className="px-4 py-2 bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 text-yellow-700 rounded-xl text-sm hover:from-yellow-400/30 hover:to-yellow-500/30 transition-all duration-300 font-medium border border-yellow-400/30"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            ⏳ Pending My Response
          </motion.button>

          <motion.button
            onClick={() => setFilters({ status: 'Accepted', type: 'all' })}
            className="px-4 py-2 bg-gradient-to-r from-blue-400/20 to-blue-500/20 text-blue-700 rounded-xl text-sm hover:from-blue-400/30 hover:to-blue-500/30 transition-all duration-300 font-medium border border-blue-400/30"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            ✅ Ready to Confirm
          </motion.button>

          <motion.button
            onClick={() => setFilters({ status: 'Requested', type: 'sent' })}
            className="px-4 py-2 bg-gradient-to-r from-purple-400/20 to-purple-500/20 text-purple-700 rounded-xl text-sm hover:from-purple-400/30 hover:to-purple-500/30 transition-all duration-300 font-medium border border-purple-400/30"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            📤 Awaiting Response
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default SwapFilters;
