import React from 'react';
import { motion } from 'framer-motion';

const TabsNavigation = ({ activeTab, setActiveTab, tabs, isSmallScreen }) => {
  return (
    <div className="mb-6">
      <div className="flex gap-2 border-b-2 border-gray-200">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 transition-colors duration-200 font-open-sans ${
              activeTab === tab.id ? 'text-primary font-semibold border-b-3 border-accent' : 'text-text hover:text-accent'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.icon}
            {!isSmallScreen && <span>{tab.label}</span>}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default TabsNavigation;