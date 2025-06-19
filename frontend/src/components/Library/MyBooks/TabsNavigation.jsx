import React from 'react';
import { motion } from 'framer-motion';
import { BookmarkIcon, HeartIcon, BuildingLibraryIcon, ClockIcon } from '@heroicons/react/24/outline';

const TabsNavigation = ({ activeTab, setActiveTab, isSmallScreen }) => {
  const tabs = [
    { id: 'library', label: 'Library', icon: <BuildingLibraryIcon className="w-4 h-4" /> },
    { id: 'bookmarks', label: 'Bookmarks', icon: <BookmarkIcon className="w-4 h-4" /> },
    { id: 'favorites', label: 'Favorites', icon: <HeartIcon className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <ClockIcon className="w-4 h-4" /> },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md bg-primary bookish-glass rounded-xl p-2 flex justify-around items-center z-10 shadow-lg">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${
            activeTab === tab.id ? 'text-accent underline' : 'text-[#456A76] hover:text-accent'
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
  );
};

export default TabsNavigation;