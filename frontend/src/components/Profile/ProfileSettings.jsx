import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  UserIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  TrashIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import {
  UserIcon as UserSolidIcon,
  Cog6ToothIcon as CogSolidIcon,
  ChatBubbleLeftRightIcon as ChatSolidIcon,
  TrashIcon as TrashSolidIcon
} from '@heroicons/react/24/solid';

// Context and hooks
import { useAuth } from '../../contexts/AuthContext';

// Components
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

  // Calculate profile completion
  const profileCompletion = calculateProfileCompletion(localProfile);

  const sections = [
    {
      id: 'profile',
      label: 'Profile',
      icon: UserIcon,
      iconSolid: UserSolidIcon,
      status: profileCompletion.missing_fields.length > 0 ? 'incomplete' : 'complete',
      count: profileCompletion.missing_fields.length
    },
    {
      id: 'account',
      label: 'Account',
      icon: Cog6ToothIcon,
      iconSolid: CogSolidIcon,
      status: 'normal'
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: ChatBubbleLeftRightIcon,
      iconSolid: ChatSolidIcon,
      status: 'normal'
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: TrashIcon,
      iconSolid: TrashSolidIcon,
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

  // Listen for profile updates
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
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--primary-600)' }}>
          Settings
        </h1>
        <p className="text-sm md:text-base mb-4" style={{ color: 'var(--neutral-600)' }}>
          Manage your profile and account preferences
        </p>

        {/* Profile Completion Badge */}
        {profileCompletion.missing_fields.length > 0 && (
          <motion.div
            className="p-4 rounded-lg"
            style={{ backgroundColor: 'var(--warning-50)', borderLeft: '4px solid var(--warning-500)' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                   style={{ backgroundColor: 'var(--warning-100)' }}>
                <span className="text-lg font-bold" style={{ color: 'var(--warning-700)' }}>
                  {profileCompletion.percentage}%
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--warning-800)' }}>
                  Complete Your Profile
                </h3>
                <p className="text-xs" style={{ color: 'var(--warning-700)' }}>
                  {profileCompletion.missing_fields.length} field{profileCompletion.missing_fields.length !== 1 ? 's' : ''} remaining
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Settings Navigation */}
      <motion.nav
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            const Icon = isActive ? section.iconSolid : section.icon;

            return (
              <motion.button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-medium transition-all ${
                  section.status === 'danger' ? 'hover:bg-danger-50' : 'hover:bg-neutral-50'
                }`}
                style={{
                  backgroundColor: isActive
                    ? section.status === 'danger'
                      ? 'var(--danger-50)'
                      : 'var(--primary-50)'
                    : 'white',
                  border: `2px solid ${
                    isActive
                      ? section.status === 'danger'
                        ? 'var(--danger-500)'
                        : 'var(--primary-500)'
                      : 'var(--neutral-200)'
                  }`,
                  color: isActive
                    ? section.status === 'danger'
                      ? 'var(--danger-700)'
                      : 'var(--primary-700)'
                    : 'var(--neutral-600)'
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-6 h-6" />
                <span>{section.label}</span>
                {section.status === 'incomplete' && section.count > 0 && (
                  <motion.span
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: 'var(--warning-500)' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    {section.count}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.nav>

      {/* Content Section */}
      <motion.div
        className="card p-6 md:p-8 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {activeSection === 'profile' && <ProfileForm />}
        {activeSection === 'account' && <AccountSettingsForm />}
        {activeSection === 'chat' && <ChatPreferencesForm />}
        {activeSection === 'delete' && (
          <DeleteAccountSection onDeleteAccount={handleDeleteAccount} />
        )}

        {/* Logout Button (not shown on delete section) */}
        {activeSection !== 'delete' && (
          <motion.div
            className="mt-6 pt-6"
            style={{ borderTop: '1px solid var(--neutral-200)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={handleLogout}
              className="btn btn-outline w-full flex items-center justify-center gap-2"
              style={{ borderColor: 'var(--danger-500)', color: 'var(--danger-600)' }}
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default ProfileSettings;
