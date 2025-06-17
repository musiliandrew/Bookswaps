import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useAuth } from '../../hooks/useAuth';
import ProfileSection from '../../components/Profile/ProfileSection';
import ProfileSettings from '../../components/Profile/ProfileSettings';
import { UserIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import ErrorBoundary from '../../components/Common/ErrorBoundary';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, profile, isLoading: authLoading, error: authError, getProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('my-profile');
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    if (!profile && !authLoading) {
      getProfile();
    }
  }, [isAuthenticated, navigate, getProfile, profile, authLoading]);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => activeTab === 'my-profile' && setActiveTab('settings'),
    onSwipedRight: () => activeTab === 'settings' && setActiveTab('my-profile'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const tabs = [
    { id: 'my-profile', label: 'My Profile', icon: <UserIcon className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Cog6ToothIcon className="w-4 h-4" /> },
  ];

  if (authLoading || !profile) {
    return (
      <div className="flex justify-center items-center h-screen bg-bookish-gradient">
        <div className="bookish-spinner w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-lg">Loading profile...</span>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="text-center p-4 text-[var(--text)] bg-bookish-gradient h-screen">
        <p className="mb-4">{authError || 'Failed to load profile data.'}</p>
        <button
          onClick={() => getProfile()}
          className="bookish-button-enhanced px-4 py-2 rounded-xl text-[var(--secondary)]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bookish-gradient pt-16 pb-12" {...handlers}>
        <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md bg-[var(--primary)] bookish-glass rounded-xl p-2 flex justify-around items-center z-10 shadow-lg">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'text-[var(--accent)] underline'
                  : 'text-[#456A76] hover:text-[var(--accent)]'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSmallScreen ? (
                tab.icon
              ) : (
                <span className="text-xs font-['Open_Sans']">{tab.label}</span>
              )}
              {!isSmallScreen && activeTab === tab.id && (
                <motion.div
                  className="w-2 h-1 bg-[var(--accent)] rounded-full mt-1"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'my-profile' ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === 'my-profile' ? -100 : 100 }}
            transition={{ duration: 0.3 }}
            className="max-w-3xl mx-auto px-4"
          >
            <ErrorBoundary>
              {activeTab === 'my-profile' ? <ProfileSection /> : <ProfileSettings />}
            </ErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

export default ProfilePage;