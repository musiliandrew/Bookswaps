import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import SmartTextRenderer from '../../Common/SmartTextRenderer';
import MessageStatus from './MessageStatus';
import { api } from '../../../utils/api';
import {
  PlayIcon,
  PauseIcon,
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  CheckIcon,
  CheckCircleIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';

const MessageBubble = ({
  message,
  isOwn,
  isGroup = false,
  partner,
  onReply = null,
  replyToMessage = null,
  onMarkAsRead = null
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [showReplyIcon, setShowReplyIcon] = useState(false);
  const [hasBeenRead, setHasBeenRead] = useState(message.status === 'READ');
  const constraintsRef = useRef(null);
  const messageRef = useRef(null);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };



  const getMessageBgColor = () => {
    if (isOwn) {
      return 'bg-gradient-to-r from-[var(--primary)] to-[var(--dark-primary)] text-white shadow-lg';
    }
    return 'bg-white text-[var(--text)] shadow-sm border border-gray-100';
  };

  const getMessageAlignment = () => {
    return isOwn ? 'justify-end' : 'justify-start';
  };

  // Helper function to get sender name
  const getSenderName = () => {
    if (isOwn) {
      return 'You';
    }

    // Try different possible user fields
    const user = message.user || message.sender || message.author;
    if (user) {
      return user.username || user.first_name || user.name || 'Unknown User';
    }

    // Fallback to direct fields on message
    return message.username || message.sender_name || message.user_name || 'Unknown User';
  };

  // Mark message as read when it comes into view
  useEffect(() => {
    if (!messageRef.current || isOwn || hasBeenRead || message.status === 'READ') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            // Message is visible, mark as read
            markAsRead();
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of message is visible
        rootMargin: '0px'
      }
    );

    observer.observe(messageRef.current);

    return () => {
      if (messageRef.current) {
        observer.unobserve(messageRef.current);
      }
    };
  }, [isOwn, hasBeenRead, message.status]);

  // Function to mark message as read
  const markAsRead = async () => {
    if (isOwn || hasBeenRead || message.status === 'READ') {
      return;
    }

    try {
      // Call the API to mark message as read
      await api.post(`/api/chat/messages/${message.chat_id || message.id}/read/`);
      setHasBeenRead(true);

      // Update the message status locally for immediate UI feedback
      message.status = 'read';

      // Call parent callback if provided
      if (onMarkAsRead) {
        onMarkAsRead(message);
      }

      console.log('✅ Message marked as read:', message.content?.substring(0, 30) + '...');
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  // Handle swipe to reply
  const handleDrag = (event, info) => {
    const threshold = 50;
    const dragDistance = Math.abs(info.offset.x);

    if (dragDistance > threshold && !showReplyIcon) {
      setShowReplyIcon(true);
    } else if (dragDistance <= threshold && showReplyIcon) {
      setShowReplyIcon(false);
    }

    setDragX(info.offset.x);
  };

  const handleDragEnd = (event, info) => {
    const threshold = 80;
    const dragDistance = Math.abs(info.offset.x);

    if (dragDistance > threshold && onReply) {
      onReply(message);
    }

    setDragX(0);
    setShowReplyIcon(false);
  };

  const renderMediaContent = () => {
    switch (message.message_type) {
      case 'IMAGE':
        return (
          <div className="relative">
            <img
              src={message.media_url}
              alt="Shared image"
              className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setShowFullImage(true)}
            />
            {message.content && (
              <SmartTextRenderer
                text={message.content}
                className="mt-2 text-sm"
                enableBookLinks={true}
                enableUserMentions={true}
              />
            )}
          </div>
        );

      case 'VIDEO':
        return (
          <div className="relative max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
            <video
              src={message.media_url}
              controls
              className="rounded-lg w-full"
              poster={message.media_thumbnail}
            />
            {message.content && (
              <SmartTextRenderer
                text={message.content}
                className="mt-2 text-sm"
                enableBookLinks={true}
                enableUserMentions={true}
              />
            )}
          </div>
        );

      case 'AUDIO':
      case 'VOICE_NOTE':
        return (
          <div className="flex items-center space-x-3 bg-white/10 rounded-full p-3 max-w-xs sm:max-w-sm md:max-w-md">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              {isPlaying ? (
                <PauseIcon className="w-5 h-5" />
              ) : (
                <PlayIcon className="w-5 h-5" />
              )}
            </button>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <MicrophoneIcon className="w-4 h-4 opacity-60" />
                <div className="flex-1 h-1 bg-white/20 rounded-full">
                  <div className="h-full bg-white/60 rounded-full w-1/3"></div>
                </div>
              </div>
              <p className="text-xs opacity-60 mt-1">
                {message.media_duration ? `${Math.floor(message.media_duration / 60)}:${(message.media_duration % 60).toString().padStart(2, '0')}` : '0:30'}
              </p>
            </div>
          </div>
        );

      case 'FILE':
        return (
          <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-3 max-w-xs sm:max-w-sm md:max-w-md">
            <DocumentIcon className="w-8 h-8 opacity-60" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.media_filename}</p>
              <p className="text-xs opacity-60">
                {message.media_size ? `${(message.media_size / 1024 / 1024).toFixed(1)} MB` : 'File'}
              </p>
            </div>
          </div>
        );

      case 'BOOK_REFERENCE':
        return (
          <div className="bg-white/10 rounded-lg p-3 max-w-xs sm:max-w-sm md:max-w-md">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-16 bg-[var(--accent)] rounded flex items-center justify-center">
                <span className="text-xs font-bold text-[var(--secondary)]">📚</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{message.book?.title || 'Book Reference'}</p>
                <p className="text-xs opacity-60">{message.book?.author || 'Unknown Author'}</p>
              </div>
            </div>
            {message.content && (
              <SmartTextRenderer
                text={message.content}
                className="mt-2 text-sm"
                enableBookLinks={true}
                enableUserMentions={true}
              />
            )}
          </div>
        );

      default:
        return (
          <SmartTextRenderer
            text={message.content}
            className="text-sm"
            enableBookLinks={true}
            enableUserMentions={true}
          />
        );
    }
  };

  return (
    <>
      <div
        className={`flex ${getMessageAlignment()} mb-3 group relative`}
        ref={constraintsRef}
      >
        <div ref={messageRef} className="w-full">
        {/* Reply Icon (appears on swipe) */}
        <motion.div
          className={`absolute ${isOwn ? 'left-0' : 'right-0'} top-1/2 transform -translate-y-1/2 z-10`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: showReplyIcon ? 1 : 0,
            scale: showReplyIcon ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-[var(--primary)] text-white p-2 rounded-full shadow-lg">
            <ArrowUturnLeftIcon className="w-4 h-4" />
          </div>
        </motion.div>

        {/* Message Container */}
        <div className={`flex flex-col max-w-[85%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%] xl:max-w-[65%] ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Sender Name (for all messages) */}
          <div className="mb-1 px-2">
            <span className="text-xs font-medium text-[var(--primary)]">
              {getSenderName()}
            </span>
          </div>

        <motion.div
          drag="x"
          dragConstraints={constraintsRef}
          dragElastic={0.2}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={{ x: dragX }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`max-w-full ${isOwn ? 'order-2' : 'order-1'} cursor-grab active:cursor-grabbing`}
        >


          {/* Reply indicator */}
          {replyToMessage && (
            <div className={`mb-2 px-3 py-2 rounded-lg border-l-4 ${
              isOwn
                ? 'bg-white/10 border-white/30'
                : 'bg-gray-50 border-[var(--primary)]'
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                <ArrowUturnLeftIcon className={`w-3 h-3 ${
                  isOwn ? 'text-white/70' : 'text-[var(--primary)]'
                }`} />
                <span className={`text-xs font-medium ${
                  isOwn ? 'text-white/70' : 'text-[var(--primary)]'
                }`}>
                  Replying to {replyToMessage.user?.username || replyToMessage.sender?.username || 'Unknown'}
                </span>
              </div>
              <p className={`text-xs ${
                isOwn ? 'text-white/60' : 'text-gray-600'
              } line-clamp-2`}>
                {replyToMessage.content}
              </p>
            </div>
          )}

          {/* Message bubble */}
          <div
            className={`rounded-2xl px-4 py-3 relative transition-all duration-200 ${
              isOwn ? 'rounded-br-md shadow-lg' : 'rounded-bl-md'
            } ${getMessageBgColor()}`}
            style={{
              wordBreak: 'break-word',
              hyphens: 'auto'
            }}
          >
            {/* Book reference indicator */}
            {message.book && (
              <div className={`mb-2 p-2 rounded-lg ${
                isOwn ? 'bg-white/20' : 'bg-gray-50'
              }`}>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-amber-100 rounded flex items-center justify-center">
                    <span className="text-amber-600 text-xs">📚</span>
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${
                      isOwn ? 'text-white/90' : 'text-gray-700'
                    }`}>
                      {message.book.title}
                    </p>
                    <p className={`text-xs ${
                      isOwn ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      by {message.book.author}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Message content */}
            {renderMediaContent()}

            {/* Message reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {message.reactions.map((reaction, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      isOwn ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {reaction.reaction_type} {reaction.count > 1 && reaction.count}
                  </span>
                ))}
              </div>
            )}

            {/* Time and status */}
            <div className={`flex items-center justify-between mt-2 space-x-2 ${
              isOwn ? 'text-white/70' : 'text-gray-400'
            }`}>
              <div className="flex items-center space-x-1">
                <span className="text-xs">
                  {formatTime(message.sent_at || message.created_at)}
                </span>
              </div>
              {isOwn && (
                <MessageStatus
                  status={hasBeenRead ? 'read' : message.status}
                  className="ml-2"
                />
              )}
            </div>
          </div>

          {/* Profile picture for received messages */}
          {!isOwn && !isGroup && partner && (
            <div className="w-6 h-6 mt-1">
              {partner.profile_picture ? (
                <img
                  src={partner.profile_picture}
                  alt={partner.username}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {partner.first_name?.[0] || partner.username[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          )}
        </motion.div>
        </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {showFullImage && message.message_type === 'IMAGE' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowFullImage(false)}
        >
          <motion.img
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            src={message.media_url}
            alt="Full size image"
            className="max-w-full max-h-full object-contain"
          />
        </motion.div>
      )}
    </>
  );
};

export default MessageBubble;
