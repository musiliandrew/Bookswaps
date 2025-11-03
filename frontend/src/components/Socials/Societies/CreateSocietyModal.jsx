import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocieties } from '../../../hooks/useSocieties';
import { useLibrary } from '../../../hooks/useLibrary';
import { toast } from 'react-toastify';
import {
  XMarkIcon,
  UsersIcon,
  BookOpenIcon,
  TagIcon,
  GlobeAltIcon,
  LockClosedIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const CreateSocietyModal = ({ isOpen, onClose, onSuccess }) => {
  const { createSociety, isLoading } = useSocieties();
  const { books } = useLibrary();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'public',
    focus_type: '',
    focus_id: '',
    icon_url: ''
  });
  
  const [selectedGenre, setSelectedGenre] = useState('');
  const [customGenre, setCustomGenre] = useState('');

  const genres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
    'Fantasy', 'Biography', 'History', 'Self-Help', 'Poetry',
    'Horror', 'Thriller', 'Adventure', 'Comedy', 'Drama'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Society name is required');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    const societyData = { ...formData };
    
    // Handle focus type and ID
    if (formData.focus_type === 'Genre') {
      societyData.focus_id = selectedGenre === 'custom' ? customGenre : selectedGenre;
    }

    try {
      const result = await createSociety(societyData);
      if (result) {
        toast.success('Society created successfully!');
        onSuccess?.(result);
        onClose();
        resetForm();
      }
    } catch (error) {
      toast.error('Failed to create society');
      console.error('Society creation error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      visibility: 'public',
      focus_type: '',
      focus_id: '',
      icon_url: ''
    });
    setSelectedGenre('');
    setCustomGenre('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="bg-[var(--secondary)] rounded-2xl border border-[var(--primary)]/20 p-3 sm:p-4 w-full max-w-sm sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-hidden mx-2 sm:mx-4"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--primary)]/20 rounded-lg">
                <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-lora font-bold text-[var(--primary)]">
                  Create Society
                </h3>
                <p className="text-xs sm:text-sm text-[var(--primary)]/70 hidden sm:block">
                  Build a reading community
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-[var(--primary)]/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <XMarkIcon className="w-5 h-5 text-[var(--primary)]/70" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Basic Information */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[var(--primary)] mb-1.5">
                    Society Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Mystery Book Lovers"
                    className="w-full px-3 py-2.5 bg-[var(--bg-card)]/80 border border-[var(--primary)]/20 rounded-xl text-[var(--primary)] text-sm focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[var(--primary)] mb-1.5">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what your society is about..."
                    rows={3}
                    className="w-full px-3 py-2.5 bg-[var(--bg-card)]/80 border border-[var(--primary)]/20 rounded-xl text-[var(--primary)] text-sm focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 resize-none"
                    required
                  />
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[var(--primary)] mb-1.5">
                    Visibility
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, visibility: 'public' }))}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all min-h-[44px] ${
                        formData.visibility === 'public'
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                          : 'border-[var(--primary)]/20 bg-[var(--bg-card)]/50 text-[var(--primary)]/70 hover:bg-[var(--primary)]/10'
                      }`}
                    >
                      <GlobeAltIcon className="w-4 h-4" />
                      <div className="text-left">
                        <p className="font-semibold text-xs">Public</p>
                        <p className="text-xs opacity-70 hidden sm:block">Anyone can join</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, visibility: 'private' }))}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all min-h-[44px] ${
                        formData.visibility === 'private'
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                          : 'border-[var(--primary)]/20 bg-[var(--bg-card)]/50 text-[var(--primary)]/70 hover:bg-[var(--primary)]/10'
                      }`}
                    >
                      <LockClosedIcon className="w-4 h-4" />
                      <div className="text-left">
                        <p className="font-semibold text-xs">Private</p>
                        <p className="text-xs opacity-70 hidden sm:block">Invite only</p>
                      </div>
                    </button>
              </div>
            </div>

                {/* Focus Type */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[var(--primary)] mb-1.5">
                    Society Focus (Optional)
                  </label>
                  <select
                    value={formData.focus_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, focus_type: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[var(--bg-card)]/80 border border-[var(--primary)]/20 rounded-xl text-[var(--primary)] text-sm focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                  >
                    <option value="">👥 General Discussion</option>
                    <option value="Genre">🏷️ Genre Focused</option>
                    <option value="Book">📚 Book Focused</option>
                  </select>
                </div>

                {/* Genre Selection */}
                {formData.focus_type === 'Genre' && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[var(--primary)] mb-1.5">
                      Select Genre
                    </label>
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[var(--bg-card)]/80 border border-[var(--primary)]/20 rounded-xl text-[var(--primary)] text-sm focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 mb-2"
                    >
                      <option value="">Choose a genre</option>
                      {genres.map((genre) => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                      <option value="custom">Custom Genre</option>
                    </select>

                    {selectedGenre === 'custom' && (
                      <input
                        type="text"
                        value={customGenre}
                        onChange={(e) => setCustomGenre(e.target.value)}
                        placeholder="Enter custom genre"
                        className="w-full px-3 py-2.5 bg-[var(--bg-card)]/80 border border-[var(--primary)]/20 rounded-xl text-[var(--primary)] text-sm focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                      />
                    )}
                  </div>
                )}

                {/* Book Selection */}
                {formData.focus_type === 'Book' && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[var(--primary)] mb-1.5">
                      Select Book
                    </label>
                    <select
                      value={formData.focus_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, focus_id: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-[var(--bg-card)]/80 border border-[var(--primary)]/20 rounded-xl text-[var(--primary)] text-sm focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                    >
                      <option value="">Choose a book</option>
                      {books?.map((book) => (
                        <option key={book.book_id} value={book.book_id}>
                          {book.title} by {book.author}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 sm:pt-4 border-t border-[var(--primary)]/20 mt-3 sm:mt-4 -mx-3 sm:-mx-4 px-3 sm:px-4 bg-[var(--secondary)]">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-3 py-2.5 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 rounded-xl transition-colors text-[var(--primary)] text-sm min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.name.trim() || !formData.description.trim()}
                  className="flex-1 btn btn-primary text-white py-2.5 rounded-xl disabled:opacity-50 text-sm min-h-[44px]"
                >
                  {isLoading ? 'Creating...' : 'Create Society'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateSocietyModal;
