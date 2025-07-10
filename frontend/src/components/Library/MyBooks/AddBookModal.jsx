import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../../Common/Modal';
import ImageUpload from '../../Common/ImageUpload';
import SmartBookSearch from '../BookSearch/SmartBookSearch';
import {
  BookOpenIcon,
  UserIcon,
  TagIcon,
  HashtagIcon,
  CalendarIcon,
  DocumentTextIcon,
  ArrowsRightLeftIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const AddBookModal = ({ isOpen, onClose, newBook, setNewBook, onAddBook }) => {
  const [showSmartSearch, setShowSmartSearch] = useState(false);
  const [addMode, setAddMode] = useState('search'); // 'search' or 'manual'

  const inputClasses = "w-full px-3 sm:px-4 py-2.5 sm:py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary placeholder-primary/60 focus:bg-white/20 transition-all duration-300 text-sm sm:text-base";
  const labelClasses = "flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm font-medium text-primary mb-1.5 sm:mb-2";

  const handleBookSelect = (selectedBook) => {
    // Auto-populate form with selected book data
    setNewBook({
      ...newBook,
      title: selectedBook.title || '',
      author: selectedBook.author || '',
      isbn: selectedBook.isbn || '',
      year: selectedBook.year || '',
      genre: selectedBook.genres?.[0] || '',
      synopsis: selectedBook.synopsis || '',
      cover_image_url: selectedBook.cover_image_url || '',
      // Keep existing user preferences
      condition: newBook.condition,
      available_for_exchange: newBook.available_for_exchange,
      available_for_borrow: newBook.available_for_borrow,
    });
    setShowSmartSearch(false);
    setAddMode('manual'); // Switch to manual mode to review/edit
  };

  const handleManualAdd = () => {
    setShowSmartSearch(false);
    setAddMode('manual');
  };

  const resetForm = () => {
    setAddMode('search');
    setShowSmartSearch(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="📚 Add New Book" size="sm">
        <div className="space-y-3 sm:space-y-4 max-h-[80vh] sm:max-h-[70vh] overflow-y-auto pr-1 sm:pr-2">

          {/* Mode Selection */}
          {addMode === 'search' && (
            <motion.div
              className="text-center space-y-4 sm:space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-center">
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl sm:rounded-2xl">
                    <SparklesIcon className="w-8 sm:w-12 h-8 sm:h-12 text-accent" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-lora font-bold text-primary mb-2">
                    How would you like to add your book?
                  </h3>
                  <p className="text-sm sm:text-base text-primary/70 px-2 sm:px-0">
                    Search our database of millions of books or add manually
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:gap-4">
                {/* Smart Search Option */}
                <motion.button
                  onClick={() => setShowSmartSearch(true)}
                  className="p-4 sm:p-6 bg-gradient-to-r from-accent/20 to-primary/20 rounded-xl sm:rounded-2xl border border-white/20 hover:border-accent/50 transition-all group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="p-2 sm:p-3 bg-accent/20 rounded-lg sm:rounded-xl group-hover:bg-accent group-hover:text-white transition-all">
                      <MagnifyingGlassIcon className="w-6 sm:w-8 h-6 sm:h-8 text-accent group-hover:text-white" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-base sm:text-lg font-semibold text-primary group-hover:text-accent transition-colors">
                        🔍 Smart Search <span className="hidden sm:inline">(Recommended)</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-primary/70">
                        Search millions of books from Open Library. Auto-fills title, author, cover, and more!
                      </p>
                    </div>
                  </div>
                </motion.button>

                {/* Manual Add Option */}
                <motion.button
                  onClick={handleManualAdd}
                  className="p-4 sm:p-6 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 hover:border-primary/50 transition-all group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="p-2 sm:p-3 bg-primary/20 rounded-lg sm:rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                      <PlusIcon className="w-6 sm:w-8 h-6 sm:h-8 text-primary group-hover:text-white" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-base sm:text-lg font-semibold text-primary group-hover:text-primary transition-colors">
                        ✏️ Add Manually
                      </h4>
                      <p className="text-xs sm:text-sm text-primary/70">
                        Enter book details yourself. Perfect for rare or self-published books.
                      </p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Manual Form */}
          {addMode === 'manual' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Back Button */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <button
                  onClick={() => setAddMode('search')}
                  className="flex items-center space-x-2 text-primary/70 hover:text-accent transition-colors text-sm"
                >
                  <span>← Back</span>
                </button>
                <button
                  onClick={() => setShowSmartSearch(true)}
                  className="flex items-center space-x-1 text-accent hover:text-accent/80 transition-colors text-xs sm:text-sm px-2 py-1 rounded-lg bg-accent/10"
                >
                  <MagnifyingGlassIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Search</span>
                </button>
              </div>
        {/* Basic Information Section */}
        <motion.div
          className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-base sm:text-lg font-lora font-semibold text-primary flex items-center">
            <BookOpenIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Book Information
          </h3>

          <div>
            <label className={labelClasses}>
              <BookOpenIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Title *</span>
            </label>
            <input
              type="text"
              placeholder="Enter book title"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
              className={inputClasses}
              required
            />
          </div>

          <div>
            <label className={labelClasses}>
              <UserIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Author *</span>
            </label>
            <input
              type="text"
              placeholder="Enter author name"
              value={newBook.author}
              onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
              className={inputClasses}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className={labelClasses}>
                <TagIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Genre</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Fiction, Mystery"
                value={newBook.genre}
                onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>
                <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Year</span>
              </label>
              <input
                type="number"
                placeholder="e.g., 2023"
                value={newBook.year}
                onChange={(e) => setNewBook({ ...newBook, year: e.target.value })}
                className={inputClasses}
                min="1000"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>
              <HashtagIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>ISBN</span>
            </label>
            <input
              type="text"
              placeholder="Enter ISBN-10 or ISBN-13"
              value={newBook.isbn}
              onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
              className={inputClasses}
            />
          </div>
        </motion.div>

        {/* Condition and Synopsis Section */}
        <motion.div
          className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-base sm:text-lg font-lora font-semibold text-primary flex items-center">
            <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Book Details
          </h3>

          <div>
            <label className={labelClasses}>
              <span>Condition</span>
            </label>
            <select
              value={newBook.condition}
              onChange={(e) => setNewBook({ ...newBook, condition: e.target.value })}
              className={inputClasses}
            >
              <option value="new">📗 New - Like brand new</option>
              <option value="good">📘 Good - Minor wear</option>
              <option value="fair">📙 Fair - Noticeable wear</option>
              <option value="poor">📕 Poor - Heavy wear</option>
            </select>
          </div>

          <div>
            <label className={labelClasses}>
              <DocumentTextIcon className="w-4 h-4" />
              <span>Synopsis</span>
            </label>
            <textarea
              placeholder="Brief description of the book..."
              value={newBook.synopsis}
              onChange={(e) => setNewBook({ ...newBook, synopsis: e.target.value })}
              className={`${inputClasses} min-h-[100px] resize-none`}
              rows={4}
            />
          </div>
        </motion.div>

        {/* Image Upload Section */}
        <motion.div
          className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-base sm:text-lg font-lora font-semibold text-primary">📸 Book Cover</h3>

          <ImageUpload
            label="Upload Book Cover"
            onImageSelect={(file) => setNewBook({ ...newBook, cover_image: file })}
            placeholder="Drag and drop an image or click to browse"
            className="w-full"
          />

          <div className="text-center text-primary/60 text-sm">or</div>

          <input
            type="url"
            placeholder="Paste image URL here"
            value={newBook.cover_image_url}
            onChange={(e) => setNewBook({ ...newBook, cover_image_url: e.target.value })}
            className={inputClasses}
          />
        </motion.div>

        {/* Availability Section */}
        <motion.div
          className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-base sm:text-lg font-lora font-semibold text-primary flex items-center">
            <ArrowsRightLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Availability Options
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <motion.label
              className="flex items-center p-2.5 sm:p-3 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer min-h-[44px]"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <input
                type="checkbox"
                checked={newBook.available_for_exchange}
                onChange={(e) => setNewBook({ ...newBook, available_for_exchange: e.target.checked })}
                className="checkbox-enhanced mr-2 sm:mr-3"
              />
              <div>
                <div className="font-medium text-primary text-sm sm:text-base">Available for Exchange</div>
                <div className="text-xs text-primary/60">Allow others to swap books with you</div>
              </div>
            </motion.label>

            <motion.label
              className="flex items-center p-2.5 sm:p-3 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer min-h-[44px]"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <input
                type="checkbox"
                checked={newBook.available_for_borrow}
                onChange={(e) => setNewBook({ ...newBook, available_for_borrow: e.target.checked })}
                className="checkbox-enhanced mr-2 sm:mr-3"
              />
              <div>
                <div className="font-medium text-primary text-sm sm:text-base">Available for Borrow</div>
                <div className="text-xs text-primary/60">Allow others to borrow temporarily</div>
              </div>
            </motion.label>
          </div>
        </motion.div>

              {/* Action Button */}
              <motion.button
                onClick={onAddBook}
                className="w-full bookish-button-enhanced text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg min-h-[44px]"
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                ✨ Add Book to Library
              </motion.button>
            </motion.div>
          )}
        </div>
      </Modal>

      {/* Smart Book Search Modal */}
      <SmartBookSearch
        isOpen={showSmartSearch}
        onClose={() => setShowSmartSearch(false)}
        onBookSelect={handleBookSelect}
        onManualAdd={handleManualAdd}
      />
    </>
  );
};

export default AddBookModal;