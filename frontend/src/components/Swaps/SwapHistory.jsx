import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  BookOpenIcon, 
  CalendarIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const SwapHistory = ({ 
  swapHistory, 
  isLoading, 
  pagination, 
  onLoadMore,
  getStatusIcon,
  getStatusColor,
  currentUserId 
}) => {
  const isInitiator = (swap) => swap.initiator?.user_id === currentUserId;

  if (isLoading && swapHistory.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
        <span className="ml-2 text-[var(--text-secondary)]">Loading swap history...</span>
      </div>
    );
  }

  if (swapHistory.length === 0) {
    return (
      <div className="text-center py-12 bg-[var(--card-bg)] rounded-lg border border-[var(--secondary)]">
        <div className="text-6xl mb-4">📖</div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Swap History</h3>
        <p className="text-[var(--text-secondary)]">
          Your completed and cancelled swaps will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {swapHistory.map((swap) => (
        <motion.div
          key={swap.swap_id}
          className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--secondary)] hover:shadow-md transition-all duration-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          layout
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(swap.status)}
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">
                  {isInitiator(swap) ? 'Swap Initiated' : 'Swap Participated'}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {formatDistanceToNow(new Date(swap.updated_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(swap.status)}`}>
                {swap.status}
              </span>
              {swap.status === 'Completed' && (
                <StarIcon className="w-5 h-5 text-yellow-500" />
              )}
            </div>
          </div>

          {/* Swap Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Initiator Side */}
            <div className="flex items-start gap-3 p-3 bg-[var(--secondary)]/20 rounded-lg">
              <UserIcon className="w-5 h-5 text-[var(--accent)] mt-1" />
              <div className="flex-1">
                <p className="font-medium text-[var(--text-primary)]">
                  {swap.initiator?.username || 'Unknown User'}
                  {isInitiator(swap) && <span className="text-xs text-[var(--accent)] ml-1">(You)</span>}
                </p>
                <p className="text-sm text-[var(--text-secondary)] mb-2">Offered</p>
                {swap.initiator_book && (
                  <div className="flex items-start gap-2">
                    <BookOpenIcon className="w-4 h-4 text-[var(--text-secondary)] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {swap.initiator_book.title}
                      </p>
                      {swap.initiator_book.author && (
                        <p className="text-xs text-[var(--text-secondary)]">
                          by {swap.initiator_book.author}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Receiver Side */}
            <div className="flex items-start gap-3 p-3 bg-[var(--secondary)]/20 rounded-lg">
              <UserIcon className="w-5 h-5 text-[var(--accent)] mt-1" />
              <div className="flex-1">
                <p className="font-medium text-[var(--text-primary)]">
                  {swap.receiver?.username || 'Unknown User'}
                  {!isInitiator(swap) && <span className="text-xs text-[var(--accent)] ml-1">(You)</span>}
                </p>
                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  {swap.receiver_book ? 'Exchanged' : 'Received'}
                </p>
                {swap.receiver_book ? (
                  <div className="flex items-start gap-2">
                    <BookOpenIcon className="w-4 h-4 text-[var(--text-secondary)] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {swap.receiver_book.title}
                      </p>
                      {swap.receiver_book.author && (
                        <p className="text-xs text-[var(--text-secondary)]">
                          by {swap.receiver_book.author}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-secondary)] italic">
                    No book exchanged (one-way swap)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="border-t border-[var(--secondary)] pt-4">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <CalendarIcon className="w-4 h-4" />
              <span>
                Created {swap.created_at && !isNaN(new Date(swap.created_at).getTime())
                  ? formatDistanceToNow(new Date(swap.created_at), { addSuffix: true })
                  : 'recently'
                }
              </span>
              {swap.updated_at !== swap.created_at && (
                <>
                  <span>•</span>
                  <span>
                    {swap.status.toLowerCase()} {swap.updated_at && !isNaN(new Date(swap.updated_at).getTime())
                      ? formatDistanceToNow(new Date(swap.updated_at), { addSuffix: true })
                      : 'recently'
                    }
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Success Message for Completed Swaps */}
          {swap.status === 'Completed' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <StarIcon className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-800 font-medium">
                  Swap completed successfully! 
                </p>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Both parties confirmed the exchange. Happy reading! 📚
              </p>
            </div>
          )}

          {/* Cancellation Note */}
          {swap.status === 'Cancelled' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                This swap was cancelled. No books were exchanged.
              </p>
            </div>
          )}
        </motion.div>
      ))}

      {/* Pagination */}
      {pagination.next && (
        <div className="text-center mt-6">
          <motion.button
            onClick={() => onLoadMore(pagination.page + 1)}
            className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default SwapHistory;
