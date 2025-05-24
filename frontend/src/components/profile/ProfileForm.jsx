import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import Input from '../common/Input';
import ErrorMessage from '../auth/ErrorMessage';

function ProfileForm({ profile, onSubmit, error, isLoading, className = '' }) {
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
    <motion.form
      onSubmit={handleSubmit}
      className={`frosted-glass bookish-border p-6 rounded-lg space-y-6 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
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
            labelClassName="font-['Lora'] text-[var(--primary)]"
            aria-describedby={formErrors.username ? 'error-username' : ''}
          />
          {formErrors.username && (
            <motion.p
              id="error-username"
              className="text-[var(--error)] text-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              {formErrors.username}
            </motion.p>
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
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
            labelClassName="font-['Lora'] text-[var(--primary)]"
            aria-describedby={formErrors.email ? 'error-email' : ''}
          />
          {formErrors.email && (
            <motion.p
              id="error-email"
              className="text-[var(--error)] text-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              {formErrors.email}
            </motion.p>
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Input
            label="City (Optional)"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter your city"
            className="bookish-border"
            labelClassName="font-['Lora'] text-[var(--primary)]"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <label
            className="block text-sm font-['Lora'] text-[var(--primary)]"
          >
            Favorite Genres (Optional)
          </label>
          <input
            type="text"
            value={genreInput}
            onChange={(e) => setGenreInput(e.target.value)}
            onKeyDown={handleGenreAdd}
            placeholder="Type a genre and press Enter"
            className="mt-1 block w-full px-3 py-2 bookish-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.genres.map((genre) => (
              <motion.span
                key={genre}
                className="frosted-glass bookish-border px-2 py-1 rounded-full text-sm text-[var(--primary)] font-['Caveat'] flex items-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {genre}
                <button
                  type="button"
                  onClick={() => handleGenreRemove(genre)}
                  className="ml-2 text-[var(--primary)] hover:text-[var(--accent)]"
                >
                  ×
                </button>
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <ErrorMessage message={error} />
      </motion.div>
      <motion.div
        className="flex space-x-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.3 }}
      >
        <Button
          type="submit"
          text={isLoading ? 'Saving...' : 'Save'}
          disabled={isDisabled || isLoading}
          className="w-full bookish-button bookish-button--primary"
        />
        <Button
          type="button"
          text="Cancel"
          onClick={() => onSubmit(null)}
          className="w-full bookish-button bookish-button--secondary"
        />
      </motion.div>
    </motion.form>
  );
}

export default ProfileForm;