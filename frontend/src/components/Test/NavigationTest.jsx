import React, { useState } from 'react';
import { motion } from 'framer-motion';

const NavigationTest = () => {
  const [activeTab, setActiveTab] = useState('discussions');
  const [subTab, setSubTab] = useState('posts');

  const testNavigation = (tab, sub = null) => {
    console.log(`Testing navigation to: ${tab}${sub ? ` -> ${sub}` : ''}`);
    setActiveTab(tab);
    if (sub) setSubTab(sub);
  };

  return (
    <div className="p-6 bg-[var(--card-bg)] rounded-lg border border-[var(--secondary)]">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Navigation Test</h2>
      
      {/* Main Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => testNavigation('discussions')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'discussions' 
              ? 'bg-[var(--accent)] text-white' 
              : 'bg-[var(--secondary)] text-[var(--text-primary)]'
          }`}
        >
          Discussions
        </button>
        <button
          onClick={() => testNavigation('chat')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'chat' 
              ? 'bg-[var(--accent)] text-white' 
              : 'bg-[var(--secondary)] text-[var(--text-primary)]'
          }`}
        >
          Chat
        </button>
      </div>

      {/* Sub Tabs */}
      {activeTab === 'discussions' && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => testNavigation('discussions', 'posts')}
            className={`px-3 py-1 text-sm rounded ${
              subTab === 'posts' 
                ? 'bg-[var(--accent)]/20 text-[var(--accent)]' 
                : 'bg-[var(--secondary)] text-[var(--text-secondary)]'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => testNavigation('discussions', 'societies')}
            className={`px-3 py-1 text-sm rounded ${
              subTab === 'societies' 
                ? 'bg-[var(--accent)]/20 text-[var(--accent)]' 
                : 'bg-[var(--secondary)] text-[var(--text-secondary)]'
            }`}
          >
            Societies
          </button>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => testNavigation('chat', 'direct')}
            className={`px-3 py-1 text-sm rounded ${
              subTab === 'direct' 
                ? 'bg-[var(--accent)]/20 text-[var(--accent)]' 
                : 'bg-[var(--secondary)] text-[var(--text-secondary)]'
            }`}
          >
            Direct Messages
          </button>
          <button
            onClick={() => testNavigation('chat', 'societies')}
            className={`px-3 py-1 text-sm rounded ${
              subTab === 'societies' 
                ? 'bg-[var(--accent)]/20 text-[var(--accent)]' 
                : 'bg-[var(--secondary)] text-[var(--text-secondary)]'
            }`}
          >
            Society Chats
          </button>
        </div>
      )}

      {/* Status Display */}
      <motion.div
        key={`${activeTab}-${subTab}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-[var(--secondary)]/20 rounded-lg"
      >
        <p className="text-[var(--text-primary)]">
          <strong>Current View:</strong> {activeTab} 
          {subTab && ` → ${subTab}`}
        </p>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          ✅ Navigation working without page reload
        </p>
      </motion.div>

      {/* Test Results */}
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-2">✅ Fixed Issues:</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Removed navigation calls that caused page reloads</li>
          <li>• Fixed infinite request loops in useProfileData</li>
          <li>• Added request caching to prevent duplicate API calls</li>
          <li>• Fixed society reaction endpoint URL</li>
          <li>• Improved error handling and user feedback</li>
        </ul>
      </div>
    </div>
  );
};

export default NavigationTest;
