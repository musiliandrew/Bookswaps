import { motion } from 'framer-motion';
import Modal from '../../Common/Modal';
import OptimizedImage from '../../Common/OptimizedImage';
import {
  BookmarkIcon,
  HeartIcon,
  UserIcon,
  ClockIcon,
  ArrowsRightLeftIcon,
  BookOpenIcon,
  StarIcon as StarOutlineIcon
} from '@heroicons/react/24/outline';
import {
  BookmarkIcon as BookmarkSolidIcon,
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid';
import { getBookCoverUrl } from '../../../utils/imageUtils';

const BookDetailModal = ({
  isOpen,
  onClose,
  book,
  onBookmark,
  onFavorite,
  isBookmarked = false,
  isFavorited = false
}) => {
  if (!book) return null;

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
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Book Cover */}
          <div className="flex-shrink-0 w-full md:w-48">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden"
                 style={{ backgroundColor: 'var(--neutral-100)' }}>
              <OptimizedImage
                src={getBookCoverUrl(book, 'L')}
                alt={book.title}
                placeholder="book"
                className="w-full h-full object-cover"
                containerClassName="w-full h-full"
                showLoadingSpinner={true}
                showErrorState={true}
                retryOnError={true}
              />

              {/* Availability Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {book.available_for_exchange && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-medium backdrop-blur-sm"
                       style={{ backgroundColor: 'rgba(34, 197, 94, 0.9)' }}>
                    <ArrowsRightLeftIcon className="w-3 h-3" />
                    <span>Swap</span>
                  </div>
                )}
                {book.available_for_borrow && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-medium backdrop-blur-sm"
                       style={{ backgroundColor: 'rgba(59, 130, 246, 0.9)' }}>
                    <BookOpenIcon className="w-3 h-3" />
                    <span>Borrow</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Book Details */}
          <div className="flex-1 space-y-4">
            {/* Title & Author */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--neutral-900)' }}>
                {book.title}
              </h2>
              {book.author && (
                <p className="text-lg" style={{ color: 'var(--neutral-600)' }}>
                  by {book.author}
                </p>
              )}
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap gap-2">
              {/* Condition */}
              {book.condition && (
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: conditionStyle.bg,
                    color: conditionStyle.text,
                    border: `1px solid ${conditionStyle.border}`
                  }}
                >
                  {book.condition}
                </span>
              )}

              {/* Genre */}
              {book.genre && (
                <span className="badge badge-primary">
                  {book.genre}
                </span>
              )}

              {/* Year */}
              {book.year && (
                <span className="badge badge-neutral">
                  {book.year}
                </span>
              )}

              {/* Copy Count */}
              {book.copy_count > 1 && (
                <span className="badge badge-neutral">
                  {book.copy_count} {book.copy_count === 1 ? 'copy' : 'copies'}
                </span>
              )}
            </div>

            {/* Rating */}
            {book.rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarSolidIcon
                      key={i}
                      className="w-5 h-5"
                      style={{ color: i < Math.floor(book.rating) ? 'var(--warning-500)' : 'var(--neutral-300)' }}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>
                  {book.rating.toFixed(1)}
                </span>
              </div>
            )}

            {/* Owner & Original Owner */}
            <div className="space-y-2">
              {book.user?.username && (
                <div className="flex items-center gap-2 text-sm">
                  <UserIcon className="w-4 h-4" style={{ color: 'var(--neutral-500)' }} />
                  <span style={{ color: 'var(--neutral-600)' }}>
                    Current Owner: <span className="font-medium">{book.user.username}</span>
                  </span>
                </div>
              )}
              {book.original_owner?.username && book.original_owner.username !== book.user?.username && (
                <div className="flex items-center gap-2 text-sm">
                  <UserIcon className="w-4 h-4" style={{ color: 'var(--neutral-500)' }} />
                  <span style={{ color: 'var(--neutral-600)' }}>
                    Original Owner: <span className="font-medium">{book.original_owner.username}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                onClick={() => onBookmark(book.book_id, isBookmarked)}
                className={`btn flex-1 flex items-center justify-center gap-2 ${
                  isBookmarked ? 'btn-secondary' : 'btn-outline'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isBookmarked ? (
                  <BookmarkSolidIcon className="w-5 h-5" />
                ) : (
                  <BookmarkIcon className="w-5 h-5" />
                )}
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </motion.button>

              <motion.button
                onClick={() => onFavorite(book.book_id, isFavorited)}
                className={`btn flex-1 flex items-center justify-center gap-2 ${
                  isFavorited ? 'btn-danger' : 'btn-outline'
                }`}
                style={isFavorited ? {} : { borderColor: 'var(--danger-500)', color: 'var(--danger-600)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isFavorited ? (
                  <HeartSolidIcon className="w-5 h-5" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}
                <span>{isFavorited ? 'Favorited' : 'Favorite'}</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Synopsis */}
        {book.synopsis && (
          <div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--neutral-900)' }}>
              Synopsis
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--neutral-700)' }}>
              {book.synopsis}
            </p>
          </div>
        )}

        {/* ISBN */}
        {book.isbn && (
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--neutral-50)' }}>
            <p className="text-sm">
              <span className="font-medium" style={{ color: 'var(--neutral-700)' }}>ISBN:</span>{' '}
              <span style={{ color: 'var(--neutral-600)' }}>{book.isbn}</span>
            </p>
          </div>
        )}

        {/* History */}
        {book.history && book.history.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--neutral-900)' }}>
              <ClockIcon className="w-5 h-5" />
              Recent History
            </h3>
            <div className="space-y-2">
              {book.history.slice(0, 5).map((historyItem) => (
                <div
                  key={historyItem.history_id}
                  className="p-3 rounded-lg flex items-start gap-3"
                  style={{ backgroundColor: 'var(--neutral-50)' }}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                       style={{ backgroundColor: 'var(--primary-100)' }}>
                    <UserIcon className="w-4 h-4" style={{ color: 'var(--primary-600)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: 'var(--neutral-900)' }}>
                      {historyItem.status}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--neutral-600)' }}>
                      {historyItem.user?.username || 'Anonymous'} •{' '}
                      {new Date(historyItem.start_date).toLocaleDateString()}
                    </p>
                    {historyItem.notes && (
                      <p className="text-xs mt-1" style={{ color: 'var(--neutral-500)' }}>
                        {historyItem.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BookDetailModal;
