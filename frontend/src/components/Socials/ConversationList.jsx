import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import Input from '../Common/Input';
import Tilt from 'react-parallax-tilt';

const ConversationList = ({ className = '' }) => {
  const { messages, listMessages } = useChat();
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (profile?.user?.id) {
      listMessages();
    }
  }, [profile, listMessages]);

  useEffect(() => {
    const convos = messages.reduce((acc, msg) => {
      const otherUser = msg.sender.id === profile?.user?.id ? msg.recipient : msg.sender;
      const existing = acc.find((c) => c.user.id === otherUser.id);
      if (!existing) {
        acc.push({
          user: otherUser,
          lastMessage: msg.content,
          timestamp: msg.timestamp,
          unread: msg.status !== 'READ',
        });
      }
      return acc;
    }, []);
    setConversations(
      convos.filter((c) => c.user.username.toLowerCase().includes(search.toLowerCase()))
    );
  }, [messages, search, profile]);

  return (
    <motion.div
      className={`bookish-glass p-4 rounded-xl ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Input
        placeholder="Search conversations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bookish-input mb-4"
      />
      {conversations.length === 0 ? (
        <p className="text-center text-[var(--text)] font-['Open_Sans']">No conversations found.</p>
      ) : (
        conversations.map((convo, index) => (
          <Tilt key={convo.user.id} tiltMaxAngleX={5} tiltMaxAngleY={5}>
            <motion.div
              className="mb-2 p-2 rounded-lg hover:bg-[var(--secondary)]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/chats/${convo.user.id}`} className="flex justify-between items-center">
                <div>
                  <p className="font-['Lora'] text-[var(--text)]">{convo.user.username}</p>
                  <p className="text-sm text-gray-500 font-['Open_Sans']">
                    {convo.lastMessage.slice(0, 30)}...
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-['Open_Sans']">
                    {new Date(convo.timestamp).toLocaleTimeString()}
                  </p>
                  {convo.unread && (
                    <span className="bg-[var(--accent)] text-white text-xs rounded-full px-2 py-1">
                      New
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          </Tilt>
        ))
      )}
    </motion.div>
  );
};

export default ConversationList;
