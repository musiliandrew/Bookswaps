import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import ProfileForm from '../Profile/Settings/ProfileForm';
import AccountSettingsForm from '../Profile/Settings/AccountSettingsForm';
import ChatPreferencesForm from '../Profile/Settings/ChatPreferencesForm';
import DeleteAccountModal from '../Profile/Settings/DeleteAccountModal';
import { toast } from 'react-toastify';

const ProfileSettings = () => {
  const { profile, isLoading: authLoading, error: authError, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Simplified sections for clean navigation
  const sections = [
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤'
    },
    {
      id: 'account',
      label: 'Account',
      icon: '⚙️'
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: '💬'
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: '🗑️'
    },
  ];

  useEffect(() => {
    if (authError) {
      toast.error(authError || 'Failed to load settings.');
    }
  }, [authError]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully!');
    } catch {
      toast.error('Failed to log out.');
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    // Add some visual feedback
    toast.info(`Switched to ${sections.find(s => s.id === sectionId)?.label} settings`);
  };

  if (authLoading || !profile) {
    return (
      <div className="flex justify-center items-center h-screen bg-bookish-gradient">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="bookish-spinner w-16 h-16 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text)] font-['Open_Sans']">Loading your settings...</p>
        </motion.div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="text-center p-8 text-[var(--text)] bg-bookish-gradient h-screen flex items-center justify-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bookish-glass p-8 rounded-xl max-w-md"
        >
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-['Lora'] mb-4">Oops! Something went wrong</h2>
          <p className="mb-6 text-[var(--secondary)]">{authError || 'Failed to load settings.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="bookish-button-enhanced px-6 py-3 rounded-xl text-[var(--secondary)] hover:scale-105 transition-transform"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-['Open_Sans'] text-[var(--text)]">
      <div className="container mx-auto px-4 py-6">
        {/* Simple Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-['Lora'] font-bold text-[var(--primary)] mb-2">
            Settings
          </h1>
          <p className="text-sm text-[var(--text)] font-['Open_Sans']">
            Manage your profile and account preferences
          </p>
        </div>

        <main className="max-w-4xl mx-auto">
          {/* Clean Tab Navigation */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 p-1 bookish-glass rounded-lg">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-['Open_Sans'] font-medium text-sm transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-[var(--accent)] text-[var(--primary)] shadow-sm'
                      : 'text-[var(--text)] hover:text-[var(--primary)] hover:bg-white/50'
                  }`}
                >
                  <span className="text-base">{section.icon}</span>
                  <span>{section.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Section */}
          <div className="bookish-glass rounded-lg p-6">
            {activeSection === 'profile' && <ProfileForm />}
            {activeSection === 'account' && <AccountSettingsForm />}
            {activeSection === 'chat' && <ChatPreferencesForm />}
            {activeSection === 'delete' && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-xl font-['Lora'] text-[var(--primary)] mb-4">
                  Delete Account
                </h3>
                <p className="text-[var(--text)] mb-8 max-w-md mx-auto font-['Open_Sans']">
                  This action cannot be undone. All your data will be permanently deleted
                  including your books, swaps, and connections.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium font-['Open_Sans'] transition-colors"
                >
                  Delete My Account
                </button>
                </div>
              )}

              {/* Simple Logout Button */}
              {activeSection !== 'delete' && (
                <div className="mt-6 pt-4 border-t border-[var(--primary)]/20">
                  <button
                    onClick={handleLogout}
                    className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white px-4 py-2 rounded-lg font-medium font-['Open_Sans'] transition-colors"
                  >
                    🚪 Log Out
                  </button>
                </div>
              )}
            </div>
        </main>

        {/* Delete Account Modal */}
        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        />
      </div>
    </div>
  );
};

export default ProfileSettings;