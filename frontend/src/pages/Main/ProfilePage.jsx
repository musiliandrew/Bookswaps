import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useAuth } from '../../contexts/AuthContext';
import ProfileSection from '../../components/Profile/ProfileSection';
import ProfileSettings from '../../components/Profile/ProfileSettings';
import { UserIcon, Cog6ToothIcon, SparklesIcon, HeartIcon } from '@heroicons/react/24/outline';
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
      icon: <UserIcon className="w-5 h-5" />,
      description: 'Your reading journey'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Cog6ToothIcon className="w-5 h-5" />,
      description: 'Customize your experience'
    },
  ];

  // Memoize retry handler
  const handleRetry = useCallback(() => {
    getProfile();
  }, [getProfile]);

  // Enhanced Loading state
  if (authLoading || !profile) {
    return (
      <div className="min-h-screen bookish-gradient font-open-sans text-text relative overflow-hidden">
        {/* Flying Books Background */}
        <div className="floating-elements fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-lg animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-20 w-40 h-40 bg-gradient-to-br from-accent/5 to-primary/5 rounded-full blur-2xl animate-pulse delay-2000"></div>

          {/* Flying Books */}
          <div className="absolute top-1/4 left-1/4 text-6xl opacity-20 animate-bounce" style={{ animationDelay: '0s' }}>📚</div>
          <div className="absolute top-1/3 right-1/3 text-4xl opacity-15 animate-bounce" style={{ animationDelay: '1s' }}>📖</div>
          <div className="absolute bottom-1/3 left-1/2 text-5xl opacity-10 animate-bounce" style={{ animationDelay: '2s' }}>📕</div>
          <div className="absolute top-1/2 right-1/4 text-3xl opacity-20 animate-bounce" style={{ animationDelay: '3s' }}>📘</div>
          <div className="absolute bottom-1/4 right-1/2 text-4xl opacity-15 animate-bounce" style={{ animationDelay: '4s' }}>📗</div>
        </div>

        <div className="flex flex-col justify-center items-center h-screen relative z-10">
          <motion.div
            className="flex flex-col items-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <div className="text-center">
              <h2 className="text-2xl font-lora font-bold text-primary mb-2">Loading Your Profile</h2>
              <p className="text-primary/70">Preparing your reading journey...</p>
            </div>
          </motion.div>
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
      <div className="min-h-screen bookish-gradient font-open-sans text-text relative overflow-hidden" {...handlers}>
        {/* Flying Books Background */}
        <div className="floating-elements fixed inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 left-20 w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-lg animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 right-20 w-40 h-40 bg-gradient-to-br from-accent/5 to-primary/5 rounded-full blur-2xl animate-pulse delay-2000"></div>

          {/* Flying Books */}
          <div className="absolute top-1/4 left-1/4 text-6xl opacity-20 animate-bounce" style={{ animationDelay: '0s' }}>📚</div>
          <div className="absolute top-1/3 right-1/3 text-4xl opacity-15 animate-bounce" style={{ animationDelay: '1s' }}>📖</div>
          <div className="absolute bottom-1/3 left-1/2 text-5xl opacity-10 animate-bounce" style={{ animationDelay: '2s' }}>📕</div>
          <div className="absolute top-1/2 right-1/4 text-3xl opacity-20 animate-bounce" style={{ animationDelay: '3s' }}>📘</div>
          <div className="absolute bottom-1/4 right-1/2 text-4xl opacity-15 animate-bounce" style={{ animationDelay: '4s' }}>📗</div>
        </div>

        {/* Enhanced Bottom Navigation */}
        <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[95%] max-w-lg bookish-glass rounded-2xl p-3 flex justify-around items-center z-50 bookish-shadow border border-white/20">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center p-3 rounded-xl transition-all duration-300`}
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
              aria-label={tab.label}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              <div className={`transition-all duration-300 ${activeTab === tab.id ? 'scale-110' : ''}`}>
                {tab.icon}
              </div>
              {!isSmallScreen && (
                <span className={`text-xs font-medium mt-1 transition-all duration-300 ${
                  activeTab === tab.id ? 'text-white' : 'text-primary/70'
                }`}>
                  {tab.label}
                </span>
              )}
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
        </nav>

        {/* Enhanced Main Content with Tab Animation */}
        <div className="pt-20 pb-32">
          <div className="max-w-4xl mx-auto px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{
                  opacity: 0,
                  x: activeTab === 'my-profile' ? 100 : -100,
                  scale: 0.95
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1
                }}
                exit={{
                  opacity: 0,
                  x: activeTab === 'my-profile' ? -100 : 100,
                  scale: 0.95
                }}
                transition={{
                  duration: 0.4,
                  type: "spring",
                  stiffness: 300,
                  damping: 30
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
      </div>
    </ErrorBoundary>
  );
};

export default ProfilePage;