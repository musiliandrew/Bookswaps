import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import ReactionButton from './ReactionButton';
import ErrorMessage from '../Common/ErrorMessage';

const ChatMessages = ({ recipientId, className = '' }) => {
  const { messages, isLoading, error, listMessages, isChatWsConnected, addDirectReaction } = useChat();
  const { profile } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (profile?.user?.id) {
      listMessages({ recipient_id: recipientId });
    }
  }, [profile, recipientId, listMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (error) return <ErrorMessage message={error} />;

  return (
    <motion.div
      className={`bookish-glass p-4 rounded-xl max-h-96 overflow-y-auto ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {messages.length === 0 ? (
        <p className="text-center text-[var(--text)] font-['Open_Sans']">No messages yet.</p>
      ) : (
        messages.map((message, index) => (
          <motion.div
            key={message.id}
            className={`flex ${message.sender.id === profile?.user?.id ? 'justify-end' : 'justify-start'} mb-2`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                message.sender.id === profile?.user?.id
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--secondary)] text-[var(--text)]'
              }`}
            >
              <p className="text-sm font-['Open_Sans']">{message.content}</p>
              <p className="text-xs opacity-70 font-['Open_Sans']">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
              {message.reactions?.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {message.reactions.map((r) => (
                    <span key={r.id} className="text-xs">
                      {r.reaction_type}
                    </span>
                  ))}
                </div>
              )}
              <ReactionButton
                messageId={message.id}
                onReact={(reactionType) => addDirectReaction(message.id, { reaction_type: reactionType })}
              />
            </div>
          </motion.div>
        ))
      )}
      {isLoading && (
        <div className="text-center">
          <div className="bookish-spinner mx-auto w-6 h-6 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {isChatWsConnected && (
        <p className="text-xs text-[var(--accent)] font-['Open_Sans']">Typing...</p>
      )}
      <div ref={messagesEndRef} />
    </motion.div>
  );
};

export default ChatMessages;
