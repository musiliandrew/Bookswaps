import React from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const SocietyList = ({ societies, isSocietiesLoading, listSocieties, societiesPagination, onSocietySelect }) => {
  const handleSocietyClick = (society) => {
    if (onSocietySelect) {
      onSocietySelect(society);
    } else {
      toast.info(`Selected society: ${society.name}`);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Available Societies</h3>
      {isSocietiesLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
          <span className="ml-2 text-[var(--text-secondary)]">Loading societies...</span>
        </div>
      ) : societies.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-secondary)]">
          <p>No societies found. Create one to get started!</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {societies.map(society => (
              <motion.div
                key={society.id}
                onClick={() => handleSocietyClick(society)}
                className="bg-[var(--card-bg)] p-4 rounded-lg shadow-sm border border-[var(--secondary)] cursor-pointer hover:shadow-md transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-semibold text-[var(--text-primary)]">{society.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    society.visibility === 'public'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {society.visibility}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-2 line-clamp-2">{society.description}</p>
                <div className="flex justify-between items-center text-xs text-[var(--text-secondary)]">
                  <span>👥 {society.member_count || 0} members</span>
                  {society.focus_type && (
                    <span>📚 Focus: {society.focus_type}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {(societiesPagination.societies.previous || societiesPagination.societies.next) && (
            <div className="flex justify-center gap-2 mt-6">
              <motion.button
                onClick={() => listSocieties({}, societiesPagination.societies.page - 1)}
                disabled={!societiesPagination.societies.previous}
                className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Previous
              </motion.button>
              <span className="px-4 py-2 text-[var(--text-secondary)]">
                Page {societiesPagination.societies.page}
              </span>
              <motion.button
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