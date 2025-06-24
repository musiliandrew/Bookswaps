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
      listSocieties({}, pagination.societies.page); // Refresh current page
    }
  };

  const handleLeaveSociety = async (societyId) => {
    const response = await leaveSociety(societyId);
    if (response) {
      toast.success('Left society successfully!');
      listSocieties({}, pagination.societies.page); // Refresh current page
    }
  };

  const handleSocietySelect = (society) => {
    setSelectedSociety(society);
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => listSocieties({}, 1)}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90"
        >
          Retry
        </button>
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
          className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showCreateForm ? 'Cancel' : 'Create Society'}
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
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90"
            >
              Create First Society
            </button>
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
                      <motion.button
                        onClick={() => handleLeaveSociety(society.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Leave
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={() => handleJoinSociety(society.id)}
                        className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Join
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => handleSocietySelect(society)}
                      className="px-4 py-2 bg-[var(--secondary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--secondary)]/80 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Details
                    </motion.button>
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
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setSelectedSociety(null)}
                className="flex-1 px-4 py-2 bg-[var(--secondary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--secondary)]/80"
              >
                Close
              </button>
              {!selectedSociety.is_member && (
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
    </div>
  );
};

export default SocietiesView;
