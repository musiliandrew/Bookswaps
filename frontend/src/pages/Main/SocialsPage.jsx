import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useAuth } from '../../hooks/useAuth';
import { useDiscussions } from '../../hooks/useDiscussions';
import { useChat } from '../../hooks/useChat';
import { useSocieties } from '../../hooks/useSocieties';
import DiscussionPost from '../../components/Socials/DiscussionPost';
import ConversationList from '../../components/Socials/ConversationList';
import ChatMessages from '../../components/Socials/ChatMessages';
import SocietyMessages from '../../components/Socials/SocietyMessages';

const SocialsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, error: authError } = useAuth();
  const { listPosts, posts, isLoading: discLoading, error: discError } = useDiscussions();
  const { listMessages, messages, isLoading: chatLoading, error: chatError } = useChat();
  const { getSocietyMessages, societyMessages, isLoading: socLoading, error: socError } = useSocieties();
  const [activeTab, setActiveTab] = useState('discussions');
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);
  const [selectedSocietyId] = useState(null); // Placeholder for society selection

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    listPosts();
    listMessages();
    if (selectedSocietyId) getSocietyMessages(selectedSocietyId);
  }, [isAuthenticated, navigate, listPosts, listMessages, getSocietyMessages, selectedSocietyId]);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => activeTab === 'discussions' && setActiveTab('chats'),
    onSwipedRight: () => activeTab === 'chats' && setActiveTab('discussions'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const tabs = [
    { id: 'discussions', label: 'Discussions', icon: '/assets/icons/at-symbol.svg' },
    { id: 'chats', label: 'Chats', icon: '/assets/icons/chat.svg' },
  ];

  if (authLoading || discLoading || chatLoading || socLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bookish-spinner w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError || discError || chatError || socError) {
    return (
      <div className="text-center p-4 text-[var(--text)]">
        {authError || discError || chatError || socError || 'Failed to load social data. Please try again.'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bookish-gradient p-4" {...handlers}>
      {/* Bottom Navbar */}
      <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md bg-[var(--primary)] bookish-glass rounded-xl p-2 flex justify-around items-center z-10 shadow-lg">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'text-[#D4A017] underline'
                : 'text-[var(--secondary)] hover:text-[var(--accent)]'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSmallScreen ? (
              <img src={tab.icon} alt={`${tab.label} icon`} className="w-6 h-6" />
            ) : (
              <span className="text-sm font-['Open_Sans']">{tab.label}</span>
            )}
            {!isSmallScreen && activeTab === tab.id && (
              <motion.div
                className="w-2 h-1 bg-[#D4A017] rounded-full mt-1"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
        ))}
      </nav>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 'discussions' ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTab === 'discussions' ? -100 : 100 }}
          transition={{ duration: 0.3 }}
          className="mt-20 mb-20"
        >
          {activeTab === 'discussions' ? (
            <DiscussionsSection posts={posts} />
          ) : (
            <ChatsSection
              messages={messages}
              societyMessages={societyMessages}
              selectedSocietyId={selectedSocietyId}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// DiscussionsSection Component
const DiscussionsSection = ({ posts }) => {
  return (
    <motion.div
      className="bookish-glass p-6 rounded-xl max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-['Lora'] text-[var(--primary)] mb-4">Discussions</h1>
      {posts.length === 0 ? (
        <p className="text-[var(--text)] font-['Open_Sans'] text-center">No discussions yet.</p>
      ) : (
        posts.map((post) => (
          <DiscussionPost key={post.id} post={post} className="mb-6 last:mb-0" />
        ))
      )}
    </motion.div>
  );
};

// ChatsSection Component
const ChatsSection = ({ messages, societyMessages, selectedSocietyId }) => {
  const [selectedConversationId] = useState(messages[0]?.recipient?.id || null);

  return (
    <motion.div
      className="bookish-glass p-6 rounded-xl max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-['Lora'] text-[var(--primary)] mb-4">Chats</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3">
          <ConversationList className="mb-4" />
        </div>
        <div className="w-full md:w-2/3">
          {selectedConversationId ? (
            <ChatMessages recipientId={selectedConversationId} className="mb-4" />
          ) : societyMessages.length > 0 ? (
            <SocietyMessages societyId={selectedSocietyId} className="mb-4" />
          ) : (
            <p className="text-[var(--text)] font-['Open_Sans'] text-center">Select a chat or society.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SocialsPage;