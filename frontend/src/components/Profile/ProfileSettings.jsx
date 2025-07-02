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
  const [localProfile, setLocalProfile] = useState(profile);

  // Removed excessive profile refresh - AuthContext handles profile data properly

  // Enhanced sections with completion status
  const getProfileCompletionStatus = () => {
    if (!localProfile) return { completed: 0, total: 8, needsAttention: [] };

    const fields = [
      { key: 'username', label: 'Username', completed: !!localProfile.username },
      { key: 'city', label: 'City', completed: !!localProfile.city },
      { key: 'country', label: 'Country', completed: !!localProfile.country },
      { key: 'birth_date', label: 'Birth Date', completed: !!localProfile.birth_date },
      { key: 'gender', label: 'Gender', completed: !!localProfile.gender },
      { key: 'about_you', label: 'About You', completed: !!localProfile.about_you },
      { key: 'favorite_genres', label: 'Favorite Genres', completed: !!(localProfile.favorite_genres && localProfile.favorite_genres.length > 0) },
      { key: 'profile_picture', label: 'Profile Picture', completed: !!localProfile.profile_picture }
    ];

    const completed = fields.filter(f => f.completed).length;
    const needsAttention = fields.filter(f => !f.completed);

    return { completed, total: fields.length, needsAttention };
  };

  const profileStatus = getProfileCompletionStatus();

  const sections = [
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
      status: profileStatus.needsAttention.length > 0 ? 'incomplete' : 'complete',
      count: profileStatus.needsAttention.length
    },
    {
      id: 'account',
      label: 'Account',
      icon: '⚙️',
      status: 'normal'
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: '💬',
      status: 'normal'
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: '🗑️',
      status: 'danger'
    },
  ];

  useEffect(() => {
    if (authError) {
      toast.error(authError || 'Failed to load settings.');
    }
  }, [authError]);

  // Update local profile when auth profile changes
  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  // Listen for profile updates from other components
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      const updatedProfile = event.detail.profile;
      setLocalProfile(updatedProfile);
      toast.success('Profile updated successfully!');
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

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
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Simple Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-['Lora'] font-bold text-[var(--primary)] mb-2">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text)] font-['Open_Sans']">
            Manage your profile and account preferences
          </p>

          {/* Profile Completion Status */}
          {localProfile && (
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs sm:text-sm font-bold">
                    {Math.round((profileStatus.completed / profileStatus.total) * 100)}%
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-medium text-blue-800">Profile Completion</h3>
                  <p className="text-xs text-blue-600 truncate">
                    {profileStatus.needsAttention.length} fields remaining
                    {profileStatus.needsAttention.length > 0 && (
                      <span className="hidden sm:inline ml-2 text-orange-600">
                        ({profileStatus.needsAttention.slice(0, 2).map(f => f.label).join(', ')}
                        {profileStatus.needsAttention.length > 2 && `, +${profileStatus.needsAttention.length - 2} more`})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <main className="max-w-4xl mx-auto">
              {/* Mobile-Optimized Tab Navigation - Icons only on mobile */}
              <div className="mb-4 sm:mb-6">
                <div className="flex justify-center gap-3 sm:gap-2 p-1 bookish-glass rounded-lg">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => handleSectionChange(section.id)}
                      className={`relative flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-3 sm:px-3 md:px-4 py-3 sm:py-2 rounded-md font-['Open_Sans'] font-medium text-xs sm:text-sm transition-all duration-200 min-w-[60px] sm:min-w-auto ${
                        activeSection === section.id
                          ? 'bg-[var(--accent)] text-[var(--primary)] shadow-sm'
                          : 'text-[var(--text)] hover:text-[var(--primary)] hover:bg-white/50'
                      }`}
                      title={section.label} // Tooltip for mobile users
                    >
                      <span className="text-lg sm:text-base">{section.icon}</span>
                      <span className="hidden sm:inline text-xs sm:text-sm">{section.label}</span>
                      {/* Show label below icon on mobile only when active */}
                      <span className={`sm:hidden text-xs mt-1 transition-all duration-200 ${
                        activeSection === section.id ? 'opacity-100' : 'opacity-0'
                      }`}>
                        {section.label}
                      </span>

                      {/* Status indicators */}
                      {section.status === 'incomplete' && section.count > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {section.count}
                        </span>
                      )}
                      {section.status === 'danger' && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                      )}
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