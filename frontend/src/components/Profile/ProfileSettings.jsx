import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

// Context and hooks
import { useAuth } from '../../contexts/AuthContext';

// Components
import SettingsHeader from './Settings/SettingsHeader';
import SettingsNavigation from './Settings/SettingsNavigation';
import DeleteAccountSection from './Settings/DeleteAccountSection';
import ProfileForm from './Settings/ProfileForm';
import AccountSettingsForm from './Settings/AccountSettingsForm';
import ChatPreferencesForm from './Settings/ChatPreferencesForm';
import DeleteAccountModal from './Settings/DeleteAccountModal';
import LoadingState from '../Common/LoadingState';
import ErrorState from '../Common/ErrorState';

// Utils
import { calculateProfileCompletion } from '../../utils/profileCompletion';

const ProfileSettings = () => {
  const { profile, isLoading: authLoading, error: authError, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [localProfile, setLocalProfile] = useState(profile);

  // Removed excessive profile refresh - AuthContext handles profile data properly

  // Enhanced sections with completion status
  const profileCompletion = calculateProfileCompletion(localProfile);

  const sections = [
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
      status: profileCompletion.missing_fields.length > 0 ? 'incomplete' : 'complete',
      count: profileCompletion.missing_fields.length
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
    return <LoadingState message="Loading your settings..." fullScreen={true} />;
  }

  if (authError) {
    return (
      <ErrorState
        message={authError || 'Failed to load settings.'}
        onRetry={() => window.location.reload()}
        fullScreen={true}
      />
    );
  }

  return (
    <div className="min-h-screen font-['Open_Sans'] text-[var(--text)]">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <SettingsHeader profile={localProfile} />

        <main className="max-w-4xl mx-auto">
              <SettingsNavigation
                sections={sections}
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
              />

              {/* Content Section */}
              <div className="bookish-glass rounded-lg p-6">
            {activeSection === 'profile' && <ProfileForm />}
            {activeSection === 'account' && <AccountSettingsForm />}
            {activeSection === 'chat' && <ChatPreferencesForm />}
            {activeSection === 'delete' && (
              <DeleteAccountSection onDeleteAccount={handleDeleteAccount} />
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