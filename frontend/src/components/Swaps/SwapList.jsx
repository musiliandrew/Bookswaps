import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  BookOpenIcon, 
  MapPinIcon, 
  CalendarIcon,
  CheckIcon,
  XMarkIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const SwapList = ({ 
  swaps, 
  isLoading, 
  pagination, 
  onAccept, 
  onConfirm, 
  onCancel, 
  onLoadMore,
  getStatusIcon,
  getStatusColor,
  currentUserId 
}) => {
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [qrCode, setQrCode] = useState('');

  const handleConfirmSwap = (swapId) => {
    if (!qrCode.trim()) {
      alert('Please enter the QR code to confirm the swap');
      return;
    }
    onConfirm(swapId, { qr_code: qrCode });
    setQrCode('');
    setSelectedSwap(null);
  };

  const isInitiator = (swap) => swap.initiator?.user_id === currentUserId;
  const isReceiver = (swap) => swap.receiver?.user_id === currentUserId;

  const canAccept = (swap) => isReceiver(swap) && swap.status === 'Requested';
  const canConfirm = (swap) => swap.status === 'Accepted';
  const canCancel = (swap) => ['Requested', 'Accepted'].includes(swap.status);

  if (isLoading && swaps.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
        <span className="ml-2 text-[var(--text-secondary)]">Loading swaps...</span>
      </div>
    );
  }

  if (swaps.length === 0) {
    return (
      <div className="text-center py-12 bg-[var(--card-bg)] rounded-lg border border-[var(--secondary)]">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Active Swaps</h3>
        <p className="text-[var(--text-secondary)]">
          Start by proposing a swap with another reader!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {swaps.map((swap) => (
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
                  {isInitiator(swap) ? 'Swap Proposed' : 'Swap Received'}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {formatDistanceToNow(new Date(swap.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(swap.status)}`}>
              {swap.status}
            </span>
          </div>

          {/* Participants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Initiator */}
            <div className="flex items-start gap-3 p-3 bg-[var(--secondary)]/20 rounded-lg">
              <UserIcon className="w-5 h-5 text-[var(--accent)] mt-1" />
              <div className="flex-1">
                <p className="font-medium text-[var(--text-primary)]">
                  {swap.initiator?.username || 'Unknown User'}
                  {isInitiator(swap) && <span className="text-xs text-[var(--accent)] ml-1">(You)</span>}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">Proposing</p>
                {swap.initiator_book && (
                  <div className="flex items-center gap-2 mt-2">
                    <BookOpenIcon className="w-4 h-4 text-[var(--text-secondary)]" />
                    <span className="text-sm text-[var(--text-primary)]">
                      {swap.initiator_book.title}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Receiver */}
            <div className="flex items-start gap-3 p-3 bg-[var(--secondary)]/20 rounded-lg">
              <UserIcon className="w-5 h-5 text-[var(--accent)] mt-1" />
              <div className="flex-1">
                <p className="font-medium text-[var(--text-primary)]">
                  {swap.receiver?.username || 'Unknown User'}
                  {isReceiver(swap) && <span className="text-xs text-[var(--accent)] ml-1">(You)</span>}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">Receiving</p>
                {swap.receiver_book && (
                  <div className="flex items-center gap-2 mt-2">
                    <BookOpenIcon className="w-4 h-4 text-[var(--text-secondary)]" />
                    <span className="text-sm text-[var(--text-primary)]">
                      {swap.receiver_book.title}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Meetup Details */}
          {(swap.meetup_location || swap.meetup_time) && (
            <div className="flex flex-wrap gap-4 mb-4 p-3 bg-[var(--secondary)]/10 rounded-lg">
              {swap.meetup_location && (
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span className="text-sm text-[var(--text-primary)]">
                    {swap.meetup_location.name}
                  </span>
                </div>
              )}
              {swap.meetup_time && (
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span className="text-sm text-[var(--text-primary)]">
                    {new Date(swap.meetup_time).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {canAccept(swap) && (
              <motion.button
                onClick={() => onAccept(swap.swap_id)}
                className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CheckIcon className="w-4 h-4" />
                Accept Swap
              </motion.button>
            )}

            {canConfirm(swap) && (
              <motion.button
                onClick={() => setSelectedSwap(swap.swap_id)}
                className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <QrCodeIcon className="w-4 h-4" />
                Confirm Swap
              </motion.button>
            )}

            {canCancel(swap) && (
              <motion.button
                onClick={() => onCancel(swap.swap_id)}
                className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <XMarkIcon className="w-4 h-4" />
                Cancel
              </motion.button>
            )}
          </div>
        </motion.div>
      ))}

      {/* QR Code Confirmation Modal */}
      {selectedSwap && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSwap(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[var(--card-bg)] p-6 rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Confirm Swap with QR Code
            </h3>
            <p className="text-[var(--text-secondary)] mb-4">
              Enter the QR code provided by the other party to confirm the swap completion.
            </p>
            <input
              type="text"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="Enter QR code"
              className="w-full px-3 py-2 border border-[var(--secondary)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedSwap(null)}
                className="flex-1 px-4 py-2 bg-[var(--secondary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--secondary)]/80"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmSwap(selectedSwap)}
                className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

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

export default SwapList;
