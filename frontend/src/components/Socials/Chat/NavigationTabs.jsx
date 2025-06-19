import React from 'react';
import { motion } from 'framer-motion';

const NavigationTabs = ({ activeTab, setActiveTab, navigate }) => {
  const tabs = [
    { id: 'direct', label: 'Direct Messages' },
    { id: 'societies', label: 'Society Chats' },
  ];

  return (
    <nav className="flex mb-4 gap-2 border-b border-[var(--secondary)] pb-2 py-2">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id);
            navigate(tab.id === 'direct' ? '/chat' : '/chat/societies');
          }}
          className={`px-2 py-2 text-sm font-medium rounded-lg ${
            activeTab === tab.id
              ? 'text-[var(--accent)] bg-[var(--accent)]/10'
              : 'text-[#456A76] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {tab.label}
        </motion.button>
      ))}
    </nav>
  );
};

export default NavigationTabs;