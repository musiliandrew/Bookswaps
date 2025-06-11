import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Input from '../Common/Input';
import Button from '../Common/Button';
import ErrorMessage from '../Common/ErrorMessage';
import GenreTag from '../Common/GenreTag';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const ProfileSettings = ({ className = '' }) => {
  const { profile, updateProfile, updateSettings, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    email: profile?.email || '',
    bio: profile?.bio || '',
    city: profile?.city || '',
    genres: profile?.genres || [],
    avatar: null,
    password: '',
    password_confirm: '',
    privacy: profile?.privacy || 'public',
    notifications: {
      swaps: profile?.notifications?.swaps ?? true,
      messages: profile?.notifications?.messages ?? true,
      preferences: profile?.notifications?.preferences ?? true,
    },
    notifications_count: [],
  });
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar || null);
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState(error);
  const [availableGenres] = useState([
    'Fiction', 'Non-Fiction', 'Sci-Fi', 'Fantasy', 'Mystery', 'Thriller',
    'Romance', 'Historical', 'Biography', 'Self-Help', 'Young Adult', 'Horror'
  ]);

  const validateForm = () => {
    const errors = {};
    if (!formData.username) errors.username = 'Username is required';
    else if (formData.username.length < 3) errors.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_-]{3,150}$/.test(formData.username))
      errors.username = 'Username can only contain letters, numbers, underscores, or hyphens';
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Please enter a valid email address';
    if (formData.bio && formData.bio.length > 500) errors.bio = 'Bio cannot exceed 500 characters';
    if (formData.password && formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (formData.password && formData.password !== formData.password_confirm)
      errors.password_confirm = 'Passwords do not match';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name.startsWith('notifications.')) {
        const key = name.split('.')[1];
        setFormData((prev) => ({
          ...prev,
          notifications: { ...prev.notifications, [key]: checked },
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avatar: file }));
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleGenreToggle = (genre) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Update profile
      const profileData = {
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        city: formData.city,
        genres: formData.genres,
        avatar: formData.avatar,
      };
      await updateProfile(profileData);

      // Update settings
      const settingsData = {
        email: formData.email,
        password: formData.password || undefined,
        privacy: formData.privacy,
        notifications: formData.notifications,
      };
      await updateSettings(settingsData);

      toast.success('Profile and settings updated successfully!');
    } catch {
      setServerError('Failed to update profile or settings. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData({
      username: profile?.username || '',
      email: profile?.email || '',
      bio: profile?.bio || '',
      city: profile?.city || '',
      genres: profile?.genres || [],
      avatar: null,
      password: '',
      password_confirm: '',
      privacy: profile?.privacy || 'public',
      notifications: {
        swaps: profile?.notifications?.swaps ?? true,
        messages: profile?.notifications?.messages ?? true,
        preferences: profile?.notifications?.preferences ?? true,
      },
      notifications_count: [],
    });
    setAvatarPreview(profile?.avatar || null);
    setFormErrors({});
    setServerError(null);
  };

  useEffect(() => {
    setServerError(error);
  }, [error]);

  const isDisabled = !formData.username || !formData.email || isLoading;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`bookish-glass p-8 rounded-xl space-y-6 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
    >
      <motion.h2
        className="text-2xl font-['Lora'] text-gradient"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Profile & Settings
      </motion.h2>
      <div className="space-y-6">
        {/* Avatar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label className="block text-sm font-['Lora'] text-[var(--primary)] mb-2">
            Profile Picture (Optional)
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[var(--accent)]">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[var(--secondary)] flex items-center justify-center text-[var(--text)] font-['Open_Sans']">
                  No Image
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="bookish-input text-sm text-[var(--text)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-['Open_Sans'] file:bg-[var(--accent)] file:text-white hover:file:bg-[var(--primary)]"
              aria-label="Upload profile picture"
            />
          </div>
        </motion.div>
        {/* Username */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Input
            label="Username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
            error={formErrors.username}
          />
        </motion.div>
        {/* Email */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            error={formErrors.email}
          />
        </motion.div>
        {/* Bio */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <label className="block text-sm font-['Lora'] text-[var(--primary)] mb-2">Bio (Optional)</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself (max 500 characters)"
            className="bookish-input w-full px-4 py-3 rounded-xl font-['Open_Sans'] text-[var(--text)] resize-none"
            rows="4"
            maxLength="500"
            aria-describedby={formErrors.bio ? 'error-bio' : ''}
          />
          {formErrors.bio && <ErrorMessage message={formErrors.bio} />}
        </motion.div>
        {/* City */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Input
            label="City (Optional)"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter your city"
          />
        </motion.div>
        {/* Genres */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <label className="block text-sm font-['Lora'] text-[var(--primary)] mb-2">Favorite Genres (Optional)</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {availableGenres.map((genre) => (
              <GenreTag
                key={genre}
                genre={genre}
                onRemove={formData.genres.includes(genre) ? () => handleGenreToggle(genre) : null}
                onClick={!formData.genres.includes(genre) ? () => handleGenreToggle(genre) : null}
              />
            ))}
          </div>
        </motion.div>
        {/* Password */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Input
            label="New Password (Optional)"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter new password"
            error={formErrors.password}
          />
        </motion.div>
        {/* Confirm Password */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Input
            label="Confirm New Password"
            name="password_confirm"
            type="password"
            value={formData.password_confirm}
            onChange={handleChange}
            placeholder="Confirm new password"
            error={formErrors.password_confirm}
          />
        </motion.div>
        {/* Privacy */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <label className="block text-sm font-['Lora'] text-[var(--primary)] mb-2">Privacy Settings</label>
          <select
            name="privacy"
            value={formData.privacy}
            onChange={handleChange}
            className="bookish-input w-full px-4 py-3 rounded-xl font-['Open_Sans'] text-[var(--text)]"
            aria-label="Select privacy setting"
          >
            <option value="public">Public</option>
            <option value="friends_only">Friends Only</option>
            <option value="private">Private</option>
          </select>
        </motion.div>
        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
          <label className="block text-sm font-['Lora'] text-[var(--primary)] mb-2">Notifications</label>
          <div className="space-y-2">
            {['swaps', 'messages', 'preferences'].map((key) => (
              <div key={key} className="flex items-center">
                <input
                  type="checkbox"
                  id={`notify-${key}`}
                  name={`notifications.${key}`}
                  checked={formData.notifications[key]}
                  onChange={handleChange}
                  className="checkbox-enhanced h-4 w-4"
                />
                <label htmlFor={`notify-${key}`} className="ml-2 text-sm font-['Open_Sans'] text-[var(--text)]">
                  {key.charAt(0).toUpperCase() + key.slice(1)} Notifications
                </label>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      {serverError && <ErrorMessage message={serverError} />}
      <motion.div className="flex space-x-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
        <Button type="submit" text={isLoading ? 'Saving...' : 'Save'} disabled={isDisabled} />
        <Button type="button" text="Cancel" onClick={handleCancel} className="bg-gray-600 hover:bg-gray-700" />
      </motion.div>
    </motion.form>
  );
};

export default ProfileSettings;