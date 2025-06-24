import React, { useState } from 'react';
import { BookmarkIcon, HeartIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

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
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  const handleAction = async (actionName, actionFn, ...args) => {
    setActionLoading(prev => ({ ...prev, [actionName]: true }));
    try {
      await actionFn(...args);
    } finally {
      setActionLoading(prev => ({ ...prev, [actionName]: false }));
    }
  };
  return (
    <motion.div
      className={`bg-[var(--card-bg)] rounded-lg border border-[var(--secondary)] p-4 flex flex-col space-y-4 transition-all duration-200 hover:shadow-lg ${
        onClick ? 'cursor-pointer hover:border-[var(--accent)]' : ''
      } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={onClick}
      whileHover={onClick ? { y: -2 } : {}}
      layout
    >
      {/* Image Section */}
      <div className="relative w-full h-48 bg-[var(--secondary)]/20 rounded-md overflow-hidden">
        {book.cover_image_url || book.book_image_url ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
              </div>
            )}
            <img
              src={book.cover_image_url || book.book_image_url}
              alt={book.title}
              className={`w-full h-full object-cover transition-opacity duration-200 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)]">
            <PhotoIcon className="w-12 h-12" />
          </div>
        )}

        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--secondary)]/20">
            <PhotoIcon className="w-12 h-12 text-[var(--text-secondary)]" />
          </div>
        )}
      </div>
      {/* Book Info */}
      <div className="space-y-1">
        <h3 className="text-lg font-lora font-semibold text-[var(--text-primary)] line-clamp-2">
          {book.title}
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">by {book.author}</p>
        {book.genre && (
          <span className="inline-block px-2 py-1 text-xs bg-[var(--accent)]/10 text-[var(--accent)] rounded-full">
            {book.genre}
          </span>
        )}
        {book.condition && (
          <p className="text-xs text-[var(--text-secondary)]">
            Condition: <span className="capitalize">{book.condition}</span>
          </p>
        )}
      </div>
      {/* Availability Controls */}
      {onUpdateAvailability && (
        <div className="flex items-center space-x-4">
          <label className="flex items-center text-sm text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={book.available_for_exchange}
              onChange={(e) =>
                handleAction('exchange', onUpdateAvailability, book.book_id, {
                  available_for_exchange: e.target.checked
                })
              }
              className="mr-2 rounded border-[var(--secondary)] text-[var(--accent)] focus:ring-[var(--accent)]"
              disabled={
                actionLoading.exchange ||
                (book.locked_until && new Date(book.locked_until) > new Date())
              }
            />
            Exchange
            {actionLoading.exchange && (
              <div className="ml-1 w-3 h-3 border border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
            )}
          </label>
          <label className="flex items-center text-sm text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={book.available_for_borrow}
              onChange={(e) =>
                handleAction('borrow', onUpdateAvailability, book.book_id, {
                  available_for_borrow: e.target.checked
                })
              }
              className="mr-2 rounded border-[var(--secondary)] text-[var(--accent)] focus:ring-[var(--accent)]"
              disabled={
                actionLoading.borrow ||
                (book.locked_until && new Date(book.locked_until) > new Date())
              }
            />
            Borrow
            {actionLoading.borrow && (
              <div className="ml-1 w-3 h-3 border border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
            )}
          </label>
        </div>
      )}
      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-2 border-t border-[var(--secondary)]">
        <div className="flex space-x-2">
          {onBookmark && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleAction('bookmark', onBookmark, book.book_id, isBookmarked);
              }}
              className={`p-2 rounded-full transition-colors relative ${
                isBookmarked
                  ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90'
                  : 'bg-[var(--secondary)] text-[var(--text-secondary)] hover:bg-[var(--secondary)]/80'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
              disabled={actionLoading.bookmark}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BookmarkIcon className="w-4 h-4" />
              {actionLoading.bookmark && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </motion.button>
          )}

          {onFavorite && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleAction('favorite', onFavorite, book.book_id, isFavorited);
              }}
              className={`p-2 rounded-full transition-colors relative ${
                isFavorited
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-[var(--secondary)] text-[var(--text-secondary)] hover:bg-[var(--secondary)]/80'
              }`}
              title={isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
              disabled={actionLoading.favorite}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <HeartIcon className="w-4 h-4" />
              {actionLoading.favorite && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </motion.button>
          )}
        </div>

        {onRemove && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to remove this book?')) {
                handleAction('remove', onRemove, book.book_id);
              }
            }}
            className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors relative"
            title="Remove Book"
            disabled={actionLoading.remove}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <TrashIcon className="w-4 h-4" />
            {actionLoading.remove && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default BookCard;