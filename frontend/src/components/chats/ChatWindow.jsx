import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import Input from '../common/Input';
import ErrorMessage from '../auth/ErrorMessage';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import { useWebSocket } from '../../hooks/useWebSocket';

function ChatWindow({ recipientId }) {
  const { user, isAuthenticated } = useAuth();
  const { sendMessage: sendApiMessage, messages: initialMessages, getMessages } = useChat();
  const { messages: wsMessages, sendMessage: sendWsMessage } = useWebSocket(`dm-${recipientId}`);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [combinedMessages, setCombinedMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      getMessages(recipientId);
    }
  }, [isAuthenticated, recipientId, getMessages]);

  useEffect(() => {
    const allMessages = [
      ...initialMessages,
      ...wsMessages
    ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    const uniqueMessages = Array.from(
      new Map(allMessages.map(msg => [msg.id, msg])).values()
    );
    
    setCombinedMessages(uniqueMessages);
  }, [initialMessages, wsMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combinedMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (!isAuthenticated) {
      setError('Please sign in to send messages.');
      return;
    }
    try {
      const message = await sendApiMessage(recipientId, newMessage);
      if (message) {
        sendWsMessage(newMessage);
        setNewMessage('');
      }
    } catch {
      setError('Failed to send message.');
    }
  };

  return (
    <motion.div
      className="bookish-glass bookish-shadow p-6 rounded-2xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
    >
      <div className="space-y-4">
        {/* Message History */}
        <div className="max-h-96 overflow-y-auto space-y-2 p-4 bg-[var(--secondary)] rounded-lg">
          {combinedMessages.length ? (
            combinedMessages.map((message) => (
              <motion.div
                key={message.id}
                className={`flex ${message.sender.id === user?.id ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    message.sender.id === user?.id
                      ? 'bg-[var(--primary)] text-[var(--secondary)]'
                      : 'bg-[var(--light-accent)] text-[var(--dark-primary)]'
                  }`}
                >
                  <p className="text-sm font-['Open_Sans']">{message.content}</p>
                  <p className="text-xs font-['Open_Sans'] opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-[var(--text)] font-['Open_Sans']">No messages yet.</p>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ErrorMessage message={error} />
          </motion.div>
        )}

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow bookish-input"
            labelClassName="font-['Open_Sans'] text-[var(--text)]"
          />
          <Button
            type="submit"
            text="Send"
            disabled={!newMessage.trim() || !isAuthenticated}
            className="bookish-button-enhanced text-[var(--secondary)]"
            aria-label="Send message"
          />
        </form>
      </div>
    </motion.div>
  );
}

export default ChatWindow;