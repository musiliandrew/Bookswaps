import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLibrary } from '../../hooks/useLibrary';
import { HeartIcon } from '@heroicons/react/24/solid';

const FavoriteButton = ({ bookId, isFavorited, className = '' }) => {
  const { favoriteBook, unfavoriteBook, isLoading } = useLibrary();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggle = async () => {
    setIsProcessing(true);
    try {
      if (isFavorited) {
        await unfavoriteBook(bookId);
      } else {
        await favoriteBook(bookId);
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
        isFavorited ? 'bg-red-600' : 'bg-gray-600'
      } ${isLoading || isProcessing ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      whileHover={{ scale: isLoading || isProcessing ? 1 : 1.05 }}
      whileTap={{ scale: isLoading || isProcessing ? 1 : 0.95 }}
      aria-label={isFavorited ? 'Remove favorite' : 'Add favorite'}
    >
      <HeartIcon className="w-5 h-5 text-white" />
    </motion.button>
  );
};

export default FavoriteButton;