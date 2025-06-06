import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import ProfileForm from '../../components/profile/ProfileForm';
import SettingsForm from '../../components/profile/SettingsForm';
import Button from '../../components/common/Button';
import { UserIcon } from '@heroicons/react/24/outline';

function UserProfilePage() {
  const navigate = useNavigate();
  const { getProfile, updateProfile, updateAccountSettings, updateChatPreferences, deleteAccount, logout, profile, error, isLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    if (isAuthenticated && !profile) {
      getProfile().catch(() => setGlobalError('Failed to load profile.'));
    } else if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, profile, getProfile, navigate]);

  const handleProfileSubmit = async (data) => {
    try {
      await updateProfile({
        city: data.city,
        country: data.country,
        age: data.age,
        about_you: data.bio,
        genres: data.genres,
        profile_picture: data.avatar,
      });
      setIsEditingProfile(false);
    } catch {
      setGlobalError('Failed to update profile.');
    }
  };

  const handleSettingsSubmit = async (data) => {
    try {
      // Update account settings (email, password, profile_public)
      await updateAccountSettings({
        email: data.email,
        password: data.password,
        profile_public: data.privacy === 'public',
      });
      // Update chat preferences (mute_societies)
      await updateChatPreferences({
        chat_preferences: {
          mute_societies: data.mute_societies,
        },
      });
      setIsEditingSettings(false);
    } catch {
      setGlobalError('Failed to update settings.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount(navigate);
    } catch {
      setGlobalError('Failed to delete account.');
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F5E8C7] flex items-center justify-center">
        <motion.p
          className="text-[#333] font-['Poppins']"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5E8C7] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full bookish-glass bookish-shadow p-8 rounded-2xl mx-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        <motion.h2
          className="text-center text-3xl font-['Playfair_Display'] text-[#FF6F61] mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Your BookSwap Profile
        </motion.h2>

        {/* Global Error */}
        <AnimatePresence>
          {(error || globalError) && (
            <motion.p
              className="text-[#D32F2F] text-sm text-center mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {globalError || error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Tab Navigation */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {['profile', 'settings'].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setIsEditingProfile(false);
                setIsEditingSettings(false);
              }}
              className={`px-4 py-2 rounded-full font-['Poppins'] text-sm ${
                activeTab === tab
                  ? 'bg-[#FF6F61] text-white'
                  : 'bg-[#F5E8C7] text-[#333] hover:bg-[#FFA726] hover:text-white'
              } transition-colors duration-200`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Avatar and Stats */}
                <div className="flex flex-col items-center">
                  <motion.div
                    className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#FF6F61]"
                    whileHover={{ scale: 1.05 }}
                  >
                    {profile.profile_picture ? (
                      <img
                        src={profile.profile_picture}
                        alt={`${profile.username}'s avatar`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#F5E8C7] flex items-center justify-center">
                        <UserIcon className="w-12 h-12 text-[#333]" />
                      </div>
                    )}
                  </motion.div>
                  <p className="mt-2 text-xl font-['Poppins'] text-[#333]">{profile.username}</p>
                  <div className="mt-2 flex space-x-4 text-sm text-[#333] font-['Poppins']">
                    <span>{profile.followers_count || 0} Followers</span>
                    <span>{profile.following_count || 0} Following</span>
                  </div>
                </div>
                {/* Profile Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-['Poppins'] text-[#333]">
                      Email
                    </label>
                    <p className="mt-1 text-[#333]">{profile.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-['Poppins'] text-[#333]">
                      Bio
                    </label>
                    <p className="mt-1 text-[#333]">{profile.about_you || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-['Poppins'] text-[#333]">
                      City
                    </label>
                    <p className="mt-1 text-[#333]">{profile.city || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-['Poppins'] text-[#333]">
                      Favorite Genres
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.genres?.length ? (
                        profile.genres.map((genre) => (
                          <span
                            key={genre}
                            className="genre-tag bg-[#FF6F61] text-white px-2 py-1 rounded-full text-sm font-['Caveat']"
                          >
                            {genre}
                          </span>
                        ))
                      ) : (
                        <p className="text-[#333]">None selected</p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    text="Edit Profile"
                    onClick={() => setIsEditingProfile(true)}
                    className="w-full bookish-button-enhanced bg-[#FF6F61] text-white"
                  />
                  <Button
                    type="button"
                    text="Delete Account"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full bookish-button-enhanced bg-[#D32F2F] text-white"
                  />
                </div>
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-['Poppins'] text-[#333]">
                    Email
                  </label>
                  <p className="mt-1 text-[#333]">{profile.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-['Poppins'] text-[#333]">
                    Privacy
                  </label>
                  <p className="mt-1 text-[#333]">
                    {profile.profile_public ? 'Public' : 'Private'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-['Poppins'] text-[#333]">
                    Muted Societies
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.chat_preferences?.mute_societies?.length ? (
                      profile.chat_preferences.mute_societies.map((society) => (
                        <span
                          key={society}
                          className="society-tag bg-[#FF6F61] text-white px-2 py-1 rounded-full text-sm font-['Caveat']"
                        >
                          {society}
                        </span>
                      ))
                    ) : (
                      <p className="text-[#333]">None</p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  text="Edit Settings"
                  onClick={() => setIsEditingSettings(true)}
                  className="w-full bookish-button-enhanced bg-[#FF6F61] text-white"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Profile Edit Modal */}
        <AnimatePresence>
          {isEditingProfile && (
            <motion.div
              className="fixed inset-0 bg-[#333] bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="max-w-md w-full bookish-glass bookish-shadow p-8 rounded-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProfileForm
                  profile={{
                    city: profile.city,
                    country: profile.country,
                    age: profile.age,
                    bio: profile.about_you,
                    genres: profile.genres || [],
                    avatar: profile.profile_picture,
                  }}
                  onSubmit={handleProfileSubmit}
                  onCancel={() => setIsEditingProfile(false)}
                  error={error}
                  isLoading={isLoading}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Edit Modal */}
        <AnimatePresence>
          {isEditingSettings && (
            <motion.div
              className="fixed inset-0 bg-[#333] bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="max-w-md w-full bookish-glass bookish-shadow p-8 rounded-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SettingsForm
                  initialSettings={{
                    email: profile.email,
                    privacy: profile.profile_public ? 'public' : 'private',
                    mute_societies: profile.chat_preferences?.mute_societies || [],
                  }}
                  onSubmit={handleSettingsSubmit}
                  onCancel={() => setIsEditingSettings(false)}
                  error={error}
                  isLoading={isLoading}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              className="fixed inset-0 bg-[#333] bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="max-w-md w-full bookish-glass bookish-shadow p-8 rounded-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-['Playfair_Display'] text-[#D32F2F]">
                  Delete Account
                </h3>
                <p className="mt-2 text-[#333] font-['Poppins']">
                  Are you sure you want to delete your account? This cannot be undone.
                </p>
                <div className="mt-4 flex space-x-4">
                  <Button
                    type="button"
                    text={isLoading ? 'Deleting...' : 'Confirm Delete'}
                    onClick={handleDeleteAccount}
                    disabled={isLoading}
                    className="w-full bookish-button-enhanced bg-[#D32F2F] text-white"
                  />
                  <Button
                    type="button"
                    text="Cancel"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="w-full bookish-button-enhanced bg-[#B0B0B0] text-white"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sign Out */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <button
            onClick={handleSignOut}
            className="text-[#333] hover:text-[#FFA726] font-['Poppins'] transition-colors"
          >
            Sign Out
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default UserProfilePage;