import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import MyBooksPage from '../../components/Library/MyBooksPage';
import BrowseBooksPage from '../../components/Library/BrowseBooksPage';
import { BookOpenIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const LibraryPage = () => {
  const [activeTab, setActiveTab] = useState('my-books');
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => activeTab === 'my-books' && setActiveTab('global'),
    onSwipedRight: () => activeTab === 'global' && setActiveTab('my-books'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const tabs = [
    { id: 'my-books', label: 'My Books', icon: <BookOpenIcon className="w-4 h-4" /> },
    { id: 'global', label: 'Browse', icon: <GlobeAltIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background font-open-sans text-text pt-16 pb-20" {...handlers}>
      {/* Bottom Floating Navigation */}
      <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md bg-primary bookish-glass rounded-xl p-2 flex justify-around items-center z-10 shadow-lg">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${
              activeTab === tab.id
                ? 'text-accent underline'
                : 'text-[#456A76] hover:text-accent'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSmallScreen ? (
              tab.icon
            ) : (
              <span className="text-xs font-open-sans">{tab.label}</span>
            )}
            {!isSmallScreen && activeTab === tab.id && (
              <motion.div
                className="w-2 h-1 bg-accent rounded-full mt-1"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
        ))}
      </nav>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 'my-books' ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTab === 'my-books' ? -100 : 100 }}
          transition={{ duration: 0.3 }}
          className="container mx-auto px-4 py-8"
        >
          {activeTab === 'my-books' ? <MyBooksPage /> : <BrowseBooksPage />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LibraryPage;