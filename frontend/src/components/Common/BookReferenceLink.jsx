import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpenIcon, UserIcon, StarIcon } from '@heroicons/react/24/outline';
import { useBooks } from '../../hooks/useBooks';

const BookPreviewTooltip = ({ book, position, onClose }) => {
  if (!book) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm"
        style={{
          left: Math.min(position.x, window.innerWidth - 384),
          top: Math.max(position.y - 10, 10),
        }}
        onMouseEnter={(e) => e.stopPropagation()}
        onMouseLeave={onClose}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {book.cover_image ? (
              <img 
                src={book.cover_image} 
                alt={book.title}
                className="w-16 h-20 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded flex items-center justify-center">
                <BookOpenIcon className="w-8 h-8 text-amber-600" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
              {book.title}
            </h4>
            <p className="text-xs text-gray-600 mb-2">
              by {book.author}
            </p>
            
            {book.genre && (
              <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded mb-2">
                {book.genre}
              </span>
            )}
            
            {book.rating && (
              <div className="flex items-center space-x-1 mb-2">
                <StarIcon className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs text-gray-600">{book.rating}/5</span>
              </div>
            )}
            
            {book.description && (
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                {book.description}
              </p>
            )}
            
            {book.owner && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <UserIcon className="w-3 h-3" />
                <span>Owned by {book.owner}</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 text-xs text-blue-600 font-medium flex items-center justify-between">
          <span>Click to view in library →</span>
          {book.available_for_exchange && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
              Available for swap
            </span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const BookReferenceLink = ({ 
  bookId, 
  title, 
  author = null,
  displayText = null,
  className = "",
  showTooltip = true,
  onBookClick = null 
}) => {
  const [hoveredBook, setHoveredBook] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const { getBook } = useBooks();

  const handleBookHover = async (bookId, event) => {
    if (!showTooltip) return;
    
    const rect = event.target.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 5
    });

    try {
      const book = await getBook(bookId);
      if (book) {
        setHoveredBook(book);
      }
    } catch (error) {
      console.error('Failed to fetch book:', error);
    }
  };

  const handleBookClick = (bookId) => {
    if (onBookClick) {
      onBookClick(bookId);
    } else {
      navigate(`/library/book/${bookId}`);
    }
  };

  const getDisplayText = () => {
    if (displayText) return displayText;
    if (title && author) return `${title} by ${author}`;
    if (title) return title;
    return `Book #${bookId.slice(0, 8)}`;
  };

  return (
    <div className="relative inline-block">
      <motion.span
        className={`inline-flex items-center space-x-1.5 bg-gradient-to-r from-[var(--secondary)]/80 to-[var(--accent)]/20 text-[var(--primary)] px-3 py-1.5 rounded-full cursor-pointer hover:from-[var(--accent)]/30 hover:to-[var(--secondary)]/60 transition-all duration-200 font-medium shadow-sm border border-[var(--primary)]/20 ${className}`}
        onMouseEnter={(e) => handleBookHover(bookId, e)}
        onMouseLeave={() => setHoveredBook(null)}
        onClick={() => handleBookClick(bookId)}
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.95 }}
      >
        <BookOpenIcon className="w-4 h-4 text-[var(--primary)]" />
        <span className="text-xs font-semibold">|</span>
        <span className="text-sm font-lora font-semibold">{getDisplayText()}</span>
      </motion.span>

      {/* Book preview tooltip */}
      {hoveredBook && showTooltip && (
        <BookPreviewTooltip
          book={hoveredBook}
          position={tooltipPosition}
          onClose={() => setHoveredBook(null)}
        />
      )}
    </div>
  );
};

export default BookReferenceLink;
