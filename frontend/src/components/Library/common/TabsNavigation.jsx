import React from 'react';
import { motion } from 'framer-motion';

const TabsNavigation = ({ activeTab, setActiveTab, tabs, isSmallScreen }) => {
  return (
    <div className="mb-8">
      <div className="relative">
        {/* Enhanced Tab Container */}
        <div className="flex gap-1 p-2 bookish-glass rounded-2xl border border-white/20 backdrop-blur-xl">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 font-medium ${
                activeTab === tab.id
                  ? 'text-white shadow-lg'
                  : 'text-primary/70 hover:text-primary hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              {/* Active Tab Background */}
              {activeTab === tab.id && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              {/* Tab Content */}
              <div className="relative z-10 flex items-center gap-3">
                <motion.div
                  className={`transition-all duration-300 ${
                    activeTab === tab.id ? 'scale-110' : ''
                  }`}
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {tab.icon}
                </motion.div>

                {!isSmallScreen && (
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold">{tab.label}</span>
                    {tab.description && (
                      <span className={`text-xs transition-all duration-300 ${
                        activeTab === tab.id ? 'text-white/80' : 'text-primary/50'
                      }`}>
                        {tab.description}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Active Indicator for Small Screens */}
              {isSmallScreen && activeTab === tab.id && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-accent rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
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