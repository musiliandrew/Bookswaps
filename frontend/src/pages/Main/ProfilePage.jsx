import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProfileSection from '../../components/Profile/ProfileSection';
import ProfileSettings from '../../components/Profile/ProfileSettings';
import { calculateProfileCompletion } from '../../utils/profileCompletion';
import { UserIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { UserIcon as UserSolidIcon, Cog6ToothIcon as CogSolidIcon } from '@heroicons/react/24/solid';
import ErrorBoundary from '../../components/Common/ErrorBoundary';

const ProfilePage = () => {
  const {
    isAuthenticated,
    profile,
    isLoading: authLoading,
    error: authError,
    getProfile
  } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('my-profile');
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

  // Calculate profile completion details
  const completionDetails = useMemo(() => {
    return calculateProfileCompletion(profile);
  }, [profile]);

  // Handle tab query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'settings') {
      setActiveTab('settings');
    } else if (tabParam === 'my-profile' || !tabParam) {
      setActiveTab('my-profile');
    }
  }, [searchParams]);

  // Fetch profile if not loaded
  useEffect(() => {
    if (isAuthenticated && !profile && !authLoading) {
      getProfile();
    }
  }, [isAuthenticated, authLoading, getProfile, profile]);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Change tab and update URL
  const changeTab = useCallback((tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  }, [setSearchParams]);

  // Swipe handlers for mobile
  const handleSwipeLeft = useCallback(() => {
    if (activeTab === 'my-profile') {
      changeTab('settings');
    }
  }, [activeTab, changeTab]);

  const handleSwipeRight = useCallback(() => {
    if (activeTab === 'settings') {
      changeTab('my-profile');
    }
  }, [activeTab, changeTab]);

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
      icon: UserIcon,
      iconSolid: UserSolidIcon,
      description: 'Your reading journey'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Cog6ToothIcon,
      iconSolid: CogSolidIcon,
      description: 'Customize your experience'
    },
  ];

  // Retry handler
  const handleRetry = useCallback(() => {
    getProfile();
  }, [getProfile]);

  // Loading state
  if (authLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--neutral-50)' }}>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="spinner-lg mb-4"></div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--primary-600)' }}>
            Loading Your Profile
          </h2>
          <p className="text-sm" style={{ color: 'var(--neutral-600)' }}>
            Preparing your reading journey...
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--neutral-50)' }}>
        <div className="card max-w-md w-full text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
               style={{ backgroundColor: 'var(--danger-100)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--danger-600)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--neutral-900)' }}>
            Failed to Load Profile
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--neutral-600)' }}>
            {authError || 'Unable to retrieve your profile data.'}
          </p>
          <button onClick={handleRetry} className="btn btn-primary btn-lg">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--neutral-50)' }} {...handlers}>
        {/* Bottom Navigation - Mobile & Desktop */}
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
                  onClick={() => changeTab(tab.id)}
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
                x: activeTab === 'my-profile' ? -20 : 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: activeTab === 'my-profile' ? 20 : -20,
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut"
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
