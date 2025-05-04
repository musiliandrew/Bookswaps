import { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import ErrorMessage from '../auth/ErrorMessage';

function UserSearchForm({ onSubmit, error, isLoading }) {
  const [formData, setFormData] = useState({ username: '', genres: [] });
  const [genreInput, setGenreInput] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    onSubmit(formData);
  };

  const isDisabled = !formData.username && !formData.genres.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          placeholder="Search by username"
        />
        <div>
          <label className="block text-sm font-medium text-[var(--primary)]">
            Genres
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
      <Button
        type="submit"
        text={isLoading ? 'Searching...' : 'Search'}
        disabled={isDisabled || isLoading}
        className="w-full"
      />
    </form>
  );
}

export default UserSearchForm;