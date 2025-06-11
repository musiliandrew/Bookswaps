import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSocieties } from '../../hooks/useSocieties';
import { useAuth } from '../../hooks/useAuth';
import MessageInput from './MessageInput';
import ReactionButton from './ReactionButton';
import ErrorMessage from '../Common/ErrorMessage';

const SocietyMessages = ({ societyId, className = '' }) => {
  const { societyMessages, getSocietyMessages, sendSocietyMessage, addSocietyReaction, isLoading, error, isSocietyWsConnected } = useSocieties();
  const { profile } = useAuth();
  const messagesEndRef = useRef(null);
  const audioRef = useRef(new Audio('/sounds/new-message.mp3')); // Placeholder audio path

  useEffect(() => {
    if (profile?.user?.id && societyId) {
      getSocietyMessages(societyId);
    }
  }, [profile, societyId, getSocietyMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [societyMessages]);

  // Play sound for new messages (except own messages)
  useEffect(() => {
    if (societyMessages.length > 0) {
      const latestMessage = societyMessages[societyMessages.length - 1];
      if (latestMessage.sender?.id !== profile?.user?.id) {
        audioRef.current.play().catch(() => {
          // Ignore errors (e.g., user hasn't interacted with page)
        });
      }
    }
  }, [societyMessages, profile]);

  const handleSend = async (content) => {
    if (!content.trim()) return;
    await sendSocietyMessage(societyId, content);
  };

  if (error) return <ErrorMessage message={error} />;

  return (
    <motion.div
      className={`bookish-glass p-4 rounded-xl max-h-96 overflow-y-auto ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      role="region"
      aria-label="Society Messages"
    >
      {societyMessages.length === 0 ? (
        <p className="text-center text-[var(--text)] font-['Open_Sans']">No messages yet.</p>
      ) : (
        societyMessages.map((message, index) => (
          <motion.div
            key={message.id}
            className={`flex ${
              message.sender?.id === profile?.user?.id ? 'justify-end' : 'justify-start'
            } mb-2`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            role="article"
            aria-label={`Message from ${message.sender?.username || 'Anonymous'}`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                message.sender?.id === profile?.user?.id
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--secondary)] text-[var(--text)]'
              } ${message.is_pinned ? 'border-2 border-[var(--accent)] active-glass' : ''}`}
            >
              <p className="text-sm font-['Open_Sans']">{message.content}</p>
              <p className="text-xs opacity-70 font-['Open_Sans']">
                {new Date(message.created_at || message.timestamp).toLocaleString()}
              </p>
              {message.is_pinned && (
                <span className="text-xs font-semibold text-[var(--accent)]">Pinned</span>
              )}
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
                onReact={(reactionType) =>
                  addSocietyReaction(societyId, message.id, { reaction_type: reactionType })
                }
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
      {isSocietyWsConnected && (
        <p className="text-xs text-[var(--accent)] font-['Open_Sans']">Connected...</p>
      )}
      <MessageInput
        onSend={handleSend}
        isLoading={isLoading}
        className="mt-4"
      />
      <div ref={messagesEndRef} />
    </motion.div>
  );
};

export default SocietyMessages;