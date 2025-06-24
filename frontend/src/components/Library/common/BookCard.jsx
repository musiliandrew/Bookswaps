import React, { useState } from 'react';
import { BookmarkIcon, HeartIcon, TrashIcon, PhotoIcon, StarIcon, ArrowsRightLeftIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
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
  const [isHovered, setIsHovered] = useState(false);

  const handleAction = async (actionName, actionFn, ...args) => {
    setActionLoading(prev => ({ ...prev, [actionName]: true }));
    try {
      await actionFn(...args);
    } finally {
      setActionLoading(prev => ({ ...prev, [actionName]: false }));
    }
  };

  const getConditionColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'new': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fair': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'poor': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  return (
    <motion.div
      className={`group relative bookish-glass rounded-2xl p-6 flex flex-col space-y-4 transition-all duration-300 border border-white/20 backdrop-blur-xl ${
        onClick ? 'cursor-pointer hover:border-accent/50' : ''
      } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={onClick ? {
        y: -8,
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl pointer-events-none" />

      {/* Image Section with Enhanced Design */}
      <div className="relative w-full h-56 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl overflow-hidden group-hover:shadow-xl transition-all duration-300">
        {/* Availability Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {book.available_for_exchange && (
            <motion.div
              className="bg-emerald-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <ArrowsRightLeftIcon className="w-3 h-3" />
              Swap
            </motion.div>
          )}
          {book.available_for_borrow && (
            <motion.div
              className="bg-blue-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <BookOpenIcon className="w-3 h-3" />
              Borrow
            </motion.div>
          )}
        </div>

        {book.cover_image_url || book.book_image_url ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                <motion.div
                  className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            )}
            <motion.img
              src={book.cover_image_url || book.book_image_url}
              alt={book.title}
              className={`w-full h-full object-cover transition-all duration-300 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              } ${isHovered ? 'scale-110' : 'scale-100'}`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary/40 bg-gradient-to-br from-primary/5 to-accent/5">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <PhotoIcon className="w-16 h-16" />
            </motion.div>
          </div>
        )}

        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <PhotoIcon className="w-16 h-16 text-primary/40" />
          </div>
        )}

        {/* Hover Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
      </div>
      {/* Enhanced Book Info */}
      <div className="space-y-3 flex-grow">
        <div className="space-y-2">
          <motion.h3
            className="text-xl font-lora font-bold text-primary line-clamp-2 group-hover:text-accent transition-colors duration-300"
            whileHover={{ scale: 1.02 }}
          >
            {book.title}
          </motion.h3>
          <p className="text-sm text-primary/70 font-medium">by {book.author}</p>

          {/* Enhanced Genre and Condition Tags */}
          <div className="flex flex-wrap gap-2">
            {book.genre && (
              <motion.span
                className="inline-flex items-center px-3 py-1 text-xs font-medium bg-gradient-to-r from-accent/20 to-primary/20 text-primary border border-accent/30 rounded-full"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <StarIcon className="w-3 h-3 mr-1" />
                {book.genre}
              </motion.span>
            )}
            {book.condition && (
              <motion.span
                className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getConditionColor(book.condition)}`}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <span className="capitalize">{book.condition}</span>
              </motion.span>
            )}
          </div>

          {/* Year and Additional Info */}
          {book.year && (
            <p className="text-xs text-primary/60">Published: {book.year}</p>
          )}
        </div>
      </div>
      {/* Enhanced Availability Controls */}
      {onUpdateAvailability && (
        <div className="space-y-3 p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/10">
          <h4 className="text-sm font-semibold text-primary mb-2">Availability Settings</h4>
          <div className="grid grid-cols-1 gap-3">
            <motion.label
              className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <ArrowsRightLeftIcon className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-primary">Available for Exchange</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={book.available_for_exchange}
                  onChange={(e) =>
                    handleAction('exchange', onUpdateAvailability, book.book_id, {
                      available_for_exchange: e.target.checked
                    })
                  }
                  className="checkbox-enhanced"
                  disabled={
                    actionLoading.exchange ||
                    (book.locked_until && new Date(book.locked_until) > new Date())
                  }
                />
                {actionLoading.exchange && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </motion.label>

            <motion.label
              className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <BookOpenIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-primary">Available for Borrow</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={book.available_for_borrow}
                  onChange={(e) =>
                    handleAction('borrow', onUpdateAvailability, book.book_id, {
                      available_for_borrow: e.target.checked
                    })
                  }
                  className="checkbox-enhanced"
                  disabled={
                    actionLoading.borrow ||
                    (book.locked_until && new Date(book.locked_until) > new Date())
                  }
                />
                {actionLoading.borrow && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </motion.label>
          </div>
        </div>
      )}
      {/* Enhanced Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-white/10">
        <div className="flex space-x-3">
          {onBookmark && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleAction('bookmark', onBookmark, book.book_id, isBookmarked);
              }}
              className={`relative p-3 rounded-xl transition-all duration-300 ${
                isBookmarked
                  ? 'bg-gradient-to-r from-accent to-accent/80 text-white shadow-lg shadow-accent/25'
                  : 'bg-white/10 text-primary/70 hover:bg-white/20 hover:text-primary border border-white/20'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
              disabled={actionLoading.bookmark}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {isBookmarked ? (
                <BookmarkSolidIcon className="w-5 h-5" />
              ) : (
                <BookmarkIcon className="w-5 h-5" />
              )}
              {actionLoading.bookmark && (
                <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
              className={`relative p-3 rounded-xl transition-all duration-300 ${
                isFavorited
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25'
                  : 'bg-white/10 text-primary/70 hover:bg-white/20 hover:text-red-500 border border-white/20'
              }`}
              title={isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
              disabled={actionLoading.favorite}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {isFavorited ? (
                <HeartSolidIcon className="w-5 h-5" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
              {actionLoading.favorite && (
                <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
            className="relative p-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg shadow-red-500/25 border border-red-400/20"
            title="Remove Book"
            disabled={actionLoading.remove}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <TrashIcon className="w-5 h-5" />
            {actionLoading.remove && (
              <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default BookCard;