import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import Input from '../common/Input';
import ErrorMessage from '../auth/ErrorMessage';
import { useAuth } from '../../hooks/useAuth';

function ChatWindow({ recipientId }) {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Mock WebSocket connection (replace with ws/chats/:userId)
    const ws = new WebSocket(`ws://localhost:8000/chats/${recipientId}`);
    ws.onopen = () => console.log('WebSocket connected');
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };
    ws.onerror = () => setError('Failed to connect to chat.');
    ws.onclose = () => console.log('WebSocket disconnected');
    setSocket(ws);

    // Mock initial messages
    setMessages([
      { id: 1, sender: { id: isAuthenticated.id, username: 'You' }, content: 'Hi, interested in swapping?', timestamp: new Date().toISOString() },
      { id: 2, sender: { id: recipientId, username: 'Other' }, content: 'Sure, what do you have?', timestamp: new Date().toISOString() },
    ]);

    return () => ws.close();
  }, [recipientId, isAuthenticated.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError('Not connected to chat.');
      return;
    }
    const message = {
      content: newMessage,
      sender: { id: isAuthenticated.id, username: 'You' },
      timestamp: new Date().toISOString(),
    };
    socket.send(JSON.stringify(message));
    setMessages((prev) => [...prev, message]);
    setNewMessage('');
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
          {messages.length ? (
            messages.map((message) => (
              <motion.div
                key={message.id}
                className={`flex ${message.sender.id === isAuthenticated.id ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    message.sender.id === isAuthenticated.id
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
            disabled={!newMessage.trim()}
            className="bookish-button-enhanced text-[var(--secondary)]"
            aria-label="Send message"
          />
        </form>
      </div>
    </motion.div>
  );
}

export default ChatWindow;