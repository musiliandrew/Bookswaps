import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaperAirplaneIcon,
  MicrophoneIcon,
  FaceSmileIcon,
  PlusIcon,
  PhoneIcon,
  VideoCameraIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import MessageBubble from './MessageBubble';

const ConversationView = ({ 
  conversation, 
  messages, 
  onSendMessage, 
  onBack, 
  isLoading,
  currentUser 
}) => {
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      await onSendMessage({
        content: messageText,
        receiver_id: conversation.partner.user_id,
        message_type: 'TEXT'
      });
      setMessageText('');
      setIsTyping(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = (value) => {
    setMessageText(value);
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      // You can implement typing indicator API call here
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      // You can implement stop typing API call here
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Last seen recently';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    
    if (diffInMinutes < 1) return 'Online';
    if (diffInMinutes < 60) return `Last seen ${Math.floor(diffInMinutes)} minutes ago`;
    if (diffInMinutes < 1440) return `Last seen ${Math.floor(diffInMinutes / 60)} hours ago`;
    return `Last seen ${date.toLocaleDateString()}`;
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 rounded-full flex items-center justify-center">
            <svg className="w-16 h-16 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a conversation</h3>
          <p className="text-gray-500">Choose from your existing conversations or start a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-[var(--secondary)]/30 to-white/80 backdrop-blur-sm border-b border-[var(--secondary)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-[var(--primary)]" />
          </button>

          {/* Profile Picture */}
          {conversation.partner.profile_picture ? (
            <img
              src={conversation.partner.profile_picture}
              alt={conversation.partner.username}
              className="w-10 h-10 rounded-full object-cover border-2 border-[var(--secondary)]"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center border-2 border-[var(--secondary)]">
              <span className="text-white font-semibold font-open-sans">
                {conversation.partner.first_name?.[0] || conversation.partner.username[0].toUpperCase()}
              </span>
            </div>
          )}

          <div>
            <h3 className="font-semibold font-lora text-[var(--primary)]">
              {conversation.partner.username}
            </h3>
            <p className="text-xs text-[var(--text)] font-open-sans">
              {formatLastSeen(conversation.partner.last_seen)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-white/50 rounded-full transition-colors">
            <PhoneIcon className="w-5 h-5 text-[var(--primary)]" />
          </button>
          <button className="p-2 hover:bg-white/50 rounded-full transition-colors">
            <VideoCameraIcon className="w-5 h-5 text-[var(--primary)]" />
          </button>
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
            <AnimatePresence>
              {messages.map((message) => (
                <MessageBubble
                  key={message.chat_id}
                  message={message}
                  isOwn={message.sender?.user_id === currentUser?.user_id}
                  partner={conversation.partner}
                />
              ))}
            </AnimatePresence>
            
            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start"
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
              placeholder="Type a message..."
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

export default ConversationView;
