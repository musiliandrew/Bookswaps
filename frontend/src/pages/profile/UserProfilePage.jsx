import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ProfileForm from '../../components/profile/ProfileForm';
import SettingsForm from '../../components/profile/SettingsForm';
import AuthLink from '../../components/auth/AuthLink';
import Button from '../../components/common/Button';

function UserProfilePage() {
  const navigate = useNavigate();
  const { getProfile, updateProfile, updateAccountSettings, updateChatPreferences, deleteAccount, profile, error, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('access_token')) {
      navigate('/login');
    } else {
      getProfile();
    }
  }, [navigate, getProfile]);

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
    if (!error) {
      navigate('/login');
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--primary)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bookish-border p-6">
        <h2 className="text-center text-3xl font-extrabold text-[var(--primary)]">
          Your Profile
        </h2>
        <div className="mt-4 flex justify-center space-x-4">
          <button
            onClick={() => { setActiveTab('profile'); setIsEditing(false); }}
            className={`px-4 py-2 rounded ${activeTab === 'profile' ? 'bg-[var(--primary)] text-[var(--secondary)]' : 'bg-gray-200'}`}
          >
            Profile
          </button>
          <button
            onClick={() => { setActiveTab('settings'); setIsEditing(false); }}
            className={`px-4 py-2 rounded ${activeTab === 'settings' ? 'bg-[var(--primary)] text-[var(--secondary)]' : 'bg-gray-200'}`}
          >
            Settings
          </button>
        </div>
        {activeTab === 'profile' && (
          isEditing ? (
            <ProfileForm
              profile={profile}
              onSubmit={handleProfileSubmit}
              error={error}
              isLoading={isLoading}
            />
          ) : (
            <div className="mt-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--primary)]">
                  Username
                </label>
                <p className="mt-1 text-gray-600">{profile.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--primary)]">
                  Email
                </label>
                <p className="mt-1 text-gray-600">{profile.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--primary)]">
                  City
                </label>
                <p className="mt-1 text-gray-600">{profile.city || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--primary)]">
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
                    <p className="text-gray-600">None selected</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleEditToggle}
                className="w-full bg-[var(--primary)] text-[var(--secondary)] font-medium py-2 px-4 rounded hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full bg-red-600 text-white font-medium py-2 px-4 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                Delete Account
              </button>
              {showDeleteConfirm && (
                <div className="mt-4 p-4 bg-red-100 rounded">
                  <p className="text-red-600">Are you sure you want to delete your account? This cannot be undone.</p>
                  <div className="mt-4 flex space-x-4">
                    <Button
                      type="button"
                      text={isLoading ? 'Deleting...' : 'Confirm Delete'}
                      onClick={handleDeleteAccount}
                      disabled={isLoading}
                      className="w-full bg-red-600 hover:bg-red-700"
                    />
                    <Button
                      type="button"
                      text="Cancel"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="w-full bg-gray-500 hover:bg-gray-600"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        )}
        {activeTab === 'settings' && (
          isEditing ? (
            <SettingsForm
              initialSettings={{
                email: profile.email,
                privacy: profile.privacy || 'public',
                mute_societies: profile.chat_preferences?.mute_societies || [],
              }}
              onSubmit={handleSettingsSubmit}
              error={error}
              isLoading={isLoading}
            />
          ) : (
            <div className="mt-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--primary)]">
                  Email
                </label>
                <p className="mt-1 text-gray-600">{profile.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--primary)]">
                  Privacy
                </label>
                <p className="mt-1 text-gray-600">{profile.privacy || 'Public'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--primary)]">
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
                    <p className="text-gray-600">None</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleEditToggle}
                className="w-full bg-[var(--primary)] text-[var(--secondary)] font-medium py-2 px-4 rounded hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                Edit Settings
              </button>
            </div>
          )
        )}
        <div className="mt-4 text-center">
          <AuthLink to="/login" text="Sign Out" />
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;