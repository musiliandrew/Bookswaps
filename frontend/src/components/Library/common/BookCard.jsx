import React, { useState, useRef } from 'react';
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

  // Mobile interaction states
  const [dragX, setDragX] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const lastTap = useRef(0);
  const tapTimeout = useRef(null);

  const handleAction = async (actionName, actionFn, ...args) => {
    setActionLoading(prev => ({ ...prev, [actionName]: true }));
    try {
      await actionFn(...args);
    } finally {
      setActionLoading(prev => ({ ...prev, [actionName]: false }));
    }
  };

  // Handle double tap to like
  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (lastTap.current && (now - lastTap.current) < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (onFavorite) {
        handleAction('favorite', onFavorite, book.book_id, isFavorited);
      }
      lastTap.current = 0;
    } else {
      // Single tap
      lastTap.current = now;
      if (tapTimeout.current) clearTimeout(tapTimeout.current);

      tapTimeout.current = setTimeout(() => {
        if (onClick) onClick();
        lastTap.current = 0;
      }, DOUBLE_TAP_DELAY);
    }
  };

  // Handle swipe gestures
  const handleDragEnd = (event, info) => {
    const threshold = 100;

    if (info.offset.x > threshold) {
      // Swipe right - show actions
      setShowActions(true);
    } else if (info.offset.x < -threshold) {
      // Swipe left - hide actions
      setShowActions(false);
    } else {
      // Snap back
      setDragX(0);
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
      className={`group relative overflow-hidden transition-all duration-300 ${
        // Mobile: Full width card
        'w-full mx-auto bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl ' +
        // Desktop: Compact card
        'sm:bookish-glass sm:rounded-2xl sm:p-6 sm:flex sm:flex-col sm:space-y-4 ' +
        (onClick ? 'cursor-pointer hover:border-accent/50' : '') + ' ' +
        (isLoading ? 'opacity-50 pointer-events-none' : '')
      }`}
      onTap={handleTap}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      whileHover={onClick ? {
        y: -2,
        scale: 1.005,
        boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.15)"
      } : {}}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, x: dragX }}
      transition={{ duration: 0.3 }}
    >
      {/* Mobile: Horizontal Layout */}
      <div className="sm:hidden flex p-4 space-x-4">
        {/* Book Cover - Enhanced Visibility */}
        <div className="relative w-24 h-32 bg-gradient-to-br from-white/90 to-gray-100/90 rounded-lg overflow-hidden flex-shrink-0 shadow-xl border border-white/30 backdrop-blur-sm">
          {/* Availability Badges */}
          <div className="absolute top-1 left-1 z-10 flex flex-col gap-1">
            {book.available_for_exchange && (
              <motion.div
                className="bg-emerald-500/90 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-0.5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <ArrowsRightLeftIcon className="w-2.5 h-2.5" />
              </motion.div>
            )}
            {book.available_for_borrow && (
              <motion.div
                className="bg-blue-500/90 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-0.5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <BookOpenIcon className="w-2.5 h-2.5" />
              </motion.div>
            )}
          </div>

          {book.cover_image_url || book.book_image_url ? (
            <div className="relative w-full h-full">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <img
                src={book.cover_image_url || book.book_image_url}
                alt={book.title}
                className="w-full h-full object-cover transition-opacity duration-300"
                style={{ opacity: imageLoading ? 0 : 1 }}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <BookOpenIcon className="w-8 h-8 text-primary/60" />
            </div>
          )}
        </div>

        {/* Book Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-primary line-clamp-2 mb-1">
              {book.title}
            </h3>
            {book.author && (
              <p className="text-sm text-primary/70 mb-2">by {book.author}</p>
            )}

            {/* Genres */}
            {book.genres && book.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {book.genres.slice(0, 2).map((genre, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full"
                  >
                    {genre}
                  </span>
                ))}
                {book.genres.length > 2 && (
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                    +{book.genres.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Quick availability toggles */}
              {onUpdateAvailability && (
                <>
                  <motion.label className="flex items-center space-x-1 cursor-pointer">
                    <div className="w-4 h-4 rounded bg-emerald-500/20 flex items-center justify-center">
                      <ArrowsRightLeftIcon className="w-2.5 h-2.5 text-emerald-600" />
                    </div>
                    <input
                      type="checkbox"
                      checked={book.available_for_exchange}
                      onChange={(e) =>
                        handleAction('exchange', onUpdateAvailability, book.book_id, {
                          available_for_exchange: e.target.checked
                        })
                      }
                      className="w-3 h-3 rounded border border-white/30 bg-white/10 checked:bg-emerald-500 checked:border-emerald-500"
                    />
                  </motion.label>

                  <motion.label className="flex items-center space-x-1 cursor-pointer">
                    <div className="w-4 h-4 rounded bg-blue-500/20 flex items-center justify-center">
                      <BookOpenIcon className="w-2.5 h-2.5 text-blue-600" />
                    </div>
                    <input
                      type="checkbox"
                      checked={book.available_for_borrow}
                      onChange={(e) =>
                        handleAction('borrow', onUpdateAvailability, book.book_id, {
                          available_for_borrow: e.target.checked
                        })
                      }
                      className="w-3 h-3 rounded border border-white/30 bg-white/10 checked:bg-blue-500 checked:border-blue-500"
                    />
                  </motion.label>
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2">
              {onBookmark && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction('bookmark', onBookmark, book.book_id, isBookmarked);
                  }}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isBookmarked
                      ? 'bg-accent text-white'
                      : 'bg-white/20 text-primary/70 hover:bg-white/30'
                  }`}
                  whileTap={{ scale: 0.9 }}
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
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isFavorited
                      ? 'bg-red-500 text-white'
                      : 'bg-white/20 text-primary/70 hover:bg-white/30'
                  }`}
                  whileTap={{ scale: 0.9 }}
                >
                  {isFavorited ? (
                    <HeartSolidIcon className="w-4 h-4" />
                  ) : (
                    <HeartIcon className="w-4 h-4" />
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Original Vertical Layout */}
      <div className="hidden sm:block">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl pointer-events-none" />

        {/* Image Section with Enhanced Design */}
        <div className="relative w-full h-56 bg-gradient-to-br from-white/90 to-gray-100/90 rounded-xl overflow-hidden group-hover:shadow-xl transition-all duration-300 border border-white/30 backdrop-blur-sm">
        {/* Availability Badges */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10 flex flex-col gap-1">
          {book.available_for_exchange && (
            <motion.div
              className="bg-emerald-500/90 backdrop-blur-sm text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium flex items-center gap-0.5 sm:gap-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <ArrowsRightLeftIcon className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
              <span className="hidden sm:inline">Swap</span>
            </motion.div>
          )}
          {book.available_for_borrow && (
            <motion.div
              className="bg-blue-500/90 backdrop-blur-sm text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium flex items-center gap-0.5 sm:gap-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <BookOpenIcon className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
              <span className="hidden sm:inline">Borrow</span>
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
          <div className="w-full h-full flex items-center justify-center text-primary/60 bg-gradient-to-br from-primary/20 to-accent/20">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <BookOpenIcon className="w-16 h-16" />
            </motion.div>
          </div>
        )}

        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <BookOpenIcon className="w-16 h-16 text-primary/60" />
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
      <div className="space-y-2 sm:space-y-3 flex-grow">
        <div className="space-y-1 sm:space-y-2">
          <motion.h3
            className="text-base sm:text-xl font-lora font-bold text-primary line-clamp-2 group-hover:text-accent transition-colors duration-300"
            whileHover={{ scale: 1.02 }}
          >
            {book.title}
          </motion.h3>
          <p className="text-sm text-primary/70 font-medium">by {book.author}</p>

          {/* Enhanced Genre and Condition Tags */}
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {book.genre && (
              <motion.span
                className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium bg-gradient-to-r from-accent/20 to-primary/20 text-primary border border-accent/30 rounded-full"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <StarIcon className="w-2.5 sm:w-3 h-2.5 sm:h-3 mr-0.5 sm:mr-1" />
                <span className="truncate max-w-[60px] sm:max-w-none">{book.genre}</span>
              </motion.span>
            )}
            {book.condition && (
              <motion.span
                className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium rounded-full border ${getConditionColor(book.condition)}`}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <span className="capitalize truncate max-w-[50px] sm:max-w-none">{book.condition}</span>
              </motion.span>
            )}
          </div>

          {/* Year and Additional Info */}
          {book.year && (
            <p className="text-xs text-primary/60 hidden sm:block">Published: {book.year}</p>
          )}
        </div>
      </div>
      {/* Enhanced Availability Controls - Ultra Compact Mobile */}
      {onUpdateAvailability && (
        <>
          {/* Mobile: Inline with action buttons */}
          <div className="sm:hidden flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center space-x-3">
              <motion.label
                className="flex items-center space-x-1 cursor-pointer"
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-4 h-4 rounded bg-emerald-500/20 flex items-center justify-center">
                  <ArrowsRightLeftIcon className="w-2.5 h-2.5 text-emerald-600" />
                </div>
                <input
                  type="checkbox"
                  checked={book.available_for_exchange}
                  onChange={(e) =>
                    handleAction('exchange', onUpdateAvailability, book.book_id, {
                      available_for_exchange: e.target.checked
                    })
                  }
                  className="w-3 h-3 rounded border border-white/30 bg-white/10 checked:bg-emerald-500 checked:border-emerald-500"
                  disabled={
                    actionLoading.exchange ||
                    (book.locked_until && new Date(book.locked_until) > new Date())
                  }
                />
              </motion.label>

              <motion.label
                className="flex items-center space-x-1 cursor-pointer"
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-4 h-4 rounded bg-blue-500/20 flex items-center justify-center">
                  <BookOpenIcon className="w-2.5 h-2.5 text-blue-600" />
                </div>
                <input
                  type="checkbox"
                  checked={book.available_for_borrow}
                  onChange={(e) =>
                    handleAction('borrow', onUpdateAvailability, book.book_id, {
                      available_for_borrow: e.target.checked
                    })
                  }
                  className="w-3 h-3 rounded border border-white/30 bg-white/10 checked:bg-blue-500 checked:border-blue-500"
                  disabled={
                    actionLoading.borrow ||
                    (book.locked_until && new Date(book.locked_until) > new Date())
                  }
                />
              </motion.label>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex space-x-2">
              {onBookmark && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction('bookmark', onBookmark, book.book_id, isBookmarked);
                  }}
                  className={`relative p-2 rounded-lg transition-all duration-300 ${
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
                    <BookmarkSolidIcon className="w-4 h-4" />
                  ) : (
                    <BookmarkIcon className="w-4 h-4" />
                  )}
                  {actionLoading.bookmark && (
                    <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                  className={`relative p-2 rounded-lg transition-all duration-300 ${
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
                    <HeartSolidIcon className="w-4 h-4" />
                  ) : (
                    <HeartIcon className="w-4 h-4" />
                  )}
                  {actionLoading.favorite && (
                    <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
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
                  className="relative p-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg shadow-red-500/25 border border-red-400/20"
                  title="Remove Book"
                  disabled={actionLoading.remove}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <TrashIcon className="w-4 h-4" />
                  {actionLoading.remove && (
                    <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </motion.button>
              )}
            </div>
          </div>

          {/* Desktop: Original layout */}
          <div className="hidden sm:block p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/10">
            <h4 className="text-sm font-semibold text-primary mb-2">Availability Settings</h4>
            <div className="grid grid-cols-1 gap-3">
            <motion.label
              className="flex items-center justify-between p-1.5 sm:p-3 bg-white/10 rounded-md sm:rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-1.5 sm:space-x-3">
                <ArrowsRightLeftIcon className="w-3 sm:w-4 h-3 sm:h-4 text-emerald-600" />
                <span className="text-xs sm:text-sm font-medium text-primary">
                  <span className="sm:hidden">Swap</span>
                  <span className="hidden sm:inline">Available for Exchange</span>
                </span>
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
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 border border-accent border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </motion.label>

            <motion.label
              className="flex items-center justify-between p-1.5 sm:p-3 bg-white/10 rounded-md sm:rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-1.5 sm:space-x-3">
                <BookOpenIcon className="w-3 sm:w-4 h-3 sm:h-4 text-blue-600" />
                <span className="text-xs sm:text-sm font-medium text-primary">
                  <span className="sm:hidden">Borrow</span>
                  <span className="hidden sm:inline">Available for Borrow</span>
                </span>
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
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 border border-accent border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </motion.label>
          </div>
        </div>
        </>
      )}

      {/* Mobile Action Buttons - For cards without availability controls */}
      {!onUpdateAvailability && (
        <div className="sm:hidden flex items-center justify-end pt-2 border-t border-white/10">
          <div className="flex space-x-2">
            {onBookmark && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('bookmark', onBookmark, book.book_id, isBookmarked);
                }}
                className={`relative p-2 rounded-lg transition-all duration-300 ${
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
                  <BookmarkSolidIcon className="w-4 h-4" />
                ) : (
                  <BookmarkIcon className="w-4 h-4" />
                )}
                {actionLoading.bookmark && (
                  <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                className={`relative p-2 rounded-lg transition-all duration-300 ${
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
                  <HeartSolidIcon className="w-4 h-4" />
                ) : (
                  <HeartIcon className="w-4 h-4" />
                )}
                {actionLoading.favorite && (
                  <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </motion.button>
            )}
          </div>
        </div>
      )}
      {/* Enhanced Action Buttons - Desktop Only */}
      <div className={`hidden sm:flex justify-between items-center pt-4 border-t border-white/10`}>
        <div className="flex space-x-3">
          {onBookmark && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleAction('bookmark', onBookmark, book.book_id, isBookmarked);
              }}
              className={`relative p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 ${
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
                <BookmarkSolidIcon className="w-4 sm:w-5 h-4 sm:h-5" />
              ) : (
                <BookmarkIcon className="w-4 sm:w-5 h-4 sm:h-5" />
              )}
              {actionLoading.bookmark && (
                <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg sm:rounded-xl">
                  <div className="w-3 sm:w-4 h-3 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
              className={`relative p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 ${
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
                <HeartSolidIcon className="w-4 sm:w-5 h-4 sm:h-5" />
              ) : (
                <HeartIcon className="w-4 sm:w-5 h-4 sm:h-5" />
              )}
              {actionLoading.favorite && (
                <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg sm:rounded-xl">
                  <div className="w-3 sm:w-4 h-3 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
            className="relative p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg shadow-red-500/25 border border-red-400/20"
            title="Remove Book"
            disabled={actionLoading.remove}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <TrashIcon className="w-4 sm:w-5 h-4 sm:h-5" />
            {actionLoading.remove && (
              <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg sm:rounded-xl">
                <div className="w-3 sm:w-4 h-3 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </motion.button>
        )}
      </div>
      </div>

      {/* Mobile Swipe Actions Overlay */}
      <motion.div
        className="sm:hidden absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-red-500/90 to-transparent flex items-center justify-end pr-4"
        initial={{ opacity: 0, x: 100 }}
        animate={{
          opacity: showActions ? 1 : 0,
          x: showActions ? 0 : 100
        }}
        transition={{ duration: 0.3 }}
      >
        {onRemove && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to remove this book?')) {
                handleAction('remove', onRemove, book.book_id);
              }
            }}
            className="p-3 rounded-full bg-red-500 text-white shadow-lg"
            whileTap={{ scale: 0.9 }}
          >
            <TrashIcon className="w-5 h-5" />
          </motion.button>
        )}
      </motion.div>

      {/* Double tap heart animation */}
      <motion.div
        className="sm:hidden absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isFavorited ? [0, 1.2, 1] : 0,
          opacity: isFavorited ? [0, 1, 0] : 0
        }}
        transition={{ duration: 0.6 }}
      >
        <HeartSolidIcon className="w-16 h-16 text-red-500" />
      </motion.div>
    </motion.div>
  );
};

export default BookCard;