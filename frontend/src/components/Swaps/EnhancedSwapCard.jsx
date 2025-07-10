import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpenIcon, 
  UserIcon, 
  MapPinIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  QrCodeIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const EnhancedSwapCard = ({ 
  swap, 
  currentUserId, 
  onAccept, 
  onCancel, 
  onShowQR, 
  onShowLocation,
  onConfirm 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isInitiator = swap.initiator?.user_id === currentUserId;
  const isReceiver = swap.receiver?.user_id === currentUserId;
  const otherUser = isInitiator ? swap.receiver : swap.initiator;
  const myBook = isInitiator ? swap.initiator_book : swap.receiver_book;
  const theirBook = isInitiator ? swap.receiver_book : swap.initiator_book;

  const getStatusInfo = () => {
    switch (swap.status) {
      case 'Requested':
        return {
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          icon: <ClockIcon className="w-4 h-4" />,
          text: isReceiver ? 'Awaiting your response' : 'Waiting for response'
        };
      case 'Accepted':
        return {
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          icon: <MapPinIcon className="w-4 h-4" />,
          text: 'Ready for meetup'
        };
      case 'Confirmed':
        return {
          color: 'text-green-600 bg-green-50 border-green-200',
          icon: <CheckCircleIcon className="w-4 h-4" />,
          text: 'Exchange completed'
        };
      case 'Cancelled':
        return {
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: <XCircleIcon className="w-4 h-4" />,
          text: 'Cancelled'
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: <ClockIcon className="w-4 h-4" />,
          text: swap.status
        };
    }
  };

  const statusInfo = getStatusInfo();

  const canAccept = isReceiver && swap.status === 'Requested';
  const canCancel = ['Requested', 'Accepted'].includes(swap.status);
  const canShowQR = swap.status === 'Accepted';
  const canConfirm = swap.status === 'Accepted';

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">
                Swap with {otherUser?.username}
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {new Date(swap.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center space-x-1 ${statusInfo.color}`}>
            {statusInfo.icon}
            <span>{statusInfo.text}</span>
          </div>
        </div>
      </div>

      {/* Books Exchange */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* My Book */}
          <div className="flex-1">
            <div className="text-xs text-[var(--text-secondary)] mb-1">
              {isInitiator ? 'You offer' : 'You receive'}
            </div>
            <div className="flex items-center space-x-2">
              <BookOpenIcon className="w-4 h-4 text-[var(--primary)]" />
              <div>
                <p className="font-medium text-sm">{myBook?.title || 'No book specified'}</p>
                <p className="text-xs text-[var(--text-secondary)]">{myBook?.author}</p>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="px-4">
            <ArrowRightIcon className="w-5 h-5 text-[var(--accent)]" />
          </div>

          {/* Their Book */}
          <div className="flex-1">
            <div className="text-xs text-[var(--text-secondary)] mb-1">
              {isInitiator ? 'You receive' : 'They offer'}
            </div>
            <div className="flex items-center space-x-2">
              <BookOpenIcon className="w-4 h-4 text-[var(--accent)]" />
              <div>
                <p className="font-medium text-sm">{theirBook?.title || 'Any book'}</p>
                <p className="text-xs text-[var(--text-secondary)]">{theirBook?.author || 'To be decided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Meetup Location */}
        {swap.meetup_location && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="w-4 h-4 text-blue-600" />
              <div>
                <p className="font-medium text-sm text-blue-900">Meetup Location</p>
                <p className="text-xs text-blue-700">{swap.meetup_location.name}</p>
                <p className="text-xs text-blue-600">{swap.meetup_location.city}</p>
              </div>
            </div>
          </div>
        )}

        {/* Meetup Time */}
        {swap.meetup_time && (
          <div className="mt-2 flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
            <ClockIcon className="w-4 h-4" />
            <span>Scheduled: {new Date(swap.meetup_time).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex flex-wrap gap-2">
          {canAccept && (
            <motion.button
              onClick={() => onAccept(swap.swap_id)}
              className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Accept Swap
            </motion.button>
          )}

          {canShowQR && (
            <motion.button
              onClick={() => onShowQR(swap)}
              className="flex items-center space-x-1 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <QrCodeIcon className="w-4 h-4" />
              <span>Show QR</span>
            </motion.button>
          )}

          {swap.meetup_location && (
            <motion.button
              onClick={() => onShowLocation(swap)}
              className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MapPinIcon className="w-4 h-4" />
              <span>Location</span>
            </motion.button>
          )}

          {canCancel && (
            <motion.button
              onClick={() => onCancel(swap.swap_id)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
          )}
        </div>

        {/* Instructions based on status */}
        {swap.status === 'Accepted' && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-900">Ready for Exchange!</p>
                <p className="text-amber-700 mt-1">
                  1. Meet at the specified location<br/>
                  2. Both scan QR codes to verify presence<br/>
                  3. Exchange books and complete the swap
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EnhancedSwapCard;
