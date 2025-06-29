import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';
import {
  CameraIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  UserIcon
} from '@heroicons/react/24/outline';

// Enhanced helper function to parse genres - handles multiple levels of encoding
const parseGenres = (genres) => {
  if (!genres) return [];

  // Helper function to clean a single genre string
  const cleanGenre = (genre) => {
    if (typeof genre !== 'string') return genre;

    // Remove various quote and bracket combinations
    let cleaned = genre
      .replace(/^[[\\]"']+|[[\\]"']+$/g, '') // Remove leading/trailing brackets and quotes
      .replace(/\\"/g, '"') // Unescape quotes
      .replace(/\\'/g, "'") // Unescape single quotes
      .trim();

    return cleaned;
  };

  // If it's already an array, process each item
  if (Array.isArray(genres)) {
    return genres
      .map(genre => {
        if (typeof genre === 'string') {
          // Check if this string contains a JSON array
          if (genre.includes('[') && genre.includes(']')) {
            try {
              // Try to parse as JSON
              const parsed = JSON.parse(genre);
              if (Array.isArray(parsed)) {
                return parsed.map(cleanGenre);
              }
            } catch {
              // If JSON parsing fails, manually extract genres
              const match = genre.match(/\[(.*)\]/);
              if (match) {
                return match[1]
                  .split(',')
                  .map(g => cleanGenre(g))
                  .filter(g => g && g.length > 0);
              }
            }
          }

          // Handle comma-separated genres in a single string
          if (genre.includes(',')) {
            return genre.split(',').map(cleanGenre);
          }

          return cleanGenre(genre);
        }
        return genre;
      })
      .flat() // Flatten nested arrays
      .filter(genre => genre && typeof genre === 'string' && genre.length > 0)
      .map(genre => genre.charAt(0).toUpperCase() + genre.slice(1)); // Capitalize
  }

  // If it's a string, try multiple parsing approaches
  if (typeof genres === 'string') {
    // First, try direct JSON parsing
    try {
      const parsed = JSON.parse(genres);
      return parseGenres(parsed); // Recursively parse
    } catch {
      // If that fails, try to extract from the string manually

      // Handle cases like: ["[\"Sci-fi\", \"Fiction\"]"]
      if (genres.includes('[') && genres.includes(']')) {
        // Extract everything between the outermost brackets
        const match = genres.match(/\[(.*)\]/);
        if (match) {
          const innerContent = match[1];

          // Try to parse the inner content as JSON
          try {
            const innerParsed = JSON.parse(`[${innerContent}]`);
            return parseGenres(innerParsed);
          } catch {
            // Manual parsing - split by comma and clean
            return innerContent
              .split(',')
              .map(cleanGenre)
              .filter(genre => genre && genre.length > 0)
              .map(genre => genre.charAt(0).toUpperCase() + genre.slice(1));
          }
        }
      }

      // Fallback: treat as comma-separated string
      return genres
        .split(',')
        .map(cleanGenre)
        .filter(genre => genre && genre.length > 0)
        .map(genre => genre.charAt(0).toUpperCase() + genre.slice(1));
    }
  }

  return [];
};

const ProfileForm = () => {
  const { profile, updateProfile, isLoading } = useAuth();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    username: '',
    city: '',
    country: '',
    birth_date: '',
    gender: '',
    about_you: '',
    genres: [],
    profile_picture: null,
  });

  const [originalData, setOriginalData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [newGenre, setNewGenre] = useState('');
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Popular genre suggestions
  const popularGenres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
    'Fantasy', 'Biography', 'History', 'Self-Help', 'Thriller',
    'Horror', 'Poetry', 'Drama', 'Adventure', 'Comedy'
  ];

  // Populate form with profile data when profile loads
  useEffect(() => {
    if (profile) {
      const cleanedGenres = parseGenres(profile.favorite_genres);
      const data = {
        username: profile.username || '',
        city: profile.city || '',
        country: profile.country || '',
        birth_date: profile.birth_date || '',
        gender: profile.gender || '',
        about_you: profile.about_you || '',
        genres: cleanedGenres,
        profile_picture: null,
      };
      setFormData(data);
      setOriginalData(data);
      setImagePreview(profile.profile_picture);
    }
  }, [profile]);

  // Check for changes
  useEffect(() => {
    const changed = Object.keys(formData).some(key => {
      if (key === 'profile_picture') return formData[key] !== null;
      if (key === 'genres') return JSON.stringify(formData[key]) !== JSON.stringify(originalData[key]);
      return formData[key] !== originalData[key];
    });
    setHasChanges(changed);
  }, [formData, originalData]);

  // Validation
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'username':
        if (!value.trim()) {
          newErrors.username = 'Username is required';
        } else if (value.length < 3) {
          newErrors.username = 'Username must be at least 3 characters';
        } else {
          delete newErrors.username;
        }
        break;
      case 'about_you':
        if (value.length > 500) {
          newErrors.about_you = 'Bio must be less than 500 characters';
        } else {
          delete newErrors.about_you;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleImageSelect = (file) => {
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setFormData(prev => ({ ...prev, profile_picture: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, profile_picture: null }));
    setImagePreview(profile?.profile_picture || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addGenre = (genre) => {
    if (genre && !formData.genres.includes(genre)) {
      setFormData(prev => ({
        ...prev,
        genres: [...prev.genres, genre]
      }));
    }
    setNewGenre('');
  };

  const removeGenre = (genreToRemove) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.filter(genre => genre !== genreToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const isValid = Object.keys(formData).every(key =>
      validateField(key, formData[key])
    );

    if (!isValid) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    // Prepare submit data - ONLY include changed fields
    const submitData = {};

    // Compare each field with original data and only include changed fields
    Object.keys(formData).forEach(key => {
      const currentValue = formData[key];
      const originalValue = originalData[key];

      // Special handling for different field types
      if (key === 'profile_picture') {
        // Only include profile_picture if a new file was selected
        if (currentValue instanceof File) {
          submitData[key] = currentValue;
        }
      } else if (key === 'genres') {
        // Compare arrays properly
        const currentGenres = Array.isArray(currentValue) ? currentValue : [];
        const originalGenres = Array.isArray(originalValue) ? originalValue : [];

        if (JSON.stringify(currentGenres.sort()) !== JSON.stringify(originalGenres.sort())) {
          submitData[key] = currentGenres;
        }
      } else {
        // For other fields, compare values and only include if changed
        if (currentValue !== originalValue) {
          // Don't send empty strings - let backend preserve existing values
          if (currentValue !== '' || originalValue !== '') {
            submitData[key] = currentValue;
          }
        }
      }
    });

    // If no fields changed, show message and return
    if (Object.keys(submitData).length === 0) {
      toast.info('No changes to save');
      return;
    }

    console.log('Submitting only changed fields:', submitData); // Debug log

    const result = await updateProfile(submitData);
    if (result) {
      toast.success('Profile updated successfully!');
      // Update original data to reflect changes
      setOriginalData({ ...formData, profile_picture: null });
      setFormData(prev => ({ ...prev, profile_picture: null }));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getFieldStatus = (fieldName) => {
    if (errors[fieldName]) return 'error';
    if (formData[fieldName] !== originalData[fieldName]) return 'changed';
    return 'normal';
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--primary)]/20 rounded-xl">
            <UserIcon className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-2xl font-['Lora'] font-bold text-[var(--primary)]">Edit Profile</h2>
            <p className="text-sm text-[var(--text)]/70">Update your personal information</p>
          </div>
        </div>

        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full text-sm font-medium"
          >
            <ExclamationTriangleIcon className="w-4 h-4" />
            Unsaved changes
          </motion.div>
        )}
      </div>

      {/* Profile Picture Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <label className="block text-[var(--primary)] font-['Open_Sans'] font-medium">
          Profile Picture
        </label>

        <div className="flex items-center gap-6">
          {/* Current/Preview Image */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-[var(--primary)]/20 bg-[var(--secondary)]/20">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-[var(--text)]/40" />
                </div>
              )}
            </div>

            {formData.profile_picture && (
              <motion.button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <XMarkIcon className="w-4 h-4" />
              </motion.button>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageSelect(e.target.files[0])}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[var(--primary)]/30 rounded-lg hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all"
            >
              <CameraIcon className="w-5 h-5 text-[var(--primary)]" />
              <span className="text-[var(--primary)] font-medium">
                {imagePreview ? 'Change Photo' : 'Upload Photo'}
              </span>
            </button>
            <p className="text-xs text-[var(--text)]/60 mt-1">
              JPG, PNG or GIF (max 5MB)
            </p>
          </div>
        </div>
      </motion.div>

      {/* Username Field */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <label className="block text-[var(--primary)] font-['Open_Sans'] font-medium">
          Username
          {getFieldStatus('username') === 'changed' && (
            <span className="ml-2 text-xs text-[var(--accent)]">• Modified</span>
          )}
        </label>
        <div className="relative">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`w-full p-3 rounded-lg border transition-all ${
              getFieldStatus('username') === 'error'
                ? 'border-red-500 focus:border-red-500 bg-red-50/50'
                : getFieldStatus('username') === 'changed'
                ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                : 'border-[var(--primary)]/20 focus:border-[var(--accent)]'
            }`}
            placeholder="Enter your username"
          />
          {getFieldStatus('username') === 'changed' && (
            <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--accent)]" />
          )}
        </div>
        {errors.username && (
          <p className="text-red-500 text-sm">{errors.username}</p>
        )}
      </motion.div>

      {/* Location Fields */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="space-y-2">
          <label className="block text-[var(--primary)] font-['Open_Sans'] font-medium">
            City
            {getFieldStatus('city') === 'changed' && (
              <span className="ml-2 text-xs text-[var(--accent)]">• Modified</span>
            )}
          </label>
          <div className="relative">
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border transition-all ${
                getFieldStatus('city') === 'changed'
                  ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                  : 'border-[var(--primary)]/20 focus:border-[var(--accent)]'
              }`}
              placeholder="Your city"
            />
            {getFieldStatus('city') === 'changed' && (
              <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--accent)]" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[var(--primary)] font-['Open_Sans'] font-medium">
            Country
            {getFieldStatus('country') === 'changed' && (
              <span className="ml-2 text-xs text-[var(--accent)]">• Modified</span>
            )}
          </label>
          <div className="relative">
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border transition-all ${
                getFieldStatus('country') === 'changed'
                  ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                  : 'border-[var(--primary)]/20 focus:border-[var(--accent)]'
              }`}
              placeholder="Your country"
            />
            {getFieldStatus('country') === 'changed' && (
              <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--accent)]" />
            )}
          </div>
        </div>
      </motion.div>

      {/* Birth Date and Gender */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="space-y-2">
          <label className="block text-[var(--primary)] font-['Open_Sans'] font-medium">
            Birth Date
            {getFieldStatus('birth_date') === 'changed' && (
              <span className="ml-2 text-xs text-[var(--accent)]">• Modified</span>
            )}
          </label>
          <div className="relative">
            <input
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border transition-all ${
                getFieldStatus('birth_date') === 'changed'
                  ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                  : 'border-[var(--primary)]/20 focus:border-[var(--accent)]'
              }`}
            />
            {getFieldStatus('birth_date') === 'changed' && (
              <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--accent)]" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[var(--primary)] font-['Open_Sans'] font-medium">
            Gender
            {getFieldStatus('gender') === 'changed' && (
              <span className="ml-2 text-xs text-[var(--accent)]">• Modified</span>
            )}
          </label>
          <div className="relative">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border transition-all ${
                getFieldStatus('gender') === 'changed'
                  ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                  : 'border-[var(--primary)]/20 focus:border-[var(--accent)]'
              }`}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            {getFieldStatus('gender') === 'changed' && (
              <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--accent)]" />
            )}
          </div>
        </div>
      </motion.div>

      {/* About You */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-2"
      >
        <label className="block text-[var(--primary)] font-['Open_Sans'] font-medium">
          About You
          {getFieldStatus('about_you') === 'changed' && (
            <span className="ml-2 text-xs text-[var(--accent)]">• Modified</span>
          )}
          <span className="ml-2 text-xs text-[var(--text)]/60">
            ({formData.about_you.length}/500)
          </span>
        </label>
        <div className="relative">
          <textarea
            name="about_you"
            value={formData.about_you}
            onChange={handleChange}
            rows={4}
            maxLength={500}
            className={`w-full p-3 rounded-lg border transition-all resize-none ${
              getFieldStatus('about_you') === 'error'
                ? 'border-red-500 focus:border-red-500 bg-red-50/50'
                : getFieldStatus('about_you') === 'changed'
                ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                : 'border-[var(--primary)]/20 focus:border-[var(--accent)]'
            }`}
            placeholder="Tell us about yourself, your reading interests..."
          />
          {getFieldStatus('about_you') === 'changed' && (
            <CheckIcon className="absolute right-3 top-3 w-5 h-5 text-[var(--accent)]" />
          )}
        </div>
        {errors.about_you && (
          <p className="text-red-500 text-sm">{errors.about_you}</p>
        )}
      </motion.div>

      {/* Interactive Genres Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <label className="block text-[var(--primary)] font-['Open_Sans'] font-medium">
          Favorite Genres
          {JSON.stringify(formData.genres) !== JSON.stringify(originalData.genres) && (
            <span className="ml-2 text-xs text-[var(--accent)]">• Modified</span>
          )}
        </label>

        {/* Current Genres */}
        <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-3 border border-[var(--primary)]/20 rounded-lg bg-[var(--secondary)]/10">
          <AnimatePresence>
            {formData.genres.map((genre, index) => (
              <motion.span
                key={genre}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--accent)]/20 text-[var(--primary)] rounded-full text-sm font-medium"
              >
                {genre}
                <button
                  type="button"
                  onClick={() => removeGenre(genre)}
                  className="ml-1 hover:text-red-500 transition-colors"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>

          {formData.genres.length === 0 && (
            <span className="text-[var(--text)]/50 text-sm">No genres selected</span>
          )}
        </div>

        {/* Add New Genre */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newGenre}
            onChange={(e) => setNewGenre(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addGenre(newGenre);
              }
            }}
            className="flex-1 p-2 border border-[var(--primary)]/20 rounded-lg focus:border-[var(--accent)] transition-colors"
            placeholder="Add a genre..."
          />
          <button
            type="button"
            onClick={() => addGenre(newGenre)}
            disabled={!newGenre.trim()}
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Popular Genres */}
        <div>
          <p className="text-sm text-[var(--text)]/70 mb-2">Popular genres:</p>
          <div className="flex flex-wrap gap-2">
            {popularGenres
              .filter(genre => !formData.genres.includes(genre))
              .slice(0, 8)
              .map(genre => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => addGenre(genre)}
                  className="px-3 py-1 border border-[var(--primary)]/30 text-[var(--primary)] rounded-full text-sm hover:bg-[var(--primary)]/10 transition-colors"
                >
                  + {genre}
                </button>
              ))
            }
          </div>
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="pt-4"
      >
        <button
          type="submit"
          disabled={isLoading || !hasChanges}
          className={`w-full px-6 py-4 rounded-lg font-medium font-['Open_Sans'] transition-all ${
            hasChanges
              ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white hover:shadow-lg hover:scale-[1.02]'
              : 'bg-[var(--secondary)]/50 text-[var(--text)]/50 cursor-not-allowed'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              Updating Profile...
            </span>
          ) : hasChanges ? (
            <span className="flex items-center justify-center gap-2">
              <CheckIcon className="w-5 h-5" />
              Save Changes
            </span>
          ) : (
            'No Changes to Save'
          )}
        </button>

        {hasChanges && (
          <p className="text-center text-sm text-[var(--text)]/60 mt-2">
            You have unsaved changes. Click "Save Changes" to update your profile.
          </p>
        )}
      </motion.div>
    </motion.form>
  );
};

export default ProfileForm;