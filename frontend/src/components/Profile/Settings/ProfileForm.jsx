import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';

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
      setFormData({
        username: profile.username || '',
        city: profile.city || '',
        country: profile.country || '',
        birth_date: profile.birth_date || '',
        gender: profile.gender || '',
        about_you: profile.about_you || '',
        genres: Array.isArray(profile.genres) ? profile.genres.join(', ') : (profile.genres || ''),
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-['Lora'] text-[var(--primary)] mb-4">Edit Profile</h2>
      
      <div>
        <label className="block text-[var(--secondary)] font-['Open_Sans'] mb-1">Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="bookish-input w-full p-3 rounded-lg border border-[var(--secondary)]/20 focus:border-[var(--accent)] transition-colors"
          placeholder="Enter your username"
        />
      </div>

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
    </form>
  );
};

export default ProfileForm;