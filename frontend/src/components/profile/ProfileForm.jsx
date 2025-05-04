import { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import ErrorMessage from '../auth/ErrorMessage';

function ProfileForm({ profile, onSubmit, error, isLoading }) {
  const [formData, setFormData] = useState({
    username: profile.username || '',
    email: profile.email || '',
    city: profile.city || '',
    genres: profile.genres || [],
  });
  const [genreInput, setGenreInput] = useState('');
  const [formErrors, setFormErrors] = useState({});

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
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGenreAdd = (e) => {
    if (e.key === 'Enter' && genreInput.trim()) {
      e.preventDefault();
      setFormData((prev) => ({
        ...prev,
        genres: [...prev.genres, genreInput.trim()],
      }));
      setGenreInput('');
    }
  };

  const handleGenreRemove = (genre) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.filter((g) => g !== genre),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    onSubmit({
      username: formData.username,
      email: formData.email,
      city: formData.city || null,
      genres: formData.genres,
    });
  };

  const isDisabled = !formData.username || !formData.email;

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4">
        <Input
          label="Username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter your username"
          required
          aria-describedby={formErrors.username ? 'error-username' : ''}
        />
        {formErrors.username && (
          <p id="error-username" className="text-red-500 text-sm">
            {formErrors.username}
          </p>
        )}
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
          aria-describedby={formErrors.email ? 'error-email' : ''}
        />
        {formErrors.email && (
          <p id="error-email" className="text-red-500 text-sm">
            {formErrors.email}
          </p>
        )}
        <Input
          label="City (Optional)"
          name="city"
          type="text"
          value={formData.city}
          onChange={handleChange}
          placeholder="Enter your city"
        />
        <div>
          <label className="block text-sm font-medium text-[var(--primary)]">
            Favorite Genres (Optional)
          </label>
          <input
            type="text"
            value={genreInput}
            onChange={(e) => setGenreInput(e.target.value)}
            onKeyDown={handleGenreAdd}
            placeholder="Type a genre and press Enter"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.genres.map((genre) => (
              <span
                key={genre}
                className="bg-[var(--primary)] text-[var(--secondary)] px-2 py-1 rounded-full text-sm flex items-center"
              >
                {genre}
                <button
                  type="button"
                  onClick={() => handleGenreRemove(genre)}
                  className="ml-2 text-[var(--secondary)]"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
      <ErrorMessage message={error} />
      <div className="flex space-x-4">
        <Button
          type="submit"
          text={isLoading ? 'Saving...' : 'Save'}
          disabled={isDisabled || isLoading}
          className="w-full"
        />
        <Button
          type="button"
          text="Cancel"
          onClick={() => onSubmit(null)}
          className="w-full bg-gray-500 hover:bg-gray-600"
        />
      </div>
    </form>
  );
}

export default ProfileForm;