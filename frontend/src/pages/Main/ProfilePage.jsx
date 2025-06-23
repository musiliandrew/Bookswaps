import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useAuth } from '../../hooks/useAuth';
import ProfileSection from '../../components/Profile/ProfileSection';
import ProfileSettings from '../../components/Profile/ProfileSettings';
import { UserIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import ErrorBoundary from '../../components/Common/ErrorBoundary';

const ProfilePage = () => {
  const { 
    isAuthenticated, 
    profile, 
    isLoading: authLoading, 
    error: authError, 
    getProfile 
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState('my-profile');
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

  // Memoize the profile fetching logic
  useEffect(() => {
    if (isAuthenticated && !profile && !authLoading) {
      getProfile();
    }
  }, [isAuthenticated, authLoading, getProfile, profile]);

  // Handle screen resize with cleanup
  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Memoize swipe handlers to prevent unnecessary re-renders
  const handleSwipeLeft = useCallback(() => {
    if (activeTab === 'my-profile') {
      setActiveTab('settings');
    }
  }, [activeTab]);

  const handleSwipeRight = useCallback(() => {
    if (activeTab === 'settings') {
      setActiveTab('my-profile');
    }
  }, [activeTab]);

  const handlers = useSwipeable({
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const tabs = [
    { 
      id: 'my-profile', 
      label: 'My Profile', 
      icon: <UserIcon className="w-4 h-4" /> 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: <Cog6ToothIcon className="w-4 h-4" /> 
    },
  ];

  // Memoize retry handler
  const handleRetry = useCallback(() => {
    getProfile();
  }, [getProfile]);

  // Loading state
  if (authLoading || !profile) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-bookish-gradient">
        <div className="flex items-center space-x-3">
          <div className="bookish-spinner w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-[var(--text)]">Loading profile...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (authError) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-bookish-gradient text-center p-4">
        <div className="max-w-md">
          <p className="mb-6 text-[var(--text)] text-lg">
            {authError || 'Failed to load profile data.'}
          </p>
          <button
            onClick={handleRetry}
            className="bookish-button-enhanced px-6 py-3 rounded-xl text-[var(--secondary)] font-medium hover:scale-105 transition-transform duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bookish-gradient pt-16 pb-12" {...handlers}>
        {/* Bottom Navigation */}
        <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md bg-[var(--primary)] bookish-glass rounded-xl p-2 flex justify-around items-center z-10 shadow-lg">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'text-[var(--accent)]'
                  : 'text-[#456A76] hover:text-[var(--accent)]'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label={tab.label}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              <div className="flex flex-col items-center">
                {isSmallScreen ? (
                  tab.icon
                ) : (
                  <span className="text-xs font-['Open_Sans'] font-medium">
                    {tab.label}
                  </span>
                )}
                
                {/* Active indicator */}
                {activeTab === tab.id && (
                  <motion.div
                    className="w-2 h-1 bg-[var(--accent)] rounded-full mt-1"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </div>
            </motion.button>
          ))}
        </nav>

        {/* Main Content with Tab Animation */}
        <div className="max-w-3xl mx-auto px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ 
                opacity: 0, 
                x: activeTab === 'my-profile' ? 100 : -100 
              }}
              animate={{ 
                opacity: 1, 
                x: 0 
              }}
              exit={{ 
                opacity: 0, 
                x: activeTab === 'my-profile' ? -100 : 100 
              }}
              transition={{ 
                duration: 0.3,
                ease: 'easeInOut'
              }}
              className="w-full"
            >
              {activeTab === 'my-profile' ? (
                <ProfileSection />
              ) : (
                <ProfileSettings />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ProfilePage;