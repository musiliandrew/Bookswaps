import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import Input from '../common/Input';
import ErrorMessage from '../auth/ErrorMessage';

function BookSearchForm({ onSubmit, error, isLoading, className = '' }) {
  const [formData, setFormData] = useState({ title: '', genres: [] });
  const [formErrors, setFormErrors] = useState({});

  const availableGenres = [
    'Fiction', 'Non-Fiction', 'Sci-Fi', 'Fantasy', 'Mystery', 'Thriller',
    'Romance', 'Historical', 'Biography', 'Self-Help', 'Young Adult', 'Horror'
  ];

  const validateForm = () => {
    const newErrors = {};
    if (formData.title && formData.title.length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    }
    if (!formData.title && !formData.genres.length) {
      newErrors.form = 'Please enter a title or select at least one genre';
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors((prev) => ({ ...prev, title: '', form: '' }));
  };

  const handleGenreToggle = (genre) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
    setFormErrors((prev) => ({ ...prev, form: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit(formData);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`bookish-glass bookish-shadow p-8 rounded-2xl space-y-6 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
    >
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Title */}
        <div>
          <Input
            label="Book Title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="Search by title"
            className="bookish-border"
            labelClassName="font-['Poppins'] text-[#333]"
            aria-describedby={formErrors.title ? 'error-title' : ''}
          />
          {formErrors.title && (
            <motion.p
              id="error-title"
              className="text-[#D32F2F] text-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              {formErrors.title}
            </motion.p>
          )}
        </div>
        {/* Genres */}
        <div>
          <label className="block text-sm font-['Poppins'] text-[#333] mb-2">
            Genres
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
        </div>
        {/* Error */}
        {(error || formErrors.form) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <ErrorMessage message={error || formErrors.form} />
          </motion.div>
        )}
        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <Button
            type="submit"
            text={isLoading ? 'Searching...' : 'Search'}
            disabled={isLoading}
            className="w-full bookish-button-enhanced bg-[#FF6F61] text-white"
          />
        </motion.div>
      </motion.div>
    </motion.form>
  );
}

export default BookSearchForm;