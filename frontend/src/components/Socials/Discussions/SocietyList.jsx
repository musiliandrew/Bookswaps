import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import SocietyFilters from './SocietyFilters';

const SocietyList = ({ societies, isSocietiesLoading, joinSociety, leaveSociety, listSocieties, societyFilters, setSocietyFilters, societiesPagination, societiesError }) => {
  const [selectedSociety, setSelectedSociety] = useState(null);

  const handleJoinSociety = async (societyId) => {
    const response = await joinSociety(societyId);
    if (response) {
      toast.success('Joined society successfully!');
      listSocieties(societyFilters, societiesPagination.societies.page); // Refresh current page
    }
  };

  const handleLeaveSociety = async (societyId) => {
    const response = await leaveSociety(societyId);
    if (response) {
      toast.success('Left society successfully!');
      listSocieties(societyFilters, societiesPagination.societies.page); // Refresh current page
    }
  };

  const handleSocietyClick = (society) => {
    setSelectedSociety(society);
  };

  if (societiesError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{societiesError}</p>
        <button
          onClick={() => listSocieties(societyFilters, 1)}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Book Societies</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Join communities of book lovers and discuss your favorite reads
          </p>
        </div>
      </div>

      {/* Filters */}
      <SocietyFilters societyFilters={societyFilters} setSocietyFilters={setSocietyFilters} />

      {/* Loading State */}
      {isSocietiesLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
          <span className="ml-2 text-[var(--text-secondary)]">Loading societies...</span>
        </div>
      ) : societies.length === 0 ? (
        <div className="text-center py-12 bg-[var(--card-bg)] rounded-lg border border-[var(--secondary)]">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Societies Found</h3>
          <p className="text-[var(--text-secondary)] mb-4">
            Try adjusting your filters or check back later for new societies.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {societies.map(society => (
            <motion.div
              key={society.id}
              className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--secondary)] hover:shadow-md transition-all duration-200 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSocietyClick(society)}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                  {society.name}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  society.visibility === 'public'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {society.visibility}
                </span>
              </div>

              <p className="text-[var(--text-secondary)] text-sm mb-3 line-clamp-2">{society.description}</p>

              <div className="flex justify-between items-center text-xs text-[var(--text-secondary)] mb-4">
                <span className="flex items-center gap-1">
                  👥 {society.member_count || 0} members
                </span>
                {society.focus_type && (
                  <span className="flex items-center gap-1">
                    📚 {society.focus_type}
                  </span>
                )}
              </div>

              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                {society.is_member ? (
                  <motion.button
                    onClick={() => handleLeaveSociety(society.id)}
                    className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Leave
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={() => handleJoinSociety(society.id)}
                    className="flex-1 px-3 py-2 bg-[var(--accent)] text-white text-sm rounded-lg hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={society.visibility === 'private'}
                    title={society.visibility === 'private' ? 'Private society - invitation required' : 'Join society'}
                    whileHover={{ scale: society.visibility === 'private' ? 1 : 1.05 }}
                    whileTap={{ scale: society.visibility === 'private' ? 1 : 0.95 }}
                  >
                    {society.visibility === 'private' ? 'Private' : 'Join'}
                  </motion.button>
                )}
                <motion.button
                  onClick={() => handleSocietyClick(society)}
                  className="px-3 py-2 bg-[var(--secondary)] text-[var(--text-primary)] text-sm rounded-lg hover:bg-[var(--secondary)]/80 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {(societiesPagination.societies.previous || societiesPagination.societies.next) && (
        <div className="flex justify-center gap-2 mt-6">
          <motion.button
            onClick={() => listSocieties(societyFilters, societiesPagination.societies.page - 1)}
            disabled={!societiesPagination.societies.previous}
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Previous
          </motion.button>
          <span className="px-4 py-2 text-[var(--text-secondary)] flex items-center">
            Page {societiesPagination.societies.page}
          </span>
          <motion.button
            onClick={() => listSocieties(societyFilters, societiesPagination.societies.page + 1)}
            disabled={!societiesPagination.societies.next}
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Next
          </motion.button>
        </div>
      )}

      {/* Society Details Modal */}
      {selectedSociety && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSociety(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[var(--card-bg)] p-6 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">{selectedSociety.name}</h3>
              <button
                onClick={() => setSelectedSociety(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xl"
              >
                ×
              </button>
            </div>

            <p className="text-[var(--text-secondary)] mb-4">{selectedSociety.description}</p>

            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <span className="font-medium">Visibility:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  selectedSociety.visibility === 'public'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedSociety.visibility}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Members:</span>
                <span>{selectedSociety.member_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Focus:</span>
                <span>{selectedSociety.focus_type || 'General'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Created:</span>
                <span>{new Date(selectedSociety.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedSociety(null)}
                className="flex-1 px-4 py-2 bg-[var(--secondary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--secondary)]/80"
              >
                Close
              </button>
              {selectedSociety.is_member ? (
                <button
                  onClick={() => {
                    handleLeaveSociety(selectedSociety.id);
                    setSelectedSociety(null);
                  }}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Leave Society
                </button>
              ) : selectedSociety.visibility === 'public' && (
                <button
                  onClick={() => {
                    handleJoinSociety(selectedSociety.id);
                    setSelectedSociety(null);
                  }}
                  className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90"
                >
                  Join Society
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SocietyList;