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
} from '@heroicons/react/24/outline';
import MessageBubble from './MessageBubble';

const SocietyChatView = ({
  society,
  messages,
  onSendMessage,
  onBack,
  isLoading,
  currentUser
}) => {
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messageInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isMobile = window.innerWidth <= 768;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle message sending
  const handleSendMessage = () => {
    if (messageText.trim() && onSendMessage) {
      onSendMessage(messageText.trim());
      setMessageText('');
      messageInputRef.current?.focus();
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
    <div className="flex-1 flex flex-col h-full">
      {/* Society Chat Header */}
      <div className="bg-gradient-to-r from-[var(--secondary)]/30 to-white/80 backdrop-blur-sm border-b border-[var(--secondary)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-[var(--primary)]" />
          </button>

          {/* Society Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center border-2 border-[var(--secondary)]">
              <UsersIcon className="w-5 h-5 text-white" />
            </div>

            <div>
              <h3 className="font-semibold font-lora text-[var(--primary)]">
                {society.name}
              </h3>
              <p className="text-xs text-[var(--text)] font-open-sans">
                {society.member_count || 0} members • {society.category || 'Book Club'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-white/50 rounded-full transition-colors">
            <InformationCircleIcon className="w-5 h-5 text-[var(--primary)]" />
          </button>
          <button className="p-2 hover:bg-white/50 rounded-full transition-colors">
            <EllipsisVerticalIcon className="w-5 h-5 text-[var(--primary)]" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 relative bg-gradient-to-b from-[#FEF3C7]/40 to-[#FEF3C7]/70">
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

        {/* Messages Content */}
        <div className="relative z-10">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <UsersIcon className="w-12 h-12 text-[var(--secondary)] mx-auto mb-3" />
                <h4 className="font-lora text-[var(--primary)] font-semibold mb-2">
                  Welcome to {society.name}!
                </h4>
                <p className="text-[var(--text)] font-open-sans text-sm">
                  Start the conversation and connect with fellow book lovers
                </p>
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender?.user_id === currentUser?.user_id}
                  isSociety={true}
                  society={society}
                />
              ))}
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

      {/* Message Input */}
      <div className="bg-gradient-to-r from-[#FEF3C7]/50 to-[#FEF3C7]/70 backdrop-blur-sm border-t border-[var(--secondary)] p-4">
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-[var(--secondary)]/30 rounded-full transition-colors">
            <PlusIcon className="w-5 h-5 text-[var(--primary)]" />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={messageInputRef}
              value={messageText}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${society.name}...`}
              className="w-full p-3 pr-12 border border-[var(--secondary)] rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] max-h-32 font-open-sans bg-[#FEF3C7]/60 backdrop-blur-sm"
              rows={1}
              style={{
                minHeight: '44px',
                height: 'auto',
                overflowY: messageText.split('\n').length > 3 ? 'scroll' : 'hidden'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-[var(--secondary)]/30 rounded-full transition-colors"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <FaceSmileIcon className="w-5 h-5 text-[var(--primary)]" />
            </button>
          </div>

          {messageText.trim() ? (
            <button
              onClick={handleSendMessage}
              className="p-2 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:from-[var(--accent)] hover:to-[var(--primary)] rounded-full transition-all shadow-lg"
            >
              <PaperAirplaneIcon className="w-5 h-5 text-white" />
            </button>
          ) : (
            <button className="p-2 hover:bg-[var(--secondary)]/30 rounded-full transition-colors">
              <MicrophoneIcon className="w-5 h-5 text-[var(--primary)]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocietyChatView;