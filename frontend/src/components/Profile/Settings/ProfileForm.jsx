import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';

// Enhanced helper function to parse genres
const parseGenres = (genres) => {
  if (!genres) return [];

  if (Array.isArray(genres)) {
    return genres
      .map(genre => {
        if (typeof genre === 'string') {
          let cleaned = genre;
          cleaned = cleaned.replace(/^\["|"\]$/g, '');
          cleaned = cleaned.replace(/^"|"$/g, '');
          cleaned = cleaned.replace(/\\"/g, '"');

          if (cleaned.includes('","') || cleaned.includes('", "')) {
            return cleaned.split(/",\s*"/).map(g => g.replace(/^"|"$/g, '').trim());
          }

          return cleaned.trim();
        }
        return genre;
      })
      .flat()
      .filter(genre => genre && genre.length > 0)
      .map(genre => genre.charAt(0).toUpperCase() + genre.slice(1));
  }

  if (typeof genres === 'string') {
    try {
      const parsed = JSON.parse(genres);
      return parseGenres(parsed);
    } catch {
      let cleaned = genres;
      cleaned = cleaned.replace(/[\[\]"\\]/g, '');

      return cleaned
        .split(',')
        .map(genre => genre.trim())
        .filter(genre => genre.length > 0)
        .map(genre => genre.charAt(0).toUpperCase() + genre.slice(1));
    }
  }

  return [];
};

const ProfileForm = () => {
  const { profile, updateProfile, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    city: '',
    country: '',
    birth_date: '',
    gender: '',
    about_you: '',
    genres: '',
    profile_picture: null,
  });

  // Populate form with profile data when profile loads
  useEffect(() => {
    if (profile) {
      const cleanedGenres = parseGenres(profile.genres);
      setFormData({
        username: profile.username || '',
        city: profile.city || '',
        country: profile.country || '',
        birth_date: profile.birth_date || '',
        gender: profile.gender || '',
        about_you: profile.about_you || '',
        genres: cleanedGenres.join(', '),
        profile_picture: null, // Always null for file input
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Don't send empty profile_picture
    const submitData = { ...formData };
    if (!submitData.profile_picture) {
      delete submitData.profile_picture;
    }

    // Convert genres string to array
    if (submitData.genres) {
      submitData.genres = submitData.genres.split(',').map((g) => g.trim()).filter(Boolean);
    }

    const result = await updateProfile(submitData);
    if (result) {
      toast.success('Profile updated successfully!');
      // Reset file input
      const fileInput = document.querySelector('input[name="profile_picture"]');
      if (fileInput) fileInput.value = '';
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl">
          <span className="text-2xl">👤</span>
        </div>
        <div>
          <h2 className="text-2xl font-lora font-bold text-primary">Edit Profile</h2>
          <p className="text-sm text-primary/70">Update your personal information</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <label className="block text-primary font-medium mb-2">Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full p-4 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary placeholder-primary/60 transition-all duration-300 hover:bg-white/20 focus:bg-white/30"
          placeholder="Enter your username"
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[var(--secondary)] font-['Open_Sans'] mb-1">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="bookish-input w-full p-3 rounded-lg border border-[var(--secondary)]/20 focus:border-[var(--accent)] transition-colors"
            placeholder="Your city"
          />
        </div>
        
        <div>
          <label className="block text-[var(--secondary)] font-['Open_Sans'] mb-1">Country</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="bookish-input w-full p-3 rounded-lg border border-[var(--secondary)]/20 focus:border-[var(--accent)] transition-colors"
            placeholder="Your country"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[var(--secondary)] font-['Open_Sans'] mb-1">Birth Date</label>
          <input
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
            className="bookish-input w-full p-3 rounded-lg border border-[var(--secondary)]/20 focus:border-[var(--accent)] transition-colors"
          />
        </div>
        
        <div>
          <label className="block text-[var(--secondary)] font-['Open_Sans'] mb-1">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="bookish-input w-full p-3 rounded-lg border border-[var(--secondary)]/20 focus:border-[var(--accent)] transition-colors"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[var(--secondary)] font-['Open_Sans'] mb-1">About You</label>
        <textarea
          name="about_you"
          value={formData.about_you}
          onChange={handleChange}
          rows={4}
          className="bookish-input w-full p-3 rounded-lg border border-[var(--secondary)]/20 focus:border-[var(--accent)] transition-colors resize-none"
          placeholder="Tell us about yourself, your reading interests..."
        />
      </div>

      <div>
        <label className="block text-[var(--secondary)] font-['Open_Sans'] mb-1">
          Favorite Genres
          <span className="text-sm text-[var(--secondary)]/70 ml-1">(comma-separated)</span>
        </label>
        <input
          type="text"
          name="genres"
          value={formData.genres}
          onChange={handleChange}
          className="bookish-input w-full p-3 rounded-lg border border-[var(--secondary)]/20 focus:border-[var(--accent)] transition-colors"
          placeholder="Fiction, Mystery, Romance, Science Fiction..."
        />
      </div>

      <div>
        <label className="block text-[var(--secondary)] font-['Open_Sans'] mb-1">Profile Picture</label>
        <input
          type="file"
          name="profile_picture"
          onChange={handleChange}
          accept="image/*"
          className="bookish-input w-full p-3 rounded-lg border border-[var(--secondary)]/20 focus:border-[var(--accent)] transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--accent)]/10 file:text-[var(--accent)] hover:file:bg-[var(--accent)]/20"
        />
        <p className="text-xs text-[var(--secondary)]/60 mt-1">
          Supported formats: JPG, PNG, GIF (max 5MB)
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="bookish-button-enhanced w-full px-6 py-3 rounded-xl text-[var(--secondary)] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:transform hover:scale-[1.02]"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            Updating Profile...
          </span>
        ) : (
          'Update Profile'
        )}
      </button>
    </motion.form>
  );
};

export default ProfileForm;