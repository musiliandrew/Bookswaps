import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/outline';

const TabsNavigation = ({ activeTab, setActiveTab, tabs, isSmallScreen }) => {
  // Determine layout based on number of tabs
  const shouldDistribute = tabs.length <= 3;

  return (
    <div className="mb-6 sm:mb-8">
      <div className="relative">
        {/* Mobile-Optimized Tab Container with smart distribution */}
        <div className={`flex ${shouldDistribute ? 'justify-around' : 'justify-center'} ${isSmallScreen ? 'gap-2' : 'gap-1'} p-1 sm:p-2 rounded-2xl border backdrop-blur-xl`} style={{ backgroundColor: 'var(--neutral-100)', borderColor: 'var(--neutral-200)' }}>
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col sm:flex-row items-center gap-1 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 rounded-xl transition-all duration-300 font-medium min-w-[60px] sm:min-w-auto ${shouldDistribute ? 'flex-1' : ''}`}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              title={tab.label} // Tooltip for mobile users
            >

              {/* Tab Content */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
                <motion.div
                  className={`transition-all duration-300 ${
                    activeTab === tab.id ? 'scale-110' : ''
                  } text-lg sm:text-base`}
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {tab.icon}
                </motion.div>

                {/* Desktop: Always show labels */}
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-semibold">{tab.fullLabel || tab.label}</span>
                  {tab.description && (
                    <span className={`text-xs transition-all duration-300 ${
                      activeTab === tab.id ? 'text-white/80' : 'text-primary/50'
                    }`}>
                      {tab.description}
                    </span>
                  )}
                </div>

                {/* Mobile: Show short label below icon only when active */}
                <span className={`sm:hidden text-xs mt-1 transition-all duration-200 text-center whitespace-nowrap ${
                  activeTab === tab.id ? 'opacity-100' : 'opacity-0'
                }`}>
                  {tab.label}
                </span>
              </div>

              {/* Active indicator sparkle */}
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
        </div>

        {/* Decorative Elements */}
        <motion.div
          className="absolute -top-2 -right-2 w-4 h-4 bg-accent/30 rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-2 -left-2 w-3 h-3 bg-primary/30 rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
        />
      </div>
    </div>
  );
};

export default TabsNavigation;