import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckIcon, 
  CheckCircleIcon,
  ClockIcon,
  UserCircleIcon 
} from '@heroicons/react/24/outline';

const ConversationList = ({ conversations, selectedConversation, onSelectConversation, isLoading }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getStatusIcon = (message, currentUserId) => {
    // Only show status for messages sent by current user
    if (message.sender?.user_id !== currentUserId) return null;
    
    switch (message.status) {
      case 'SENT':
        return <CheckIcon className="w-4 h-4 text-gray-400" />;
      case 'DELIVERED':
        return <CheckCircleIcon className="w-4 h-4 text-gray-400" />;
      case 'READ':
        return <CheckCircleIcon className="w-4 h-4 text-blue-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-300" />;
    }
  };

  const truncateMessage = (content, maxLength = 40) => {
    if (!content) return '';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <UserCircleIcon className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No conversations yet</h3>
        <p className="text-sm text-gray-500">Start a conversation with someone you follow!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {conversations.map((conversation, index) => (
        <motion.div
          key={conversation.partner.user_id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
            selectedConversation?.partner?.user_id === conversation.partner.user_id 
              ? 'bg-[var(--accent)]/10 border-r-4 border-[var(--accent)]' 
              : ''
          }`}
          onClick={() => onSelectConversation(conversation)}
        >
          <div className="flex items-center space-x-3">
            {/* Profile Picture */}
            <div className="relative">
              {conversation.partner.profile_picture ? (
                <img
                  src={conversation.partner.profile_picture}
                  alt={conversation.partner.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {conversation.partner.first_name?.[0] || conversation.partner.username[0].toUpperCase()}
                  </span>
                </div>
              )}
              
              {/* Online Status Indicator (placeholder - you can implement real-time status) */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>

            {/* Conversation Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {conversation.partner.first_name && conversation.partner.last_name
                    ? `${conversation.partner.first_name} ${conversation.partner.last_name}`
                    : conversation.partner.username}
                </h3>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(conversation.latest_message, conversation.current_user_id)}
                  <span className="text-xs text-gray-500">
                    {formatTime(conversation.latest_message.created_at)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate">
                  {conversation.latest_message.message_type === 'TEXT' 
                    ? truncateMessage(conversation.latest_message.content)
                    : `📎 ${conversation.latest_message.message_type.toLowerCase()}`
                  }
                </p>
                
                {/* Unread Count */}
                {conversation.unread_count > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-[var(--accent)] rounded-full min-w-[20px]">
                    {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ConversationList;
