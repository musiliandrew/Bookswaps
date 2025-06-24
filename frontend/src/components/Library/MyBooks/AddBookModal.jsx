import React from 'react';
import { motion } from 'framer-motion';
import Modal from '../../Common/Modal';
import ImageUpload from '../../Common/ImageUpload';
import { BookOpenIcon, UserIcon, TagIcon, HashtagIcon, CalendarIcon, DocumentTextIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

const AddBookModal = ({ isOpen, onClose, newBook, setNewBook, onAddBook }) => {
  const inputClasses = "w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary placeholder-primary/60 focus:bg-white/20 transition-all duration-300";
  const labelClasses = "flex items-center space-x-2 text-sm font-medium text-primary mb-2";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📚 Add New Book to Your Library">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Basic Information Section */}
        <motion.div
          className="space-y-4 p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-lora font-semibold text-primary flex items-center">
            <BookOpenIcon className="w-5 h-5 mr-2" />
            Book Information
          </h3>

          <div>
            <label className={labelClasses}>
              <BookOpenIcon className="w-4 h-4" />
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
              <UserIcon className="w-4 h-4" />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>
                <TagIcon className="w-4 h-4" />
                <span>Genre</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Fiction, Mystery, Romance"
                value={newBook.genre}
                onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>
                <CalendarIcon className="w-4 h-4" />
                <span>Publication Year</span>
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
              <HashtagIcon className="w-4 h-4" />
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
          className="space-y-4 p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-lora font-semibold text-primary flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-2" />
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
          className="space-y-4 p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-lora font-semibold text-primary">📸 Book Cover</h3>

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
          className="space-y-4 p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-lora font-semibold text-primary flex items-center">
            <ArrowsRightLeftIcon className="w-5 h-5 mr-2" />
            Availability Options
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.label
              className="flex items-center p-3 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="checkbox"
                checked={newBook.available_for_exchange}
                onChange={(e) => setNewBook({ ...newBook, available_for_exchange: e.target.checked })}
                className="checkbox-enhanced mr-3"
              />
              <div>
                <div className="font-medium text-primary">Available for Exchange</div>
                <div className="text-xs text-primary/60">Allow others to swap books with you</div>
              </div>
            </motion.label>

            <motion.label
              className="flex items-center p-3 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="checkbox"
                checked={newBook.available_for_borrow}
                onChange={(e) => setNewBook({ ...newBook, available_for_borrow: e.target.checked })}
                className="checkbox-enhanced mr-3"
              />
              <div>
                <div className="font-medium text-primary">Available for Borrow</div>
                <div className="text-xs text-primary/60">Allow others to borrow temporarily</div>
              </div>
            </motion.label>
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.button
          onClick={onAddBook}
          className="w-full bookish-button-enhanced text-white py-4 rounded-xl font-semibold text-lg shadow-lg"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          ✨ Add Book to Library
        </motion.button>
      </div>
    </Modal>
  );
};

export default AddBookModal;