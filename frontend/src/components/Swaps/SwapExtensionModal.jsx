import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwaps } from '../../hooks/useSwaps';
import { toast } from 'react-toastify';
import {
  ClockIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const SwapExtensionModal = ({ 
  isOpen, 
  onClose, 
  swap, 
  extensionRequest = null, 
  mode = 'request' // 'request' or 'respond'
}) => {
  const { requestExtension, respondToExtension, isLoading } = useSwaps();
  const [formData, setFormData] = useState({
    days: 7,
    reason: '',
    response: 'approved' // 'approved' or 'denied'
  });

  const handleRequestExtension = async () => {
    if (!formData.reason.trim()) {
      toast.error('Please provide a reason for the extension');
      return;
    }

    try {
      const result = await requestExtension(swap.swap_id, {
        extension_days: formData.days,
        reason: formData.reason
      });
      
      if (result) {
        toast.success('Extension request sent successfully!');
        onClose();
      }
    } catch (error) {
      toast.error('Failed to request extension');
      console.error('Extension request error:', error);
    }
  };

  const handleRespondToExtension = async (response) => {
    try {
      const result = await respondToExtension(extensionRequest.extension_id, {
        response,
        admin_notes: formData.reason
      });
      
      if (result) {
        toast.success(`Extension ${response}!`);
        onClose();
      }
    } catch (error) {
      toast.error(`Failed to ${response} extension`);
      console.error('Extension response error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bookish-glass rounded-2xl border border-white/20 p-6 w-full max-w-md"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl">
                <ClockIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-lora font-bold text-primary">
                  {mode === 'request' ? 'Request Extension' : 'Extension Request'}
                </h3>
                <p className="text-sm text-primary/70">
                  {mode === 'request' 
                    ? 'Need more time for your swap?' 
                    : 'Respond to extension request'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-primary/70" />
            </button>
          </div>

          {/* Swap Info */}
          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <img
                src={swap?.initiator_book?.cover_image_url || '/placeholder-book.jpg'}
                alt={swap?.initiator_book?.title}
                className="w-12 h-16 object-cover rounded-lg"
              />
              <div>
                <h4 className="font-semibold text-primary">
                  {swap?.initiator_book?.title}
                </h4>
                <p className="text-sm text-primary/70">
                  by {swap?.initiator_book?.author}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <CalendarIcon className="w-4 h-4 text-primary/50" />
                  <span className="text-xs text-primary/60">
                    {swap?.meetup_time 
                      ? new Date(swap.meetup_time).toLocaleDateString()
                      : 'No meetup time set'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {mode === 'request' ? (
            /* Request Extension Form */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Extension Duration
                </label>
                <select
                  value={formData.days}
                  onChange={(e) => setFormData(prev => ({ ...prev, days: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary"
                >
                  <option value={3}>3 days</option>
                  <option value={7}>1 week</option>
                  <option value={14}>2 weeks</option>
                  <option value={30}>1 month</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Reason for Extension *
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Please explain why you need more time..."
                  rows={4}
                  className="w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary resize-none"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-primary mb-1">Note</h5>
                    <p className="text-sm text-primary/70">
                      The other party will be notified of your extension request and can approve or deny it.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-primary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestExtension}
                  disabled={isLoading || !formData.reason.trim()}
                  className="flex-1 bookish-button-enhanced text-white py-3 rounded-xl disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Request Extension'}
                </button>
              </div>
            </div>
          ) : (
            /* Respond to Extension */
            <div className="space-y-4">
              {extensionRequest && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <ClockIcon className="w-5 h-5 text-accent" />
                    <span className="font-semibold text-primary">Extension Request</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-primary">
                      <span className="text-primary/70">Duration:</span> {extensionRequest.extension_days} days
                    </p>
                    <p className="text-primary">
                      <span className="text-primary/70">Requested by:</span> {extensionRequest.requester?.username}
                    </p>
                    <p className="text-primary">
                      <span className="text-primary/70">Reason:</span>
                    </p>
                    <p className="text-primary bg-white/5 p-3 rounded-lg">
                      {extensionRequest.reason}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Response Notes (optional)
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Add any notes about your decision..."
                  rows={3}
                  className="w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleRespondToExtension('denied')}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl transition-colors text-red-400"
                >
                  <XCircleIcon className="w-5 h-5" />
                  {isLoading ? 'Processing...' : 'Deny'}
                </button>
                <button
                  onClick={() => handleRespondToExtension('approved')}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 bookish-button-enhanced text-white py-3 rounded-xl disabled:opacity-50"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  {isLoading ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SwapExtensionModal;
