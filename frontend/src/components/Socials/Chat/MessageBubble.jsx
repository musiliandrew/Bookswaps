import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PlayIcon, 
  PauseIcon, 
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  CheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const MessageBubble = ({ message, isOwn, isGroup = false, partner }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SENT':
        return <CheckIcon className="w-3 h-3 text-gray-400" />;
      case 'DELIVERED':
        return <CheckCircleIcon className="w-3 h-3 text-gray-400" />;
      case 'READ':
        return <CheckCircleIcon className="w-3 h-3 text-[var(--accent)]" />;
      default:
        return null;
    }
  };

  const getMessageBgColor = () => {
    if (isOwn) {
      return 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/90 text-white';
    }
    return 'bg-white text-[var(--text)] shadow-sm border border-gray-100';
  };

  const getMessageAlignment = () => {
    return isOwn ? 'justify-end' : 'justify-start';
  };

  const renderMediaContent = () => {
    switch (message.message_type) {
      case 'IMAGE':
        return (
          <div className="relative">
            <img
              src={message.media_url}
              alt="Shared image"
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setShowFullImage(true)}
            />
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        );

      case 'VIDEO':
        return (
          <div className="relative max-w-xs">
            <video
              src={message.media_url}
              controls
              className="rounded-lg w-full"
              poster={message.media_thumbnail}
            />
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        );

      case 'AUDIO':
      case 'VOICE_NOTE':
        return (
          <div className="flex items-center space-x-3 bg-white/10 rounded-full p-3 max-w-xs">
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
          <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-3 max-w-xs">
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
          <div className="bg-white/10 rounded-lg p-3 max-w-xs">
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
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        );

      default:
        return <p className="text-sm">{message.content}</p>;
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`flex ${getMessageAlignment()} mb-3 group`}
      >
        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
          {/* Group chat sender name */}
          {isGroup && !isOwn && (
            <p className="text-xs text-gray-500 mb-1 px-3 font-medium">
              {message.user?.username || message.sender?.username}
            </p>
          )}

          {/* Message bubble */}
          <div
            className={`rounded-2xl px-4 py-2 relative ${
              isOwn ? 'rounded-br-md' : 'rounded-bl-md'
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
            <div className={`flex items-center justify-end mt-1 space-x-1 ${
              isOwn ? 'text-white/60' : 'text-gray-400'
            }`}>
              <span className="text-xs">
                {formatTime(message.sent_at || message.created_at)}
              </span>
              {isOwn && (
                <div className="flex items-center">
                  {getStatusIcon(message.status)}
                </div>
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
        </div>
      </motion.div>

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
