import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import ChatWindow from '../../components/chats/ChatWindow';
import ErrorMessage from '../../components/auth/ErrorMessage';

function ChatPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { isAuthenticated } = useAuth();
  const { getRecipientProfile, recipientProfile, isLoading, error } = useChat();
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      getRecipientProfile(userId).catch(() => {
        setGlobalError('Failed to load user profile.');
      });
    }
  }, [isAuthenticated, navigate, userId, getRecipientProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bookish-spinner mx-auto"></div>
          <p className="text-[var(--text)] font-['Open_Sans'] mt-2">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        <motion.h2
          className="text-3xl font-['Lora'] text-[var(--primary)] mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Chat with {recipientProfile?.username || 'User'}
        </motion.h2>
        {(error || globalError) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ErrorMessage message={error || globalError} />
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <ChatWindow recipientId={userId} />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default ChatPage;