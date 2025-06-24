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
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--card-bg)] p-4 rounded-lg border border-[var(--secondary)]"
    >
      <div className="flex items-center gap-2 mb-4">
        <FunnelIcon className="w-5 h-5 text-[var(--accent)]" />
        <h3 className="font-medium text-[var(--text-primary)]">Filter Swaps</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 border border-[var(--secondary)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent text-sm"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-3 py-2 border border-[var(--secondary)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent text-sm"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-end gap-2">
          <motion.button
            onClick={onRefresh}
            className="flex items-center gap-1 px-3 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowPathIcon className="w-4 h-4" />
            Refresh
          </motion.button>
          
          <motion.button
            onClick={() => setFilters({ status: '', type: 'all' })}
            className="flex items-center gap-1 px-3 py-2 bg-[var(--secondary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--secondary)]/80 transition-colors text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear
          </motion.button>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="mt-4 pt-4 border-t border-[var(--secondary)]">
        <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Quick Filters</p>
        <div className="flex flex-wrap gap-2">
          <motion.button
            onClick={() => setFilters({ status: 'Requested', type: 'received' })}
            className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs hover:bg-yellow-200 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Pending My Response
          </motion.button>
          
          <motion.button
            onClick={() => setFilters({ status: 'Accepted', type: 'all' })}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs hover:bg-blue-200 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Ready to Confirm
          </motion.button>
          
          <motion.button
            onClick={() => setFilters({ status: 'Requested', type: 'sent' })}
            className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs hover:bg-purple-200 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Awaiting Response
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default SwapFilters;
