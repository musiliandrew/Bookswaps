import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLibrary } from '../../hooks/useLibrary';
import Input from '../Common/Input';
import Button from '../Common/Button';
import GenreTag from '../Common/GenreTag';
import ErrorMessage from '../Common/ErrorMessage';

const SearchBar = ({ onSearch, className = '' }) => {
  const { searchBooks, error, isLoading } = useLibrary();
  const [formData, setFormData] = useState({ query: '', genres: [] });
  const [formErrors, setFormErrors] = useState({});
  const availableGenres = [
    'Fiction', 'Non-Fiction', 'Sci-Fi', 'Fantasy', 'Mystery', 'Thriller',
    'Romance', 'Historical', 'Biography', 'Self-Help', 'Young Adult', 'Horror'
  ];

  const validateForm = () => {
    const errors = {};
    if (!formData.query && !formData.genres.length) {
      errors.form = 'Enter a search term or select a genre';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, query: e.target.value });
    setFormErrors({});
  };

  const handleGenreToggle = (genre) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const results = await searchBooks(formData);
    onSearch(results?.results || []);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`bookish-glass p-6 rounded-xl space-y-4 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
    >
      <Input
        name="query"
        type="text"
        value={formData.query}
        onChange={handleChange}
        placeholder="Search books by title or author"
        className="w-full"
      />
      <div className="flex flex-wrap gap-2">
        {availableGenres.map((genre) => (
          <GenreTag
            key={genre}
            genre={genre}
            onClick={() => handleGenreToggle(genre)}
            onRemove={formData.genres.includes(genre) ? () => handleGenreToggle(genre) : null}
          />
        ))}
      </div>
      {(error || formErrors.form) && <ErrorMessage message={error || formErrors.form} />}
      <Button
        type="submit"
        text={isLoading ? 'Searching...' : 'Search'}
        disabled={isLoading}
        className="w-full bookish-button-enhanced"
      />
    </motion.form>
  );
};

export default SearchBar;