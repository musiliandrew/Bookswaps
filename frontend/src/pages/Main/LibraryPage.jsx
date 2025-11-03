import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpenIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { BookOpenIcon as BookOpenSolidIcon, GlobeAltIcon as GlobeAltSolidIcon } from '@heroicons/react/24/solid';
import MyBooksPage from '../../components/Library/MyBooksPage';
import BrowseBooksPage from '../../components/Library/BrowseBooksPage';

const LibraryPage = () => {
  const [activeTab, setActiveTab] = useState('my-books');
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tabs = [
    {
      id: 'my-books',
      label: 'My Library',
      icon: BookOpenIcon,
      iconSolid: BookOpenSolidIcon,
      description: 'Your personal collection'
    },
    {
      id: 'global',
      label: 'Browse',
      icon: GlobeAltIcon,
      iconSolid: GlobeAltSolidIcon,
      description: 'Discover new books'
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
              x: activeTab === 'my-books' ? -20 : 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: activeTab === 'my-books' ? 20 : -20,
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut"
            }}
            className="w-full"
          >
            {activeTab === 'my-books' ? <MyBooksPage /> : <BrowseBooksPage />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LibraryPage;
