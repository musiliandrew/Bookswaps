import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import Input from '../common/Input';
import ErrorMessage from '../auth/ErrorMessage';

function ProfileForm({ profile, onSubmit, onCancel, error, isLoading, className = '' }) {
  const [formData, setFormData] = useState({
    username: profile.username || '',
    email: profile.email || '',
    bio: profile.bio || '',
    city: profile.city || '',
    genres: profile.genres || [],
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar || null);
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState(error);

  // Predefined genres
  const availableGenres = [
    'Fiction', 'Non-Fiction', 'Sci-Fi', 'Fantasy', 'Mystery', 'Thriller',
    'Romance', 'Historical', 'Biography', 'Self-Help', 'Young Adult', 'Horror'
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_-]{3,150}$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, underscores, and dashes';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio cannot exceed 500 characters';
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
    if (!validateForm()) {
      return;
    }
    try {
      await onSubmit(formData);
    } catch {
      setServerError('Failed to update profile. Please try again.');
    }
  };

  useEffect(() => {
    setServerError(error);
  }, [error]);

  const isDisabled = !formData.username || !formData.email || isLoading;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`bookish-glass bookish-shadow p-8 rounded-2xl space-y-6 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
    >
      <div className="space-y-6">
        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <label className="block text-sm font-['Poppins'] text-[#333] mb-2">
            Profile Picture (Optional)
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#FF6F61]">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#F5E8C7] flex items-center justify-center text-[#333] font-['Poppins']">
                  No Image
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="bookish-input text-sm text-[#333] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-['Poppins'] file:bg-[#FF6F61] file:text-white hover:file:bg-[#E65A50]"
              aria-label="Upload profile picture"
            />
          </div>
        </motion.div>
        {/* Username */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Input
            label="Username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
            className="bookish-border"
            labelClassName="font-['Poppins'] text-[#333]"
            aria-describedby={formErrors.username ? 'error-username' : ''}
          />
          {formErrors.username && (
            <motion.p
              id="error-username"
              className="text-[#D32F2F] text-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              {formErrors.username}
            </motion.p>
          )}
        </motion.div>
        {/* Email */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            className="bookish-border"
            labelClassName="font-['Poppins'] text-[#333]"
            aria-describedby={formErrors.email ? 'error-email' : ''}
          />
          {formErrors.email && (
            <motion.p
              id="error-email"
              className="text-[#D32F2F] text-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              {formErrors.email}
            </motion.p>
          )}
        </motion.div>
        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <label className="block text-sm font-['Poppins'] text-[#333] mb-2">
            Bio (Optional)
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself (max 500 characters)"
            className="bookish-border w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6F61] focus:border-[#FF6F61] font-['Poppins'] text-[#333] resize-none"
            rows="4"
            maxLength="500"
            aria-describedby={formErrors.bio ? 'error-bio' : ''}
          />
          {formErrors.bio && (
            <motion.p
              id="error-bio"
              className="text-[#D32F2F] text-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              {formErrors.bio}
            </motion.p>
          )}
        </motion.div>
        {/* City */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <Input
            label="City (Optional)"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter your city"
            className="bookish-border"
            labelClassName="font-['Poppins'] text-[#333]"
          />
        </motion.div>
        {/* Genres */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <label className="block text-sm font-['Poppins'] text-[#333] mb-2">
            Favorite Genres (Optional)
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {availableGenres.map((genre) => (
              <motion.button
                key={genre}
                type="button"
                className={`genre-tag px-3 py-1 rounded-full text-sm font-['Caveat'] ${
                  formData.genres.includes(genre)
                    ? 'bg-[#FF6F61] text-white'
                    : 'bg-[#F5E8C7] text-[#333]'
                }`}
                onClick={() => handleGenreToggle(genre)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {genre}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
      {serverError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          <ErrorMessage message={serverError} />
        </motion.div>
      )}
      <motion.div
        className="flex space-x-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.3 }}
      >
        <Button
          type="submit"
          text={isLoading ? 'Saving...' : 'Save'}
          disabled={isDisabled}
          className="w-full bookish-button-enhanced bg-[#FF6F61] text-white"
        />
        <Button
          type="button"
          text="Cancel"
          onClick={onCancel}
          className="w-full bookish-button-enhanced bg-[#B0B0B0] text-white"
        />
      </motion.div>
    </motion.form>
  );
}

export default ProfileForm;