import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import ProfileForm from '../../components/profile/ProfileForm';
import SettingsForm from '../../components/profile/SettingsForm';
import AuthLink from '../../components/auth/AuthLink';
import Button from '../../components/common/Button';
import { UserIcon } from '@heroicons/react/24/outline';

function UserProfilePage() {
  const navigate = useNavigate();
  const { getProfile, updateProfile, updateAccountSettings, updateChatPreferences, deleteAccount, profile, error, isLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Dynamic background images
  const heroImages = [
    {
      src: '/src/assets/hero-bg.jpg',
      alt: 'Modern library with reference desk and bookshelves',
      objectPosition: '50% 50%',
    },
    {
      src: '/src/assets/reading-nook.jpg',
      alt: 'Cozy reading nook with person reading',
      objectPosition: '40% 50%',
    },
    {
      src: '/src/assets/warm-library.jpg',
      alt: 'Warm library reading room with clock',
      objectPosition: '50% 40%',
    },
  ];

  // Hero state
  const [currentImage, setCurrentImage] = useState(Math.floor(Math.random() * heroImages.length));

  // Rotate images every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    if (isAuthenticated && !profile) {
      console.log('Calling getProfile in ProfilePage');
      getProfile();
    } else if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, profile, getProfile, navigate]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleProfileSubmit = async (data) => {
    if (!data) {
      setIsEditing(false);
      return;
    }
    await updateProfile(data);
    if (!error) {
      setIsEditing(false);
    }
  };

  const handleSettingsSubmit = async (data) => {
    if (!data) {
      setIsEditing(false);
      return;
    }
    await updateAccountSettings({
      email: data.email,
      password: data.password,
      privacy: data.privacy,
    });
    await updateChatPreferences({
      mute_societies: data.mute_societies,
    });
    if (!error) {
      setIsEditing(false);
    }
  };

  const handleDeleteAccount = async () => {
    await deleteAccount();
  };

  // Mock activity data (replace with API call, e.g., GET /users/me/activity/)
  const mockActivity = [
    { id: 1, action: 'Swapped "Dune" with BookLover123', timestamp: '2025-05-20T10:00:00Z' },
    { id: 2, action: 'Posted in Sci-Fi Society: "Best space operas?"', timestamp: '2025-05-19T15:30:00Z' },
    { id: 3, action: 'Added "Project Hail Mary" to library', timestamp: '2025-05-18T09:00:00Z' },
  ];

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <motion.p
          className="text-[var(--primary)]"
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Dynamic Background */}
      <AnimatePresence>
        <motion.img
          key={heroImages[currentImage].src}
          src={heroImages[currentImage].src}
          alt={heroImages[currentImage].alt}
          className="absolute inset-0 w-full h-full object-cover hero-image"
          style={{ objectPosition: heroImages[currentImage].objectPosition }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-text bg-opacity-20" />

      {/* Frosted-Glass Container */}
      <motion.div
        className="max-w-2xl w-full frosted-glass p-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          className="text-center text-2xl sm:text-3xl font-['Lora'] text-[var(--primary)] text-shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Your BookSwap Profile
        </motion.h2>

        {/* Tab Navigation */}
        <motion.div
          className="mt-6 flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {['profile', 'settings', 'activity'].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setIsEditing(false);
              }}
              className={`px-4 py-2 rounded-full font-['Open_Sans'] text-sm sm:text-base ${
                activeTab === tab
                  ? 'bg-[var(--primary)] text-[var(--secondary)]'
                  : 'bg-[var(--secondary)] bg-opacity-50 text-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--text)]'
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
            className="mt-8"
          >
            {activeTab === 'profile' && (
              <>
                {isEditing ? (
                  <ProfileForm
                    profile={profile}
                    onSubmit={handleProfileSubmit}
                    error={error}
                    isLoading={isLoading}
                    className="space-y-4"
                  />
                ) : (
                  <div className="space-y-6">
                    {/* Avatar and Stats */}
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full bg-[var(--primary)] flex items-center justify-center">
                        <UserIcon className="w-12 h-12 text-[var(--secondary)]" />
                      </div>
                      <p className="mt-2 text-xl font-['Lora'] text-[var(--primary)]">{profile.username}</p>
                      <div className="mt-2 flex space-x-4 text-sm text-[var(--text)]">
                        <span>{profile.swaps || 0} Swaps</span>
                        <span>{profile.books || 0} Books</span>
                        <span>{profile.posts || 0} Posts</span>
                      </div>
                    </div>
                    {/* Profile Details */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--primary)] font-['Open_Sans']">
                          Email
                        </label>
                        <p className="mt-1 text-[var(--text)]">{profile.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--primary)] font-['Open_Sans']">
                          City
                        </label>
                        <p className="mt-1 text-[var(--text)]">{profile.city || 'Not set'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--primary)] font-['Open_Sans']">
                          Favorite Genres
                        </label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {profile.genres?.length ? (
                            profile.genres.map((genre) => (
                              <span
                                key={genre}
                                className="bg-[var(--primary)] text-[var(--secondary)] px-2 py-1 rounded-full text-sm"
                              >
                                {genre}
                              </span>
                            ))
                          ) : (
                            <p className="text-[var(--text)]">None selected</p>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        text="Edit Profile"
                        onClick={handleEditToggle}
                        className="w-full bookish-button bookish-button--primary"
                      />
                      <Button
                        type="button"
                        text="Delete Account"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full bookish-button bg-[var(--error)] hover:bg-opacity-90"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
            {activeTab === 'settings' && (
              <>
                {isEditing ? (
                  <SettingsForm
                    initialSettings={{
                      email: profile.email,
                      privacy: profile.privacy || 'public',
                      mute_societies: profile.chat_preferences?.mute_societies || [],
                    }}
                    onSubmit={handleSettingsSubmit}
                    error={error}
                    isLoading={isLoading}
                    className="space-y-4"
                  />
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[var(--primary)] font-['Open_Sans']">
                        Email
                      </label>
                      <p className="mt-1 text-[var(--text)]">{profile.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--primary)] font-['Open_Sans']">
                        Privacy
                      </label>
                      <p className="mt-1 text-[var(--text)]">{profile.privacy || 'Public'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--primary)] font-['Open_Sans']">
                        Muted Societies
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {profile.chat_preferences?.mute_societies?.length ? (
                          profile.chat_preferences.mute_societies.map((society) => (
                            <span
                              key={society}
                              className="bg-[var(--primary)] text-[var(--secondary)] px-2 py-1 rounded-full text-sm"
                            >
                              {society}
                            </span>
                          ))
                        ) : (
                          <p className="text-[var(--text)]">None</p>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      text="Edit Settings"
                      onClick={handleEditToggle}
                      className="w-full bookish-button bookish-button--primary"
                    />
                  </div>
                )}
              </>
            )}
            {activeTab === 'activity' && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-['Lora'] text-[var(--primary)]">Recent Activity</h3>
                {mockActivity.length ? (
                  mockActivity.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="p-4 bg-[var(--secondary)] bg-opacity-30 rounded-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <p className="text-[var(--text)]">{item.action}</p>
                      <p className="text-sm text-[var(--accent)] font-['Caveat'] mt-1">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-[var(--text)]">No recent activity.</p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              className="fixed inset-0 bg-text bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="max-w-md w-full frosted-glass p-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-['Lora'] text-[var(--error)]">Delete Account</h3>
                <p className="mt-2 text-[var(--text)]">
                  Are you sure you want to delete your account? This cannot be undone.
                </p>
                <div className="mt-4 flex space-x-4">
                  <Button
                    type="button"
                    text={isLoading ? 'Deleting...' : 'Confirm Delete'}
                    onClick={handleDeleteAccount}
                    disabled={isLoading}
                    className="w-full bookish-button bg-[var(--error)] hover:bg-opacity-90"
                  />
                  <Button
                    type="button"
                    text="Cancel"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="w-full bookish-button bookish-button--secondary"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sign Out Link */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <AuthLink
            to="/login"
            text="Sign Out"
            className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default UserProfilePage;