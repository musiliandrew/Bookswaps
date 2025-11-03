import { useState } from 'react';
import { BookmarkIcon, HeartIcon, TrashIcon, ArrowsRightLeftIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon, HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import OptimizedImage from '../../Common/OptimizedImage';
import { getBookCoverUrl } from '../../../utils/imageUtils';

const BookCard = ({
  book,
  onUpdateAvailability,
  onRemove,
  onBookmark,
  onFavorite,
  isBookmarked,
  isFavorited,
  onClick,
  isLoading = false
}) => {
  const [actionLoading, setActionLoading] = useState({});

  const handleAction = async (actionName, actionFn, ...args) => {
    setActionLoading(prev => ({ ...prev, [actionName]: true }));
    try {
      await actionFn(...args);
    } finally {
      setActionLoading(prev => ({ ...prev, [actionName]: false }));
    }
  };

  const getConditionStyle = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'new':
        return { bg: 'var(--success-100)', text: 'var(--success-700)', border: 'var(--success-200)' };
      case 'good':
        return { bg: 'var(--primary-100)', text: 'var(--primary-700)', border: 'var(--primary-200)' };
      case 'fair':
        return { bg: 'var(--warning-100)', text: 'var(--warning-700)', border: 'var(--warning-200)' };
      case 'poor':
        return { bg: 'var(--danger-100)', text: 'var(--danger-700)', border: 'var(--danger-200)' };
      default:
        return { bg: 'var(--neutral-100)', text: 'var(--neutral-700)', border: 'var(--neutral-200)' };
    }
  };

  const conditionStyle = getConditionStyle(book.condition);

  return (
    <motion.div
      className={`card group relative overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { y: -4, boxShadow: 'var(--shadow-xl)' } : {}}
      transition={{ duration: 0.2 }}
    >
      {/* Book Cover */}
      <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden mb-4"
           style={{ backgroundColor: 'var(--neutral-100)' }}>
        {/* Availability Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {book.available_for_exchange && (
            <motion.div
              className="flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-medium backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(34, 197, 94, 0.9)' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <ArrowsRightLeftIcon className="w-3 h-3" />
              <span className="hidden sm:inline">Swap</span>
            </motion.div>
          )}
          {book.available_for_borrow && (
            <motion.div
              className="flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-medium backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.9)' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <BookOpenIcon className="w-3 h-3" />
              <span className="hidden sm:inline">Borrow</span>
            </motion.div>
          )}
        </div>

        {/* Action Buttons (Hover/Always visible on mobile) */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {onBookmark && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleAction('bookmark', onBookmark, book.book_id, isBookmarked);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm"
              style={{
                backgroundColor: isBookmarked ? 'var(--primary-500)' : 'rgba(255, 255, 255, 0.9)',
                color: isBookmarked ? 'white' : 'var(--neutral-700)'
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={actionLoading.bookmark}
            >
              {isBookmarked ? (
                <BookmarkSolidIcon className="w-4 h-4" />
              ) : (
                <BookmarkIcon className="w-4 h-4" />
              )}
            </motion.button>
          )}
          {onFavorite && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleAction('favorite', onFavorite, book.book_id, isFavorited);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm"
              style={{
                backgroundColor: isFavorited ? 'var(--danger-500)' : 'rgba(255, 255, 255, 0.9)',
                color: isFavorited ? 'white' : 'var(--neutral-700)'
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={actionLoading.favorite}
            >
              {isFavorited ? (
                <HeartSolidIcon className="w-4 h-4" />
              ) : (
                <HeartIcon className="w-4 h-4" />
              )}
            </motion.button>
          )}
          {onRemove && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to remove this book?')) {
                  handleAction('remove', onRemove, book.book_id);
                }
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                color: 'white'
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={actionLoading.remove}
            >
              <TrashIcon className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Book Cover Image */}
        <OptimizedImage
          src={getBookCoverUrl(book, 'M')}
          alt={book.title}
          placeholder="book"
          className="w-full h-full object-cover"
          containerClassName="w-full h-full"
          showLoadingSpinner={true}
          showErrorState={true}
          retryOnError={true}
          maxRetries={3}
          lazy={true}
        />
      </div>

      {/* Book Info */}
      <div className="space-y-2">
        {/* Title */}
        <h3 className="text-base font-semibold line-clamp-2 leading-tight"
            style={{ color: 'var(--neutral-900)' }}>
          {book.title}
        </h3>

        {/* Author */}
        {book.author && (
          <p className="text-sm line-clamp-1" style={{ color: 'var(--neutral-600)' }}>
            {book.author}
          </p>
        )}

        {/* Genres */}
        {book.genres && book.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {book.genres.slice(0, 2).map((genre, index) => (
              <span
                key={index}
                className="badge badge-primary"
                style={{ fontSize: '0.7rem' }}
              >
                {genre}
              </span>
            ))}
            {book.genres.length > 2 && (
              <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                +{book.genres.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Condition Badge */}
        {book.condition && (
          <span
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: conditionStyle.bg,
              color: conditionStyle.text,
              border: `1px solid ${conditionStyle.border}`
            }}
          >
            {book.condition}
          </span>
        )}

        {/* Rating (if exists) */}
        {book.rating && (
          <div className="flex items-center gap-1">
            <StarSolidIcon className="w-4 h-4" style={{ color: 'var(--warning-500)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>
              {book.rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Owner Info (for browse mode) */}
        {book.user?.username && (
          <p className="text-xs" style={{ color: 'var(--neutral-500)' }}>
            Owner: {book.user.username}
          </p>
        )}

        {/* Availability Toggles (for owned books) */}
        {onUpdateAvailability && (
          <div className="flex gap-2 pt-2" style={{ borderTop: '1px solid var(--neutral-200)' }}>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={book.available_for_exchange}
                onChange={(e) => {
                  e.stopPropagation();
                  handleAction('exchange', onUpdateAvailability, book.book_id, {
                    available_for_exchange: e.target.checked
                  });
                }}
                className="rounded"
                disabled={actionLoading.exchange}
              />
              <span style={{ color: 'var(--neutral-700)' }}>Swap</span>
            </label>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={book.available_for_borrow}
                onChange={(e) => {
                  e.stopPropagation();
                  handleAction('borrow', onUpdateAvailability, book.book_id, {
                    available_for_borrow: e.target.checked
                  });
                }}
                className="rounded"
                disabled={actionLoading.borrow}
              />
              <span style={{ color: 'var(--neutral-700)' }}>Borrow</span>
            </label>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BookCard;
