import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLibrary } from '../../hooks/useLibrary';
import { BookmarkIcon } from '@heroicons/react/24/solid';

const BookmarkButton = ({ bookId, isBookmarked, className = '' }) => {
  const { bookmarkBook, removeBookmark, isLoading } = useLibrary();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggle = async () => {
    setIsProcessing(true);
    try {
      if (isBookmarked) {
        await removeBookmark(bookId);
      } else {
        await bookmarkBook(bookId);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.button
      onClick={handleToggle}
      disabled={isLoading || isProcessing}
      className={`bookish-button-enhanced p-2 rounded-xl ${
        isBookmarked ? 'bg-yellow-600' : 'bg-gray-600'
      } ${isLoading || isProcessing ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      whileHover={{ scale: isLoading || isProcessing ? 1 : 1.05 }}
      whileTap={{ scale: isLoading || isProcessing ? 1 : 0.95 }}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <BookmarkIcon className="w-5 h-5 text-white" />
    </motion.button>
  );
};

export default BookmarkButton;