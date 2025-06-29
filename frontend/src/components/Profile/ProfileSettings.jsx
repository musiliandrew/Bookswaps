import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import ProfileForm from '../Profile/Settings/ProfileForm';
import AccountSettingsForm from '../Profile/Settings/AccountSettingsForm';
import ChatPreferencesForm from '../Profile/Settings/ChatPreferencesForm';
import DeleteAccountModal from '../Profile/Settings/DeleteAccountModal';

import { toast } from 'react-toastify';

const ProfileSettings = () => {
  const { profile, isLoading: authLoading, error: authError, logout, getProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Refresh profile data when settings component mounts to ensure latest data
  useEffect(() => {
    if (profile?.user_id && getProfile) {
      getProfile(true); // Force fresh fetch to ensure form has latest data
    }
  }, [profile?.user_id, getProfile]);

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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-['Lora'] font-bold text-red-600">Delete Account</h2>
                    <p className="text-sm text-[var(--text)]/70">Permanently remove your BookSwaps account</p>
                  </div>
                </div>

                {/* Warning Section */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 border-2 border-red-200 rounded-lg bg-gradient-to-r from-red-50 to-orange-50"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-['Lora'] font-semibold text-red-800 mb-2">
                        This action cannot be undone
                      </h3>
                      <p className="text-red-700 mb-4 leading-relaxed">
                        Deleting your account will permanently remove all your data from BookSwaps, including:
                      </p>
                      <ul className="space-y-2 text-red-700">
                        <li className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Your entire book collection and library
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          All book swaps and transaction history
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Connections with other readers and followers
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Chat messages and society memberships
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Reviews, ratings, and reading progress
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>

                {/* Alternative Options */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 border border-[var(--primary)]/20 rounded-lg bg-[var(--primary)]/5"
                >
                  <h4 className="font-['Lora'] font-semibold text-[var(--primary)] mb-2">
                    Consider these alternatives:
                  </h4>
                  <ul className="space-y-2 text-sm text-[var(--text)]">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Make your profile private in Account Settings
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Disable email notifications in Chat Preferences
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Take a break and come back later
                    </li>
                  </ul>
                </motion.div>

                {/* Delete Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center pt-4"
                >
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-lg font-medium font-['Open_Sans'] transition-all hover:shadow-lg hover:scale-[1.02] focus:ring-4 focus:ring-red-200"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      I understand, delete my account
                    </span>
                  </button>
                  <p className="text-xs text-[var(--text)]/60 mt-2">
                    This will open a confirmation dialog
                  </p>
                </motion.div>
              </motion.div>
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