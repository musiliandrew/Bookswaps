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
  const [searchTerm, setSearchTerm] = useState('');

  // Enhanced sections with icons and descriptions
  const sections = [
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: '👤',
      description: 'Personal information and preferences',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'account', 
      label: 'Account', 
      icon: '⚙️',
      description: 'Security and privacy settings',
      color: 'from-green-500 to-green-600'
    },
    { 
      id: 'chat', 
      label: 'Chat Preferences', 
      icon: '💬',
      description: 'Communication and notification settings',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      id: 'delete', 
      label: 'Delete Account', 
      icon: '🗑️',
      description: 'Permanently remove your account',
      color: 'from-red-500 to-red-600'
    },
  ];

  // Filter sections based on search
  const filteredSections = sections.filter(section =>
    section.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const activeSessionInfo = sections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen font-open-sans text-text">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-lora font-bold text-gradient mb-4 relative">
            ⚙️ Settings
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full opacity-20"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 360, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </h1>
          <motion.p
            className="font-open-sans text-primary/80 text-lg max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Customize your BookSwaps experience and manage your account
          </motion.p>
        </motion.div>

        <main className="max-w-5xl mx-auto">
          {/* Search Bar */}
          <motion.div
            className="relative max-w-md mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search settings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bookish-input rounded-2xl border-0 bg-white/10 backdrop-blur-sm text-primary placeholder-primary/60 transition-all duration-300 hover:bg-white/20 focus:bg-white/30"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/60">
                🔍
              </div>
            </div>
          </motion.div>

          {/* Enhanced Navigation */}
          <motion.nav
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredSections.map((section, index) => (
                <motion.button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                  className={`relative p-6 rounded-2xl text-left transition-all duration-300 group ${
                    activeSection === section.id
                      ? 'bookish-glass border-2 border-accent shadow-xl scale-105'
                      : 'bookish-glass border border-white/20 hover:border-accent/50 hover:scale-102'
                  }`}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`text-3xl transition-transform duration-300 ${
                      activeSection === section.id ? 'scale-110' : 'group-hover:scale-110'
                    }`}>
                      {section.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-lora font-bold mb-2 text-lg ${
                        activeSection === section.id ? 'text-accent' : 'text-primary group-hover:text-accent'
                      }`}>
                        {section.label}
                      </h3>
                      <p className="text-sm text-primary/70 leading-relaxed">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  {/* Active indicator */}
                  {activeSection === section.id && (
                    <motion.div
                      layoutId="activeSettingsIndicator"
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10 pointer-events-none"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}

                  {/* Hover glow effect */}
                  <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none ${
                    activeSection === section.id
                      ? 'opacity-100 bg-gradient-to-br from-accent/5 to-primary/5'
                      : 'opacity-0 group-hover:opacity-100 bg-gradient-to-br from-white/5 to-white/10'
                  }`} />
                </motion.button>
              ))}
            </div>
          </motion.nav>

        {/* Content Section with Enhanced Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative"
          >
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">{activeSessionInfo?.icon}</div>
              <div>
                <h2 className="text-2xl font-['Lora'] text-[var(--primary)]">
                  {activeSessionInfo?.label}
                </h2>
                <p className="text-[var(--secondary)] font-['Open_Sans']">
                  {activeSessionInfo?.description}
                </p>
              </div>
            </div>

            {/* Form Container */}
            <div className="bookish-glass p-6 rounded-xl border border-[var(--secondary)]/10">
              {activeSection === 'profile' && <ProfileForm />}
              {activeSection === 'account' && <AccountSettingsForm />}
              {activeSection === 'chat' && <ChatPreferencesForm />}
              {activeSection === 'delete' && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-['Lora'] text-[var(--text)] mb-4">
                    Delete Account
                  </h3>
                  <p className="text-[var(--text)]/70 mb-8 max-w-md mx-auto">
                    This action cannot be undone. All your data will be permanently deleted 
                    including your books, swaps, and connections.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeleteAccount}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
                  >
                    Delete My Account
                  </motion.button>
                </div>
              )}
              
              {/* Logout Button for non-delete sections */}
              {activeSection !== 'delete' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 pt-6 border-t border-[var(--secondary)]/20"
                >
                  <button
                    onClick={handleLogout}
                    className="bookish-button-enhanced px-6 py-3 rounded-xl text-[var(--secondary)] w-full font-medium hover:scale-105 transition-transform"
                  >
                    🚪 Log Out
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Quick Stats/Info Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bookish-glass p-4 rounded-xl text-center">
            <div className="text-2xl mb-2">📚</div>
            <p className="text-sm text-[var(--secondary)]">Account Created</p>
            <p className="font-semibold text-[var(--text)]">
              {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently'}
            </p>
          </div>
          <div className="bookish-glass p-4 rounded-xl text-center">
            <div className="text-2xl mb-2">🔒</div>
            <p className="text-sm text-[var(--secondary)]">Privacy</p>
            <p className="font-semibold text-[var(--text)]">
              {profile.profile_public ? 'Public Profile' : 'Private Profile'}
            </p>
          </div>
          <div className="bookish-glass p-4 rounded-xl text-center">
            <div className="text-2xl mb-2">✉️</div>
            <p className="text-sm text-[var(--secondary)]">Notifications</p>
            <p className="font-semibold text-[var(--text)]">
              {profile.email_notifications ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </motion.div>

        {/* Delete Account Modal */}
        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        />
      </main>
      {/* Add the missing closing div for min-h-screen */}
      </div>
    </div>
  );
};

export default ProfileSettings;