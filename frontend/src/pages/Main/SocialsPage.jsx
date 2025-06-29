import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import EnhancedDiscussionsPage from '../../components/Socials/Discussions/EnhancedDiscussionsPage';
import SocietiesPage from '../../components/Socials/Societies/SocietiesPage';
import ChatPage from '../../components/Socials/ChatPage';
import TabsNavigation from '../../components/Library/common/TabsNavigation';
import { ChatBubbleLeftRightIcon, UsersIcon, SparklesIcon } from '@heroicons/react/24/outline';

const SocialsPage = () => {
  const [activeTab, setActiveTab] = useState('discussions');
  const [activeSubTab, setActiveSubTab] = useState('community');
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

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
    {
      id: 'discussions',
      label: 'Discussions',
      icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />,
      description: 'Share thoughts & ideas'
    },
    {
      id: 'chats',
      label: 'Chats',
      icon: <UsersIcon className="w-5 h-5" />,
      description: 'Connect with readers'
    },
  ];

  const discussionTabs = [
    { id: 'community', label: 'Community Discussions', icon: <ChatBubbleLeftRightIcon className="w-4 h-4" /> },
    { id: 'societies', label: 'Societies', icon: <UsersIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bookish-gradient font-open-sans text-text relative overflow-hidden" {...handlers}>
      {/* Floating Background Elements */}
      <div className="floating-elements fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 left-20 w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 right-20 w-40 h-40 bg-gradient-to-br from-accent/5 to-primary/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      {/* Enhanced Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[95%] max-w-lg bookish-glass rounded-2xl p-3 flex justify-around items-center z-50 bookish-shadow border border-white/20">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex flex-col items-center p-3 rounded-xl transition-all duration-300`}
            style={{
              color: activeTab === tab.id ? 'white' : 'var(--primary)',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                : 'transparent',
              boxShadow: activeTab === tab.id ? '0 10px 25px rgba(0,0,0,0.15)' : 'none',
              opacity: activeTab === tab.id ? 1 : 0.7
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className={`transition-all duration-300 ${activeTab === tab.id ? 'scale-110' : ''}`}>
              {tab.icon}
            </div>
            {!isSmallScreen && (
              <span className={`text-xs font-medium mt-1 transition-all duration-300 ${
                activeTab === tab.id ? 'text-white' : 'text-primary/70'
              }`}>
                {tab.label}
              </span>
            )}
            {activeTab === tab.id && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <SparklesIcon className="w-2 h-2 text-white m-0.5" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </nav>

      {/* Main Content with Enhanced Animations */}
      <div className="pt-20 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{
              opacity: 0,
              x: activeTab === 'discussions' ? 100 : -100,
              scale: 0.95
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1
            }}
            exit={{
              opacity: 0,
              x: activeTab === 'discussions' ? -100 : 100,
              scale: 0.95
            }}
            transition={{
              duration: 0.4,
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="container mx-auto px-4"
          >
            {activeTab === 'discussions' ? (
              <div>
                {/* Enhanced Header Section */}
                <motion.div
                  className="text-center mb-12"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h1 className="text-5xl md:text-6xl font-lora font-bold text-gradient mb-4 relative">
                    💬 Discussions
                    <motion.div
                      className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full opacity-20"
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </h1>
                  <motion.p
                    className="font-open-sans text-primary/80 text-lg max-w-2xl mx-auto leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    Join vibrant discussions, share your thoughts, and connect with fellow book lovers
                  </motion.p>
                </motion.div>

                {/* Inner Navigation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <TabsNavigation activeTab={activeSubTab} setActiveTab={setActiveSubTab} tabs={discussionTabs} isSmallScreen={isSmallScreen} />
                </motion.div>

                {/* Sub Content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  {activeSubTab === 'community' && <EnhancedDiscussionsPage />}
                  {activeSubTab === 'societies' && <SocietiesPage />}
                </motion.div>
              </div>
            ) : (
              <ChatPage />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SocialsPage;