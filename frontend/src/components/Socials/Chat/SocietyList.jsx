import React from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const SocietyList = ({ societies, isSocietiesLoading, listSocieties, societiesPagination, onSocietySelect, selectedSociety }) => {
  const handleSocietyClick = (society) => {
    if (onSocietySelect) {
      onSocietySelect(society);
    } else {
      toast.info(`Selected society: ${society.name}`);
    }
  };

  return (
    <div>
      <div className="p-4 border-b border-[var(--secondary)]/30">
        <h3 className="text-lg font-lora font-semibold text-[var(--primary)]">Book Societies</h3>
      </div>

      {isSocietiesLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
          <span className="ml-2 text-[var(--text)] font-open-sans">Loading societies...</span>
        </div>
      ) : societies.length === 0 ? (
        <div className="text-center py-8 text-[var(--text)]">
          <p className="font-open-sans">No societies found. Create one to get started!</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-[var(--secondary)]/30">
            {societies.map((society, index) => (
              <motion.div
                key={society.id || society.society_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSocietyClick(society)}
                className={`p-4 cursor-pointer transition-all duration-200 hover:bg-[var(--secondary)]/20 ${
                  (selectedSociety?.id || selectedSociety?.society_id) === (society.id || society.society_id)
                    ? 'bg-[var(--accent)]/10 border-r-4 border-[var(--accent)]'
                    : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Society Icon */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                      <svg viewBox="0 0 16 16" className="w-6 h-6 text-white" fill="currentColor">
                        <rect x="0" y="0" width="2" height="16"></rect>
                        <path d="M11,6 L11,9 L11.885,9 L12,6 L11,6 Z"></path>
                        <path d="M3,0 L3,16 L13.8208442,16 C14.4713435,16 15,15.5473033 15,14.9895162 L15,1.01048377 C15,0.451686245 14.4723504,0 13.8208442,0 L3,0 Z M13.051,9.053 L12.08,9.053 L12.062,10.063 L7.906,10.063 L7.924,9.042 L6.957,9.042 L6.957,6.99 L7.915,6.99 L7.915,5.948 L10.957,5.938 L10.957,5.051 L7.026,5.051 L7.026,6.048 L6.029,6.048 L6.029,9.958 L7.041,9.958 L7.041,10.975 L11.047,10.975 L11.047,12.014 L6.961,12.014 L6.961,11.063 L5.958,11.063 L5.958,10.032 L4.953,10.032 L4.953,5.991 L5.973,5.991 L5.973,4.973 L6.938,4.973 L6.938,3.938 L11.032,3.938 L11.032,4.959 L12.011,4.959 L12.011,5.949 L13.052,5.949 L13.052,9.053 L13.051,9.053 Z"></path>
                        <rect x="8" y="7" width="2" height="2"></rect>
                      </svg>
                    </div>

                    {/* Visibility Indicator */}
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      society.visibility === 'public' ? 'bg-green-400' : 'bg-yellow-400'
                    }`}></div>
                  </div>

                  {/* Society Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold font-open-sans text-[var(--primary)] truncate">
                        {society.name}
                      </h3>
                      <span className="text-xs text-[var(--text)] font-open-sans">
                        👥 {society.member_count || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[var(--text)] font-open-sans truncate">
                        {society.description ?
                          society.description.replace(/<[^>]*>/g, '').substring(0, 40) + '...' :
                          'Join this book society'
                        }
                      </p>

                      {/* Focus Type Badge */}
                      {society.focus_type && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-bold leading-none text-white bg-[var(--primary)] rounded-full">
                          📚 {society.focus_type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {(societiesPagination.societies.previous || societiesPagination.societies.next) && (
            <div className="flex justify-center gap-2 mt-6">
              <motion.button
                key="prev-button"
                onClick={() => listSocieties({}, societiesPagination.societies.page - 1)}
                disabled={!societiesPagination.societies.previous}
                className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Previous
              </motion.button>
              <span key="page-info" className="px-4 py-2 text-[var(--text)]">
                Page {societiesPagination.societies.page}
              </span>
              <motion.button
                key="next-button"
                onClick={() => listSocieties({}, societiesPagination.societies.page + 1)}
                disabled={!societiesPagination.societies.next}
                className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SocietyList;