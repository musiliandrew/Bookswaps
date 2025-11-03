import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftRightIcon, UsersIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftRightIcon as ChatSolidIcon, UsersIcon as UsersSolidIcon } from '@heroicons/react/24/solid';
import EnhancedDiscussionsPage from '../../components/Socials/Discussions/EnhancedDiscussionsPage';
import SocietiesPage from '../../components/Socials/Societies/SocietiesPage';
import ChatPage from '../../components/Socials/ChatPage';

const SocialsPage = () => {
  const [activeTab, setActiveTab] = useState('discussions');
  const [activeSubTab, setActiveSubTab] = useState('community');
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tabs = [
    {
      id: 'discussions',
      label: 'Discussions',
      icon: ChatBubbleLeftRightIcon,
      iconSolid: ChatSolidIcon,
      description: 'Community discussions and societies'
    },
    {
      id: 'chats',
      label: 'Chats',
      icon: UsersIcon,
      iconSolid: UsersSolidIcon,
      description: 'Direct messages and group chats'
    },
  ];

  const discussionTabs = [
    {
      id: 'community',
      label: 'Community',
      description: 'Public discussions'
    },
    {
      id: 'societies',
      label: 'Societies',
      description: 'Reading groups'
    },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--neutral-50)' }}>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[95%] max-w-lg z-50">
        <div className="card p-2 flex gap-2" style={{
          boxShadow: 'var(--shadow-xl)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = isActive ? tab.iconSolid : tab.icon;

            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-4 rounded-lg transition-all ${
                  isActive ? '' : 'hover:bg-neutral-100'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--primary-500)' : 'transparent',
                  color: isActive ? 'white' : 'var(--neutral-600)'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={isSmallScreen ? 'w-6 h-6' : 'w-5 h-5'} />
                {!isSmallScreen && (
                  <span className="text-xs font-medium">
                    {tab.label}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    className="absolute top-1 right-1 w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--accent-400)' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{
              opacity: 0,
              x: activeTab === 'discussions' ? -20 : 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: activeTab === 'discussions' ? 20 : -20,
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut"
            }}
            className="w-full"
          >
            {activeTab === 'discussions' ? (
              <div className="w-full max-w-7xl mx-auto">
                {/* Page Header */}
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--primary-600)' }}>
                    Discussions
                  </h1>
                  <p className="text-sm md:text-base" style={{ color: 'var(--neutral-600)' }}>
                    Connect with fellow readers and join reading communities
                  </p>
                </motion.div>

                {/* Sub-Tab Navigation */}
                <motion.nav
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="flex gap-2 p-1 rounded-xl" style={{ backgroundColor: 'var(--neutral-100)' }}>
                    {discussionTabs.map((tab) => {
                      const isActive = activeSubTab === tab.id;

                      return (
                        <motion.button
                          key={tab.id}
                          onClick={() => setActiveSubTab(tab.id)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all`}
                          style={{
                            backgroundColor: isActive ? 'white' : 'transparent',
                            color: isActive ? 'var(--primary-600)' : 'var(--neutral-600)',
                            boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span>{tab.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.nav>

                {/* Content Area */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
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
