import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const ProfileForm = ({ profile }) => {
  const { updateProfile, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    city: profile?.city || '',
    country: profile?.country || '',
    birth_date: profile?.birth_date || '',
    gender: profile?.gender || '',
    about_you: profile?.about_you || '',
    genres: profile?.genres?.join(', ') || '',
    profile_picture: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      genres: formData.genres.split(',').map((g) => g.trim()).filter(Boolean),
    };
    const result = await updateProfile(data);
    if (result) {
      toast.success('Profile updated successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-['Lora'] text-[var(--primary)] mb-4">Edit Profile</h2>
      <div>
        <label className="block text-[var(--secondary)] font-['Open_Sans']">Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="bookish-input w-full p-2 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-[var(--secondary)] font-['Open_Sans']">City</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          className="bookish-input w-full p-2 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-[var(--secondary)] font-['Open_Sans']">Country</label>
        <input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleChange}
          className="bookish-input w-full p-2 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-[var(--secondary)] font-['Open_Sans']">Birth Date</label>
        <input
          type="date"
          name="birth_date"
          value={formData.birth_date}
          onChange={handleChange}
          className="bookish-input w-full p-2 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-[var(--secondary)] font-['Open_Sans']">Gender</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="bookish-input w-full p-2 rounded-lg"
        >
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label className="block text-[var(--secondary)] font-['Open_Sans']">About You</label>
        <textarea
          name="about_you"
          value={formData.about_you}
          onChange={handleChange}
          className="bookish-input w-full p-2 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-[var(--secondary)] font-['Open_Sans']">Genres (comma-separated)</label>
        <input
          type="text"
          name="genres"
          value={formData.genres}
          onChange={handleChange}
          className="bookish-input w-full p-2 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-[var(--secondary)] font-['Open_Sans']">Profile Picture</label>
        <input
          type="file"
          name="profile_picture"
          onChange={handleChange}
          accept="image/*"
          className="bookish-input w-full p-2 rounded-lg"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="bookish-button-enhanced px-4 py-2 rounded-xl text-[var(--secondary)] disabled:opacity-50"
      >
        {isLoading ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
};

export default ProfileForm;