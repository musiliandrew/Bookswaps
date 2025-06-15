import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AnimatePresence, motion } from 'framer-motion';
import ProfileForm from './ProfileForm';
import AccountSettingsForm from './AccountSettingsForm';
import ChatPreferencesForm from './ChatPreferencesForm';
import DeleteAccountModal from './DeleteAccountModal';
import { toast } from 'react-toastify';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { isAuthenticated, profile, isLoading: authLoading, error: authError, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    console.log('ProfileSettings: isAuthenticated=', isAuthenticated, 'profile=', !!profile);
    if (!isAuthenticated) {
      console.log('ProfileSettings: Redirecting to /');
      navigate('/');
    }
  }, [isAuthenticated, profile, navigate]);

  useEffect(() => {
    if (authError) {
      toast.error(authError || 'Failed to load settings.');
    }
  }, [authError]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully!');
      navigate('/');
    } catch {
      toast.error('Failed to log out.');
    }
  };

  if (authLoading || !profile) {
    return (
      <div className="flex justify-center items-center h-screen bg-bookish-gradient">
        <div className="bookish-spinner w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="text-center p-4 text-[var(--text)] bg-bookish-gradient h-screen">
        <p className="mb-4">{authError || 'Failed to load settings.'}</p>
        <button
          onClick={() => window.location.reload()}
          className="bookish-button-enhanced px-4 py-2 rounded-xl text-[var(--secondary)]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="pt-16 pb-20 bg-bookish-gradient">
      <main className="max-w-2xl mx-auto px-4">
        <nav className="flex flex-wrap gap-4 mb-6 border-b border-[var(--secondary)]/20">
          {[
            { id: 'profile', label: 'Profile' },
            { id: 'account', label: 'Account' },
            { id: 'chat', label: 'Chat Preferences' },
            { id: 'delete', label: 'Delete Account' },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 font-['Open_Sans'] text-sm ${
                activeSection === section.id
                  ? 'text-[var(---accent)] border-b-2 border-[var(--accent)]'
                  : 'text-[#456A76] hover:text-[var(---accent)]'
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
  <motion.div
    key={activeSection}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="bookish-glass p-4 rounded-xl"
  >
    {activeSection === 'profile' && <div>Profile Placeholder</div>}
    {activeSection === 'account' && <div>Account Placeholder</div>}
    {activeSection === 'chat' && <div>Chat Placeholder</div>}
    {activeSection === 'delete' && <div>Delete Placeholder</div>}
    <button
      onClick={handleLogout}
      className="bookish-button-enhanced px-4 py-2 mt-4 rounded-xl text-[var(--secondary)] w-full"
    >
      Log Out
    </button>
  </motion.div>
</AnimatePresence>
      </main>
    </div>
  );
};

export default ProfileSettings;