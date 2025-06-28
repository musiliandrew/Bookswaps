import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocieties } from '../../../hooks/useSocieties';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  PinIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import {
  PinIcon as PinIconSolid
} from '@heroicons/react/24/solid';

const MessagePinning = ({ 
  message, 
  societyId, 
  canPin = false, 
  showPinButton = true,
  compact = false 
}) => {
  const { profile } = useAuth();
  const { pinSocietyMessage, isLoading } = useSocieties();
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePin = async () => {
    if (!message || !societyId) return;

    try {
      const result = await pinSocietyMessage(societyId, message.message_id, {
        action: message.is_pinned ? 'unpin' : 'pin'
      });
      
      if (result) {
        toast.success(message.is_pinned ? 'Message unpinned' : 'Message pinned');
        setShowConfirm(false);
      }
    } catch (error) {
      toast.error('Failed to update pin status');
      console.error('Pin error:', error);
    }
  };

  if (!canPin && !message?.is_pinned) return null;

  return (
    <div className="relative">
      {/* Pin Button */}
      {showPinButton && canPin && (
        <motion.button
          onClick={() => setShowConfirm(true)}
          disabled={isLoading}
          className={`p-1 rounded transition-all duration-200 ${
            message?.is_pinned
              ? 'text-yellow-500 hover:text-yellow-400'
              : 'text-primary/50 hover:text-primary/70 hover:bg-white/10'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title={message?.is_pinned ? 'Unpin message' : 'Pin message'}
        >
          {message?.is_pinned ? (
            <PinIconSolid className="w-4 h-4" />
          ) : (
            <PinIcon className="w-4 h-4" />
          )}
        </motion.button>
      )}

      {/* Pinned Indicator */}
      {message?.is_pinned && !compact && (
        <div className="flex items-center gap-1 text-xs text-yellow-500 mb-1">
          <PinIconSolid className="w-3 h-3" />
          <span>Pinned message</span>
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              className="absolute bottom-full right-0 mb-2 z-50 bookish-glass rounded-xl border border-white/20 p-4 shadow-xl min-w-64"
            >
              <h4 className="font-semibold text-primary mb-2">
                {message?.is_pinned ? 'Unpin Message' : 'Pin Message'}
              </h4>
              <p className="text-sm text-primary/70 mb-4">
                {message?.is_pinned 
                  ? 'This message will no longer be pinned to the top of the chat.'
                  : 'This message will be pinned to the top of the chat for all members to see.'
                }
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-primary text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePin}
                  disabled={isLoading}
                  className={`flex-1 px-3 py-2 rounded-lg transition-colors text-white text-sm ${
                    message?.is_pinned
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-yellow-500 hover:bg-yellow-600'
                  } disabled:opacity-50`}
                >
                  {isLoading ? 'Processing...' : (message?.is_pinned ? 'Unpin' : 'Pin')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Pinned Messages Display Component
export const PinnedMessagesSection = ({ 
  messages = [], 
  societyId, 
  canPin = false,
  onMessageClick 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const pinnedMessages = messages.filter(m => m.is_pinned);
  
  if (pinnedMessages.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 bookish-glass rounded-xl border border-yellow-500/20 bg-yellow-500/5"
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <PinIconSolid className="w-4 h-4 text-yellow-500" />
          <span className="font-semibold text-primary">
            Pinned Messages ({pinnedMessages.length})
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="w-4 h-4 text-primary/70" />
        </motion.div>
      </div>

      {/* Pinned Messages List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-yellow-500/20"
          >
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
              {pinnedMessages.map((message) => (
                <motion.div
                  key={message.message_id}
                  className="p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => onMessageClick?.(message)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-primary text-sm">
                          {message.sender?.username || 'Unknown'}
                        </span>
                        <span className="text-xs text-primary/50">
                          {new Date(message.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-primary/80 text-sm line-clamp-2">
                        {message.content}
                      </p>
                    </div>
                    
                    {canPin && (
                      <MessagePinning
                        message={message}
                        societyId={societyId}
                        canPin={canPin}
                        showPinButton={true}
                        compact={true}
                      />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MessagePinning;
