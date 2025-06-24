import { motion } from 'framer-motion';
import { XMarkIcon, BookOpenIcon, UserIcon } from '@heroicons/react/24/outline';
import Modal from './Modal';

const DuplicateBookModal = ({ isOpen, onClose, duplicateInfo, onViewExisting, onAddAnyway }) => {
  if (!duplicateInfo) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="bookish-glass p-6 rounded-2xl border border-[var(--accent)] bg-opacity-95">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <BookOpenIcon className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text)]">Book Already Exists</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Duplicate Book Info */}
        <div className="mb-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
          <h4 className="font-semibold text-orange-800 mb-2">Existing Book:</h4>
          <div className="space-y-2 text-sm">
            <p className="font-medium text-gray-800">
              📖 {duplicateInfo.title}
            </p>
            <p className="text-gray-600">
              ✍️ by {duplicateInfo.author}
            </p>
            <div className="flex items-center space-x-2 text-gray-600">
              <UserIcon className="w-4 h-4" />
              <span>Owned by {duplicateInfo.owner}</span>
            </div>
          </div>
        </div>

        {/* Message */}
        <p className="text-gray-600 mb-6 text-center">
          This book is already in the system. Would you like to view the existing book or add your copy anyway?
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          <motion.button
            onClick={() => onViewExisting(duplicateInfo.id)}
            className="w-full bookish-button-enhanced bg-blue-600 text-white py-3 rounded-xl font-semibold"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            🔍 View Existing Book
          </motion.button>
          
          <motion.button
            onClick={onAddAnyway}
            className="w-full bookish-button-enhanced bg-green-600 text-white py-3 rounded-xl font-semibold"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            ➕ Add My Copy Anyway
          </motion.button>
          
          <motion.button
            onClick={onClose}
            className="w-full py-3 text-gray-600 font-medium hover:text-gray-800 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

export default DuplicateBookModal;
