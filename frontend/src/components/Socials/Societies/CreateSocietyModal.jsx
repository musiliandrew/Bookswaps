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
          className="bookish-glass rounded-2xl border border-white/20 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl">
                <UsersIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-lora font-bold text-primary">
                  Create New Society
                </h3>
                <p className="text-sm text-primary/70">
                  Build a community around your reading interests
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-primary/70" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary mb-2">
                  Society Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Mystery Book Lovers"
                  className="w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what your society is about..."
                  rows={4}
                  className="w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary resize-none"
                  required
                />
              </div>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-primary mb-3">
                Visibility
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, visibility: 'public' }))}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    formData.visibility === 'public'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-white/20 bg-white/5 text-primary/70 hover:bg-white/10'
                  }`}
                >
                  <GlobeAltIcon className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-semibold">Public</p>
                    <p className="text-xs opacity-70">Anyone can join</p>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, visibility: 'private' }))}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    formData.visibility === 'private'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-white/20 bg-white/5 text-primary/70 hover:bg-white/10'
                  }`}
                >
                  <LockClosedIcon className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-semibold">Private</p>
                    <p className="text-xs opacity-70">Invite only</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Focus Type */}
            <div>
              <label className="block text-sm font-medium text-primary mb-3">
                Society Focus (Optional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, focus_type: '' }))}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    !formData.focus_type
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-white/20 bg-white/5 text-primary/70 hover:bg-white/10'
                  }`}
                >
                  <UsersIcon className="w-5 h-5" />
                  <span className="font-semibold">General</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, focus_type: 'Genre' }))}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    formData.focus_type === 'Genre'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-white/20 bg-white/5 text-primary/70 hover:bg-white/10'
                  }`}
                >
                  <TagIcon className="w-5 h-5" />
                  <span className="font-semibold">Genre</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, focus_type: 'Book' }))}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    formData.focus_type === 'Book'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-white/20 bg-white/5 text-primary/70 hover:bg-white/10'
                  }`}
                >
                  <BookOpenIcon className="w-5 h-5" />
                  <span className="font-semibold">Book</span>
                </button>
              </div>
            </div>

            {/* Genre Selection */}
            {formData.focus_type === 'Genre' && (
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Select Genre
                </label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary mb-3"
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
                    className="w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary"
                  />
                )}
              </div>
            )}

            {/* Book Selection */}
            {formData.focus_type === 'Book' && (
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Select Book
                </label>
                <select
                  value={formData.focus_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, focus_id: e.target.value }))}
                  className="w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary"
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

            {/* Icon URL */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Society Icon URL (Optional)
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="url"
                    value={formData.icon_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon_url: e.target.value }))}
                    placeholder="https://example.com/icon.jpg"
                    className="w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary"
                  />
                </div>
                <button
                  type="button"
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-primary"
                >
                  <PhotoIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.name.trim() || !formData.description.trim()}
                className="flex-1 bookish-button-enhanced text-white py-3 rounded-xl disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Society'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateSocietyModal;
