import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClockIcon, 
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow, addDays, format } from 'date-fns';

const ExtensionRequest = ({ 
  swap, 
  isOpen, 
  onClose, 
  onRequestExtension, 
  onRespondToExtension,
  currentUserId,
  isLoading = false 
}) => {
  const [requestForm, setRequestForm] = useState({
    days_requested: 7,
    reason: ''
  });
  const [responseForm, setResponseForm] = useState({
    action: '',
    response: ''
  });

  const isOwner = currentUserId === swap.initiator?.user_id;
  const isBorrower = currentUserId === swap.receiver?.user_id;
  const hasActiveExtensionRequest = swap.extension_requests?.some(req => req.status === 'pending');

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!requestForm.reason.trim()) {
      alert('Please provide a reason for the extension');
      return;
    }
    onRequestExtension(swap.swap_id, requestForm);
  };

  const handleResponseSubmit = (action) => {
    const response = {
      action,
      response: responseForm.response
    };
    onRespondToExtension(swap.extension_requests[0]?.extension_id, response);
  };

  const calculateNewDeadline = () => {
    if (swap.return_deadline) {
      return addDays(new Date(swap.return_deadline), requestForm.days_requested);
    }
    return addDays(new Date(), requestForm.days_requested);
  };

  const isOverdue = () => {
    if (!swap.return_deadline) return false;
    return new Date() > new Date(swap.return_deadline);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Extension Request
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Book Info */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">
                {swap.initiator_book?.title}
              </h4>
              <p className="text-sm text-gray-600">
                by {swap.initiator_book?.author}
              </p>
              
              {swap.return_deadline && (
                <div className="mt-2 flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4 text-gray-500" />
                  <span className={`text-sm ${isOverdue() ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                    {isOverdue() ? 'Overdue: ' : 'Due: '}
                    {format(new Date(swap.return_deadline), 'MMM dd, yyyy')}
                    {isOverdue() && (
                      <span className="ml-1">
                        ({formatDistanceToNow(new Date(swap.return_deadline))} ago)
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Overdue Warning */}
            {isOverdue() && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  <span className="font-medium">Book is Overdue</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Please return the book or request an extension as soon as possible.
                </p>
              </div>
            )}

            {/* Request Form (for borrower) */}
            {isBorrower && !hasActiveExtensionRequest && (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Days Needed
                  </label>
                  <select
                    value={requestForm.days_requested}
                    onChange={(e) => setRequestForm(prev => ({ 
                      ...prev, 
                      days_requested: parseInt(e.target.value) 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={3}>3 days</option>
                    <option value={7}>1 week</option>
                    <option value={14}>2 weeks</option>
                    <option value={30}>1 month</option>
                  </select>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    New deadline: {format(calculateNewDeadline(), 'MMM dd, yyyy')}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Extension
                  </label>
                  <textarea
                    value={requestForm.reason}
                    onChange={(e) => setRequestForm(prev => ({ 
                      ...prev, 
                      reason: e.target.value 
                    }))}
                    placeholder="Please explain why you need more time with this book..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !requestForm.reason.trim()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Sending Request...' : 'Request Extension'}
                </button>
              </form>
            )}

            {/* Pending Request Status */}
            {hasActiveExtensionRequest && (
              <div className="space-y-4">
                {swap.extension_requests.map((request) => (
                  request.status === 'pending' && (
                    <div key={request.extension_id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ClockIcon className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">
                          Extension Request Pending
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Days Requested:</span>
                          <span className="ml-2 text-gray-600">{request.days_requested} days</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Reason:</span>
                          <p className="mt-1 text-gray-600">{request.reason}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Requested:</span>
                          <span className="ml-2 text-gray-600">
                            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>

                      {/* Response Form (for owner) */}
                      {isOwner && (
                        <div className="mt-4 pt-4 border-t border-yellow-200">
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Your Response (Optional)
                            </label>
                            <textarea
                              value={responseForm.response}
                              onChange={(e) => setResponseForm(prev => ({ 
                                ...prev, 
                                response: e.target.value 
                              }))}
                              placeholder="Add a message to your response..."
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleResponseSubmit('approve')}
                              disabled={isLoading}
                              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                              <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleResponseSubmit('deny')}
                              disabled={isLoading}
                              className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                              <XMarkIcon className="w-4 h-4 inline mr-1" />
                              Deny
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Waiting message for borrower */}
                      {isBorrower && (
                        <div className="mt-4 pt-4 border-t border-yellow-200">
                          <div className="flex items-center gap-2 text-yellow-700">
                            <ChatBubbleLeftRightIcon className="w-4 h-4" />
                            <span className="text-sm">
                              Waiting for {swap.initiator?.username} to respond
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                ))}
              </div>
            )}

            {/* Previous Extension History */}
            {swap.extension_requests?.filter(req => req.status !== 'pending').length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Extension History</h4>
                <div className="space-y-2">
                  {swap.extension_requests
                    .filter(req => req.status !== 'pending')
                    .map((request) => (
                      <div key={request.extension_id} className="p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            {request.days_requested} days requested
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            request.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-1">{request.reason}</p>
                        {request.owner_response && (
                          <p className="text-gray-600 italic">
                            Response: {request.owner_response}
                          </p>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {format(new Date(request.created_at), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExtensionRequest;
