import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
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

  // Dynamic background images
  const heroImages = [
    {
      src: '/src/assets/hero-bg.jpg',
      alt: 'Modern library with reference desk and bookshelves',
      objectPosition: '50% 50%',
    },
    {
      src: '/src/assets/reading-nook.jpg',
      alt: 'Cozy reading nook with person reading',
      objectPosition: '40% 50%',
    },
    {
      src: '/src/assets/warm-library.jpg',
      alt: 'Warm library reading room with clock',
      objectPosition: '50% 40%',
    },
  ];

  // Hero state
  const [currentImage, setCurrentImage] = useState(Math.floor(Math.random() * heroImages.length));

  // Rotate images every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

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

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

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
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Dynamic Background */}
      <AnimatePresence>
        <motion.img
          key={heroImages[currentImage].src}
          src={heroImages[currentImage].src}
          alt={heroImages[currentImage].alt}
          className="absolute inset-0 w-full h-full object-cover hero-image"
          style={{ objectPosition: heroImages[currentImage].objectPosition }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-text bg-opacity-20" />
      
      {/* Frosted-Glass Container */}
      <motion.div
        className="max-w-lg w-full bg-[var(--secondary)] bg-opacity-20 backdrop-blur-lg bookish-border p-8 rounded-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          className="text-center text-2xl sm:text-3xl font-['Lora'] text-[var(--primary)] text-shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Join BookSwap
        </motion.h2>
        <motion.p
          className="mt-2 text-center text-sm text-[var(--text)] font-['Open_Sans']"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Create an account to swap books and connect with readers.
        </motion.p>
        <motion.form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="space-y-4">
            <div>
              <Input
                label="Username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
                className="bookish-border"
                aria-describedby={formErrors.username ? 'error-username' : ''}
              />
              {formErrors.username && (
                <motion.p
                  id="error-username"
                  className="text-[var(--error)] text-sm mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {formErrors.username}
                </motion.p>
              )}
            </div>
            <div>
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
                className="bookish-border"
                aria-describedby={formErrors.email ? 'error-email' : ''}
              />
              {formErrors.email && (
                <motion.p
                  id="error-email"
                  className="text-[var(--error)] text-sm mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {formErrors.email}
                </motion.p>
              )}
            </div>
            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password (min. 8 characters)"
                required
                className="bookish-border"
                aria-describedby={formErrors.password ? 'error-password' : ''}
              />
              <motion.button
                type="button"
                className="absolute right-3 top-9 text-[var(--primary)] bookish-button--secondary"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                whileHover={{ scale: 1.05 }}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </motion.button>
            </div>
            {formErrors.password && (
              <motion.p
                id="error-password"
                className="text-[var(--error)] text-sm mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {formErrors.password}
              </motion.p>
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
                className="bookish-border"
                aria-describedby={formErrors.confirmPassword ? 'error-confirm-password' : ''}
              />
              <motion.button
                type="button"
                className="absolute right-3 top-9 text-[var(--primary)] bookish-button--secondary"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                whileHover={{ scale: 1.05 }}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </motion.button>
            </div>
            {formErrors.confirmPassword && (
              <motion.p
                id="error-confirm-password"
                className="text-[var(--error)] text-sm mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {formErrors.confirmPassword}
              </motion.p>
            )}
            <div>
              <Input
                label="City"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter your city (optional)"
                className="bookish-border"
              />
              <p className="text-[var(--accent)] text-xs mt-1 font-['Caveat']">Optional: Helps find local swappers</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--primary)] font-['Open_Sans']">
                Favorite Genres
              </label>
              <input
                type="text"
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                onKeyDown={handleGenreAdd}
                placeholder="Type a genre and press Enter (optional)"
                className="mt-1 block w-full px-3 py-2 bookish-border focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
              <p className="text-[var(--accent)] text-xs mt-1 font-['Caveat']">Optional: Tailors your book recommendations</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <AnimatePresence>
                  {formData.genres.map((genre) => (
                    <motion.span
                      key={genre}
                      className="bg-[var(--primary)] text-[var(--secondary)] px-2 py-1 rounded-full text-sm flex items-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {genre}
                      <button
                        type="button"
                        onClick={() => handleGenreRemove(genre)}
                        className="ml-2 text-[var(--secondary)]"
                        aria-label={`Remove ${genre}`}
                      >
                        ×
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="location_enabled"
                  checked={formData.location_enabled}
                  onChange={handleChange}
                  className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)] rounded"
                />
                <span className="ml-2 text-sm text-[var(--primary)] font-['Open_Sans']">
                  Enable location-based features
                </span>
              </label>
              <p className="text-[var(--accent)] text-xs mt-1 font-['Caveat']">Optional: Find nearby book lovers</p>
            </div>
          </div>
          {error && (
            <motion.p
              className="text-[var(--error)] text-sm text-center mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.p>
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Button
              type="submit"
              text={isLoading ? 'Signing up...' : 'Sign Up'}
              disabled={isLoading}
              className="w-full bookish-button bookish-button--primary"
            />
          </motion.div>
        </motion.form>
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <AuthLink
            to="/login"
            text="Already have an account? Sign in"
            className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default RegisterPage;