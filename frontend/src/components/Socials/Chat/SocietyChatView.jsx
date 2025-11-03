import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  UsersIcon,
  InformationCircleIcon,
  EllipsisVerticalIcon,
  FaceSmileIcon,
  PaperAirplaneIcon,
  PlusIcon,
  MicrophoneIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  BookOpenIcon,
  XMarkIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import MessageBubble from './MessageBubble';
import BookReferencePicker from '../../Chat/BookReferencePicker';

const SocietyChatView = ({
  society,
  messages,
  onSendMessage,
  onBack,
  isLoading,
  currentUser,
  isMobileModal = false
}) => {
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [bookPickerPosition, setBookPickerPosition] = useState({ x: 0, y: 0 });
  const [isTyping, setIsTyping] = useState(false);
  const [showSocietyInfo, setShowSocietyInfo] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [canLoadMore, setCanLoadMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const messageInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isMobile = window.innerWidth <= 768;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle message sending
  const handleSendMessage = () => {
    if (messageText.trim() && onSendMessage) {
      const messageData = {
        content: messageText.trim(),
        reply_to: replyToMessage?.id || null
      };
      onSendMessage(messageData);
      setMessageText('');
      setReplyToMessage(null);
      messageInputRef.current?.focus();
    }
  };

  // Handle reply to message
  const handleReply = (message) => {
    setReplyToMessage(message);
    messageInputRef.current?.focus();
  };

  // Handle marking message as read (for society messages, this might be different)
  const handleMarkAsRead = (message) => {
    console.log('Society message viewed:', message);
    // Society messages might not need read receipts, but we can track views
  };

  // Handle load more messages
  const handleLoadMore = async () => {
    if (isLoadingMore || !canLoadMore) return;

    setIsLoadingMore(true);
    try {
      // This would be implemented by parent component
      // For now, just simulate loading
      setTimeout(() => {
        setIsLoadingMore(false);
        // setCanLoadMore(false); // Set based on actual response
      }, 1000);
    } catch (error) {
      console.error('Failed to load more messages:', error);
      setIsLoadingMore(false);
    }
  };

  // Handle book reference picker
  const handleBookPickerToggle = (event) => {
    if (showBookPicker) {
      setShowBookPicker(false);
    } else {
      const rect = event.target.getBoundingClientRect();
      setBookPickerPosition({
        x: rect.left,
        y: rect.top - 10
      });
      setShowBookPicker(true);
    }
  };

  const handleBookSelect = (bookReference, book, autoSend = false) => {
    if (autoSend) {
      // Auto-send the book reference as a message
      const messageData = {
        content: bookReference,
        book_id: book.book_id,
        reply_to: replyToMessage?.id || null
      };

      if (onSendMessage) {
        onSendMessage(messageData);
        setReplyToMessage(null); // Clear any reply
        toast.success(`📚 Book "${book.title}" shared!`, {
          position: "bottom-center",
          autoClose: 2000,
          hideProgressBar: true,
        });
      }

      setShowBookPicker(false);
      messageInputRef.current?.focus();
    } else {
      // Add to current message text (legacy behavior)
      const cursorPosition = messageInputRef.current?.selectionStart || messageText.length;
      const newText = messageText.slice(0, cursorPosition) + bookReference + messageText.slice(cursorPosition);
      setMessageText(newText);
      setShowBookPicker(false);

      // Focus back to input and set cursor position
      setTimeout(() => {
        if (messageInputRef.current) {
          messageInputRef.current.focus();
          const newCursorPosition = cursorPosition + bookReference.length;
          messageInputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 100);
    }
  };

  // Handle key press for sending messages
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle typing indicator
  const handleTyping = (value) => {
    setMessageText(value);
    // TODO: Implement typing indicator WebSocket
  };

  if (!society) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-8">
          <UsersIcon className="w-16 h-16 text-[var(--secondary)] mx-auto mb-4" />
          <h3 className="text-xl font-lora text-[var(--primary)] mb-2">No Society Selected</h3>
          <p className="text-[var(--text)] font-open-sans">
            Select a society from the list to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col ${isMobileModal ? 'bg-transparent h-full' : 'h-full'}`}>
      {/* Society Chat Header - Mobile Optimized */}
      <div className={`${isMobileModal ? 'bg-[var(--primary)]/10 border-b border-[var(--primary)]/20' : 'bg-gradient-to-r from-[var(--primary)]/5 via-[var(--accent)]/5 to-white/80 backdrop-blur-sm border-b border-[var(--secondary)]/30'} px-3 sm:px-4 py-3 sm:py-4 flex-shrink-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <button
              onClick={onBack}
              className={`${isMobileModal ? 'flex' : 'xl:hidden'} p-1.5 sm:p-2 hover:bg-[var(--primary)]/10 rounded-full transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] items-center justify-center`}
            >
              <ArrowLeftIcon className="w-5 h-5 text-[var(--primary)]" />
            </button>

            {/* Society Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center border-2 border-white shadow-lg">
                <svg viewBox="0 0 16 16" className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor">
                  <rect x="0" y="0" width="2" height="16"></rect>
                  <path d="M11,6 L11,9 L11.885,9 L12,6 L11,6 Z"></path>
                  <path d="M3,0 L3,16 L13.8208442,16 C14.4713435,16 15,15.5473033 15,14.9895162 L15,1.01048377 C15,0.451686245 14.4723504,0 13.8208442,0 L3,0 Z M13.051,9.053 L12.08,9.053 L12.062,10.063 L7.906,10.063 L7.924,9.042 L6.957,9.042 L6.957,6.99 L7.915,6.99 L7.915,5.948 L10.957,5.938 L10.957,5.051 L7.026,5.051 L7.026,6.048 L6.029,6.048 L6.029,9.958 L7.041,9.958 L7.041,10.975 L11.047,10.975 L11.047,12.014 L6.961,12.014 L6.961,11.063 L5.958,11.063 L5.958,10.032 L4.953,10.032 L4.953,5.991 L5.973,5.991 L5.973,4.973 L6.938,4.973 L6.938,3.938 L11.032,3.938 L11.032,4.959 L12.011,4.959 L12.011,5.949 L13.052,5.949 L13.052,9.053 L13.051,9.053 Z"></path>
                  <rect x="8" y="7" width="2" height="2"></rect>
                </svg>
              </div>

              {/* Online Status */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
              </div>
            </div>

            {/* Society Info - Mobile Optimized */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                <h3 className="font-semibold font-lora text-[var(--primary)] truncate text-sm sm:text-base">
                  {society.name}
                </h3>
                <div className={`flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs ${
                  society.visibility === 'public'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {society.visibility === 'public' ? (
                    <GlobeAltIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  ) : (
                    <LockClosedIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  )}
                  <span className="font-semibold hidden sm:inline">{society.visibility}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 text-xs text-[var(--text)] font-open-sans">
                <span className="flex items-center gap-1">
                  <UsersIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">{society.member_count || 0} members</span>
                  <span className="sm:hidden">{society.member_count || 0}</span>
                </span>
                <span className="flex items-center gap-1">
                  <ChatBubbleLeftRightIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">{messages.length} messages</span>
                  <span className="sm:hidden">{messages.length}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons - Mobile Optimized */}
          <div className="flex items-center space-x-0.5 sm:space-x-1 flex-shrink-0">
            <button
              onClick={() => setShowSocietyInfo(!showSocietyInfo)}
              className="p-1.5 sm:p-2 hover:bg-[var(--bg-card)]/50 rounded-full transition-colors"
              title="Society Information"
            >
              <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
            </button>
            <button
              className="p-1.5 sm:p-2 hover:bg-[var(--bg-card)]/50 rounded-full transition-colors"
              title="More Options"
            >
              <EllipsisVerticalIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
            </button>
          </div>
        </div>

        {/* Society Info Panel */}
        <AnimatePresence>
          {showSocietyInfo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 pt-3 border-t border-[var(--secondary)]/30 overflow-hidden"
            >
              <div className="bg-[var(--bg-card)]/50 rounded-lg p-3 space-y-2">
                <p className="text-sm text-[var(--text)] font-open-sans">
                  {society.description ?
                    society.description.replace(/<[^>]*>/g, '') :
                    'A community for book lovers to discuss and share their reading experiences.'
                  }
                </p>
                <div className="flex items-center gap-4 text-xs text-[var(--text)]/70">
                  <span>Created {society.created_at ? new Date(society.created_at).toLocaleDateString() : 'Recently'}</span>
                  {society.creator && (
                    <span>by {society.creator.username || 'Unknown'}</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages Area */}
      <div className={`flex-1 overflow-hidden ${isMobileModal ? 'px-3 py-2' : 'px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4'} relative ${isMobileModal ? 'bg-transparent' : 'bg-gradient-to-b from-[#FEF3C7]/40 to-[#FEF3C7]/70'}`}>
        {/* Flying Books Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
          <div className="flying-books-container">
            {/* Book 1 */}
            <div className="flying-book book-1">
              <svg viewBox="0 0 16 16" className="w-8 h-8 text-[var(--primary)]" fill="currentColor">
                <rect x="0" y="0" width="2" height="16"></rect>
                <path d="M11,6 L11,9 L11.885,9 L12,6 L11,6 Z"></path>
                <path d="M3,0 L3,16 L13.8208442,16 C14.4713435,16 15,15.5473033 15,14.9895162 L15,1.01048377 C15,0.451686245 14.4723504,0 13.8208442,0 L3,0 Z M13.051,9.053 L12.08,9.053 L12.062,10.063 L7.906,10.063 L7.924,9.042 L6.957,9.042 L6.957,6.99 L7.915,6.99 L7.915,5.948 L10.957,5.938 L10.957,5.051 L7.026,5.051 L7.026,6.048 L6.029,6.048 L6.029,9.958 L7.041,9.958 L7.041,10.975 L11.047,10.975 L11.047,12.014 L6.961,12.014 L6.961,11.063 L5.958,11.063 L5.958,10.032 L4.953,10.032 L4.953,5.991 L5.973,5.991 L5.973,4.973 L6.938,4.973 L6.938,3.938 L11.032,3.938 L11.032,4.959 L12.011,4.959 L12.011,5.949 L13.052,5.949 L13.052,9.053 L13.051,9.053 Z"></path>
                <rect x="8" y="7" width="2" height="2"></rect>
              </svg>
            </div>

            {/* Book 2 */}
            <div className="flying-book book-2">
              <svg viewBox="0 0 16 16" className="w-6 h-6 text-[var(--accent)]" fill="currentColor">
                <rect x="0" y="0" width="2" height="16"></rect>
                <path d="M11,6 L11,9 L11.885,9 L12,6 L11,6 Z"></path>
                <path d="M3,0 L3,16 L13.8208442,16 C14.4713435,16 15,15.5473033 15,14.9895162 L15,1.01048377 C15,0.451686245 14.4723504,0 13.8208442,0 L3,0 Z M13.051,9.053 L12.08,9.053 L12.062,10.063 L7.906,10.063 L7.924,9.042 L6.957,9.042 L6.957,6.99 L7.915,6.99 L7.915,5.948 L10.957,5.938 L10.957,5.051 L7.026,5.051 L7.026,6.048 L6.029,6.048 L6.029,9.958 L7.041,9.958 L7.041,10.975 L11.047,10.975 L11.047,12.014 L6.961,12.014 L6.961,11.063 L5.958,11.063 L5.958,10.032 L4.953,10.032 L4.953,5.991 L5.973,5.991 L5.973,4.973 L6.938,4.973 L6.938,3.938 L11.032,3.938 L11.032,4.959 L12.011,4.959 L12.011,5.949 L13.052,5.949 L13.052,9.053 L13.051,9.053 Z"></path>
                <rect x="8" y="7" width="2" height="2"></rect>
              </svg>
            </div>

            {/* Book 3 */}
            <div className="flying-book book-3">
              <svg viewBox="0 0 16 16" className="w-7 h-7 text-[var(--primary)]" fill="currentColor">
                <rect x="0" y="0" width="2" height="16"></rect>
                <path d="M11,6 L11,9 L11.885,9 L12,6 L11,6 Z"></path>
                <path d="M3,0 L3,16 L13.8208442,16 C14.4713435,16 15,15.5473033 15,14.9895162 L15,1.01048377 C15,0.451686245 14.4723504,0 13.8208442,0 L3,0 Z M13.051,9.053 L12.08,9.053 L12.062,10.063 L7.906,10.063 L7.924,9.042 L6.957,9.042 L6.957,6.99 L7.915,6.99 L7.915,5.948 L10.957,5.938 L10.957,5.051 L7.026,5.051 L7.026,6.048 L6.029,6.048 L6.029,9.958 L7.041,9.958 L7.041,10.975 L11.047,10.975 L11.047,12.014 L6.961,12.014 L6.961,11.063 L5.958,11.063 L5.958,10.032 L4.953,10.032 L4.953,5.991 L5.973,5.991 L5.973,4.973 L6.938,4.973 L6.938,3.938 L11.032,3.938 L11.032,4.959 L12.011,4.959 L12.011,5.949 L13.052,5.949 L13.052,9.053 L13.051,9.053 Z"></path>
                <rect x="8" y="7" width="2" height="2"></rect>
              </svg>
            </div>

            {/* Book 4 */}
            <div className="flying-book book-4">
              <svg viewBox="0 0 16 16" className="w-5 h-5 text-[var(--accent)]" fill="currentColor">
                <rect x="0" y="0" width="2" height="16"></rect>
                <path d="M11,6 L11,9 L11.885,9 L12,6 L11,6 Z"></path>
                <path d="M3,0 L3,16 L13.8208442,16 C14.4713435,16 15,15.5473033 15,14.9895162 L15,1.01048377 C15,0.451686245 14.4723504,0 13.8208442,0 L3,0 Z M13.051,9.053 L12.08,9.053 L12.062,10.063 L7.906,10.063 L7.924,9.042 L6.957,9.042 L6.957,6.99 L7.915,6.99 L7.915,5.948 L10.957,5.938 L10.957,5.051 L7.026,5.051 L7.026,6.048 L6.029,6.048 L6.029,9.958 L7.041,9.958 L7.041,10.975 L11.047,10.975 L11.047,12.014 L6.961,12.014 L6.961,11.063 L5.958,11.063 L5.958,10.032 L4.953,10.032 L4.953,5.991 L5.973,5.991 L5.973,4.973 L6.938,4.973 L6.938,3.938 L11.032,3.938 L11.032,4.959 L12.011,4.959 L12.011,5.949 L13.052,5.949 L13.052,9.053 L13.051,9.053 Z"></path>
                <rect x="8" y="7" width="2" height="2"></rect>
              </svg>
            </div>

            {/* Book 5 */}
            <div className="flying-book book-5">
              <svg viewBox="0 0 16 16" className="w-6 h-6 text-[var(--primary)]" fill="currentColor">
                <rect x="0" y="0" width="2" height="16"></rect>
                <path d="M11,6 L11,9 L11.885,9 L12,6 L11,6 Z"></path>
                <path d="M3,0 L3,16 L13.8208442,16 C14.4713435,16 15,15.5473033 15,14.9895162 L15,1.01048377 C15,0.451686245 14.4723504,0 13.8208442,0 L3,0 Z M13.051,9.053 L12.08,9.053 L12.062,10.063 L7.906,10.063 L7.924,9.042 L6.957,9.042 L6.957,6.99 L7.915,6.99 L7.915,5.948 L10.957,5.938 L10.957,5.051 L7.026,5.051 L7.026,6.048 L6.029,6.048 L6.029,9.958 L7.041,9.958 L7.041,10.975 L11.047,10.975 L11.047,12.014 L6.961,12.014 L6.961,11.063 L5.958,11.063 L5.958,10.032 L4.953,10.032 L4.953,5.991 L5.973,5.991 L5.973,4.973 L6.938,4.973 L6.938,3.938 L11.032,3.938 L11.032,4.959 L12.011,4.959 L12.011,5.949 L13.052,5.949 L13.052,9.053 L13.051,9.053 Z"></path>
                <rect x="8" y="7" width="2" height="2"></rect>
              </svg>
            </div>
          </div>
        </div>

        {/* Messages Content - Fixed Height with Scroll */}
        <div
          ref={messagesContainerRef}
          className={`relative z-10 flex-1 overflow-y-auto ${isMobileModal ? 'px-2 py-2' : 'px-4 py-4'}`}
          style={isMobileModal ? {
            height: 'calc(100% - 120px)', // Adjust for mobile modal
            minHeight: '200px',
            maxHeight: 'none'
          } : {
            height: 'calc(100vh - 280px)', // Fixed height for desktop
            minHeight: '400px',
            maxHeight: '600px'
          }}
        >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Load More Button */}
            {canLoadMore && messages.length > 0 && (
              <div className="text-center py-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-4 py-2 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    'View older messages'
                  )}
                </button>
              </div>
            )}
            {/* Welcome Message or Access Denied */}
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                {society.visibility === 'private' && !society.is_member ? (
                  <>
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="font-lora text-[var(--primary)] font-semibold mb-2">
                      Private Society
                    </h4>
                    <p className="text-[var(--text)] font-open-sans text-sm mb-4">
                      This is a private society. You need to be invited by the creator to join and view messages.
                    </p>
                    <p className="text-[var(--text)] font-open-sans text-xs">
                      Contact <strong>{society.creator?.username || 'the creator'}</strong> for access
                    </p>
                  </>
                ) : (
                  <>
                    <UsersIcon className="w-12 h-12 text-[var(--secondary)] mx-auto mb-3" />
                    <h4 className="font-lora text-[var(--primary)] font-semibold mb-2">
                      Welcome to {society.name}!
                    </h4>
                    <p className="text-[var(--text)] font-open-sans text-sm">
                      Start the conversation and connect with fellow book lovers
                    </p>
                  </>
                )}
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map((message) => {
                const replyTo = message.reply_to_id ?
                  messages.find(m => m.id === message.reply_to_id) : null;



                // More robust isOwn check
                const messageUserId = message.user?.user_id || message.sender?.user_id || message.user_id;
                const currentUserId = currentUser?.user_id || currentUser?.id;
                const isOwn = messageUserId && currentUserId && messageUserId === currentUserId;

                return (
                  <MessageBubble
                    key={message.message_id || message.id}
                    message={message}
                    isOwn={isOwn}
                    isGroup={true}
                    onReply={handleReply}
                    replyToMessage={replyTo}
                    onMarkAsRead={handleMarkAsRead}
                  />
                );
              })}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2"
              >
                <div className="bg-[var(--secondary)]/30 rounded-2xl px-4 py-2 max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
        </div>
      </div>

      {/* Message Input - Mobile Optimized */}
      <div className={`${isMobileModal ? 'bg-[var(--primary)]/5 border-t border-[var(--primary)]/20 px-3 py-2' : 'bg-gradient-to-r from-[#FEF3C7]/50 to-[#FEF3C7]/70 backdrop-blur-sm border-t border-[var(--secondary)] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-3 sm:py-4'} flex-shrink-0`}>
        {society.visibility === 'private' && !society.is_member ? (
          <div className="text-center py-3 sm:py-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2z" />
              </svg>
              <span className="text-[var(--text)] font-open-sans text-sm font-medium">Private Society</span>
            </div>
            <p className="text-[var(--text)] font-open-sans text-xs">
              You need to be a member to send messages to this society
            </p>
          </div>
        ) : (
          <div className="flex items-end space-x-2 sm:space-x-3">
          <div className="flex flex-col space-y-1 mb-1">
            <button
              onClick={handleBookPickerToggle}
              className="p-2 hover:bg-[var(--secondary)]/30 rounded-full transition-colors flex-shrink-0"
              title="Reference a book"
            >
              <BookOpenIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
            </button>
            <button className="p-2 hover:bg-[var(--secondary)]/30 rounded-full transition-colors flex-shrink-0">
              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
            </button>
          </div>

          <div className="flex-1 relative">
            {/* Reply Indicator */}
            {replyToMessage && (
              <div className="mb-2 p-2 bg-[var(--primary)]/10 border-l-4 border-[var(--primary)] rounded">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ArrowUturnLeftIcon className="w-4 h-4 text-[var(--primary)]" />
                    <span className="text-sm font-medium text-[var(--primary)]">
                      Replying to {replyToMessage.user?.username || replyToMessage.sender?.username}
                    </span>
                  </div>
                  <button
                    onClick={() => setReplyToMessage(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                  {replyToMessage.content}
                </p>
              </div>
            )}

            <textarea
              ref={messageInputRef}
              value={messageText}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                replyToMessage
                  ? `Reply to ${replyToMessage.user?.username || replyToMessage.sender?.username}...`
                  : `Message ${society.name}...`
              }
              className="w-full p-2.5 sm:p-3 pr-10 sm:pr-12 border border-[var(--secondary)] rounded-2xl sm:rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] max-h-32 font-open-sans bg-[#FEF3C7]/60 backdrop-blur-sm text-sm sm:text-base"
              rows={1}
              style={{
                minHeight: '40px',
                height: 'auto',
                overflowY: messageText.split('\n').length > 3 ? 'scroll' : 'hidden'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />
            <button
              className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-[var(--secondary)]/30 rounded-full transition-colors"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <FaceSmileIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
            </button>
          </div>

          {messageText.trim() ? (
            <button
              onClick={handleSendMessage}
              className="p-2 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:from-[var(--accent)] hover:to-[var(--primary)] rounded-full transition-all shadow-lg flex-shrink-0"
            >
              <PaperAirplaneIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          ) : (
            <button className="p-2 hover:bg-[var(--secondary)]/30 rounded-full transition-colors flex-shrink-0">
              <MicrophoneIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
            </button>
          )}
          </div>
        )}
      </div>

      {/* Book Reference Picker */}
      <BookReferencePicker
        isOpen={showBookPicker}
        onClose={() => setShowBookPicker(false)}
        onSelectBook={handleBookSelect}
        position={bookPickerPosition}
      />
    </div>
  );
};

export default SocietyChatView;