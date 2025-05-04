import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/auth/ErrorMessage';
import AuthLink from '../../components/auth/AuthLink';

function RegisterPage() {
  const navigate = useNavigate();
  const { register, error, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    genres: [],
    location_enabled: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [genreInput, setGenreInput] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_-]{3,150}$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, underscores, and dashes';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleGenreAdd = (e) => {
    if (e.key === 'Enter' && genreInput.trim()) {
      e.preventDefault();
      setFormData((prevData) => ({
        ...prevData,
        genres: [...prevData.genres, genreInput.trim()],
      }));
      setGenreInput('');
    }
  };

  const handleGenreRemove = (genre) => {
    setFormData((prevData) => ({
      ...prevData,
      genres: prevData.genres.filter((g) => g !== genre),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      city: formData.city || null,
      genres: formData.genres,
      chat_preferences: {
        location_enabled: formData.location_enabled,
        mute_societies: [],
      },
    };

    await register(data);
  };

  useEffect(() => {
    if (!error && !isLoading && localStorage.getItem('access_token')) {
      navigate('/me/profile');
    }
  }, [error, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bookish-border p-6">
        <h2 className="text-center text-3xl font-extrabold text-[var(--primary)]">
          Join BookSwap
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create an account to start swapping books and connecting with readers.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <Input
              label="Username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
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
              placeholder="Enter your email address"
              required
              aria-describedby={formErrors.email ? 'error-email' : ''}
            />
            {formErrors.email && (
              <p id="error-email" className="text-red-500 text-sm">
                {formErrors.email}
              </p>
            )}
            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password (min. 8 characters)"
                required
                aria-describedby={formErrors.password ? 'error-password' : ''}
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-[var(--primary)]"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {formErrors.password && (
              <p id="error-password" className="text-red-500 text-sm">
                {formErrors.password}
              </p>
            )}
            <div className="relative">
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                aria-describedby={formErrors.confirmPassword ? 'error-confirm-password' : ''}
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-[var(--primary)]"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p id="error-confirm-password" className="text-red-500 text-sm">
                {formErrors.confirmPassword}
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
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="location_enabled"
                  checked={formData.location_enabled}
                  onChange={handleChange}
                  className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span className="ml-2 text-sm text-[var(--primary)]">
                  Enable location-based features
                </span>
              </label>
            </div>
          </div>
          <ErrorMessage message={error} />
          <Button
            type="submit"
            text={isLoading ? 'Signing up...' : 'Sign Up'}
            disabled={isLoading}
            className="w-full"
          />
        </form>
        <div className="mt-4 text-center">
          <AuthLink to="/login" text="Already have an account? Sign in" />
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;