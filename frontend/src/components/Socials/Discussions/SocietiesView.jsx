import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useSocieties } from '../../../hooks/useSocieties';
import SocietyCreationForm from '../Chat/SocietyCreationForm';

const SocietiesView = () => {
  const {
    createSociety,
    listSocieties,
    joinSociety,
    leaveSociety,
    societies,
    isLoading,
    error,
    pagination,
  } = useSocieties();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSociety, setNewSociety] = useState({
    name: '',
    description: '',
    visibility: 'public',
    focus_type: 'books',
    focus_id: '',
  });
  const [selectedSociety, setSelectedSociety] = useState(null);

  useEffect(() => {
    listSocieties({}, 1);
  }, [listSocieties]);

  const handleCreateSociety = async (e) => {
    e.preventDefault();
    const response = await createSociety(newSociety);
    if (response) {
      setNewSociety({ name: '', description: '', visibility: 'public', focus_type: 'books', focus_id: '' });
      setShowCreateForm(false);
      toast.success('Society created successfully!');
      listSocieties({}, 1); // Refresh the list
    }
  };

  const handleJoinSociety = async (societyId) => {
    const response = await joinSociety(societyId);
    if (response) {
      toast.success('Joined society successfully!');
      // The hook already updates the local state, no need to refresh from server
    }
  };

  const handleLeaveSociety = async (societyId) => {
    const response = await leaveSociety(societyId);
    if (response) {
      toast.success('Left society successfully!');
      // The hook already updates the local state, no need to refresh from server
    }
  };

  const handleSocietySelect = (society) => {
    setSelectedSociety(society);
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <motion.button
          onClick={() => listSocieties({}, 1)}
          className="flex items-center gap-2 px-4 py-2 btn btn-primary text-white rounded-lg font-open-sans font-medium transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Book Societies</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Join communities of book lovers and discuss your favorite reads
          </p>
        </div>
        <motion.button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-6 py-3 btn btn-primary text-white rounded-xl font-open-sans font-semibold transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showCreateForm ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Society
            </>
          )}
        </motion.button>
      </div>

      {/* Create Society Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--secondary)]"
        >
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Create New Society</h3>
          <SocietyCreationForm
            newSociety={newSociety}
            setNewSociety={setNewSociety}
            handleCreateSociety={handleCreateSociety}
          />
        </motion.div>
      )}

      {/* Societies List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
            <span className="ml-2 text-[var(--text-secondary)]">Loading societies...</span>
          </div>
        ) : societies.length === 0 ? (
          <div className="text-center py-12 bg-[var(--card-bg)] rounded-lg border border-[var(--secondary)]">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Societies Yet</h3>
            <p className="text-[var(--text-secondary)] mb-4">
              Be the first to create a book society and start building a community!
            </p>
            <motion.button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-6 py-3 btn btn-primary text-white rounded-xl font-open-sans font-semibold transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create First Society
            </motion.button>
          </div>
        ) : (
          <>
            {societies.map((society) => (
              <motion.div
                key={society.id}
                className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--secondary)] hover:shadow-md transition-all duration-200"
                whileHover={{ scale: 1.01 }}
                layout
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-[var(--text-primary)]">{society.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        society.visibility === 'public' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {society.visibility}
                      </span>
                    </div>
                    <p className="text-[var(--text-secondary)] mb-3">{society.description}</p>
                    <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1">
                        👥 {society.member_count || 0} members
                      </span>
                      {society.focus_type && (
                        <span className="flex items-center gap-1">
                          📚 Focus: {society.focus_type}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        📅 Created {society.created_at && !isNaN(new Date(society.created_at).getTime())
                          ? new Date(society.created_at).toLocaleDateString()
                          : 'Unknown'
                        }
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {society.is_member ? (
                      <>
                        <motion.button
                          onClick={() => handleSocietySelect(society)}
                          className="flex-1 flex items-center justify-center gap-1 px-4 py-2 btn btn-primary text-white rounded-lg font-open-sans font-semibold transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Open
                        </motion.button>
                        <motion.button
                          onClick={() => handleLeaveSociety(society.id || society.society_id)}
                          className="px-4 py-2 rounded-lg font-open-sans font-medium transition-all hover:opacity-80"
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'var(--text-primary)'
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Leave
                        </motion.button>
                      </>
                    ) : (
                      <motion.button
                        onClick={() => handleJoinSociety(society.id || society.society_id)}
                        className="w-full flex items-center justify-center gap-1 btn btn-primary text-white px-4 py-2 rounded-lg font-open-sans font-semibold transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Join Society
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Pagination */}
            {(pagination.societies.previous || pagination.societies.next) && (
              <div className="flex justify-center gap-2 mt-6">
                <motion.button
                  onClick={() => listSocieties({}, pagination.societies.page - 1)}
                  disabled={!pagination.societies.previous}
                  className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Previous
                </motion.button>
                <span className="px-4 py-2 text-[var(--text-secondary)] flex items-center">
                  Page {pagination.societies.page}
                </span>
                <motion.button
                  onClick={() => listSocieties({}, pagination.societies.page + 1)}
                  disabled={!pagination.societies.next}
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
            className="bg-[var(--card-bg)] p-6 rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">{selectedSociety.name}</h3>
            <p className="text-[var(--text-secondary)] mb-4">{selectedSociety.description}</p>
            <div className="space-y-2 text-sm">
              <p><strong>Visibility:</strong> {selectedSociety.visibility}</p>
              <p><strong>Members:</strong> {selectedSociety.member_count || 0}</p>
              <p><strong>Focus:</strong> {selectedSociety.focus_type || 'General'}</p>
              <p><strong>Created:</strong> {selectedSociety.created_at && !isNaN(new Date(selectedSociety.created_at).getTime())
                ? new Date(selectedSociety.created_at).toLocaleDateString()
                : 'Unknown'
              }</p>
            </div>
            <div className="flex gap-3 mt-6">
              <motion.button
                onClick={() => setSelectedSociety(null)}
                className="flex-1 px-4 py-2 card border border-white/20 text-[var(--primary)] rounded-lg hover:bg-[var(--bg-card)]/20 transition-all font-open-sans font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Close
              </motion.button>
              {selectedSociety.is_member ? (
                <motion.button
                  onClick={() => {
                    handleLeaveSociety(selectedSociety.id || selectedSociety.society_id);
                    setSelectedSociety(null);
                  }}
                  className="flex-1 px-4 py-2 card border border-white/20 text-[var(--text-primary)] hover:bg-[var(--bg-card)]/10 rounded-lg transition-all font-open-sans font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Leave Society
                </motion.button>
              ) : selectedSociety.visibility === 'public' && (
                <motion.button
                  onClick={() => {
                    handleJoinSociety(selectedSociety.id || selectedSociety.society_id);
                    setSelectedSociety(null);
                  }}
                  className="flex-1 px-4 py-2 btn btn-primary text-white rounded-lg font-open-sans font-semibold transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Join Society
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SocietiesView;
