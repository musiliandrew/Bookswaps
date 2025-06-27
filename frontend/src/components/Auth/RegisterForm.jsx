import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../Common/Input';
import Button from '../Common/Button';
import AuthLink from '../Common/AuthLink';
import GenreTag from '../Common/GenreTag';
import FormProgress from '../Common/FormProgress';
import ErrorMessage from '../Common/ErrorMessage';

const RegisterForm = ({ className = '' }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    location_enabled: false,
    terms_agreed: false,
    genres: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [genreInput, setGenreInput] = useState('');
  const [fieldValidation, setFieldValidation] = useState({});
  const { register, isLoading, error } = useAuth();

  const calculateProgress = () => {
    const requiredFields = ['username', 'email', 'password', 'confirmPassword', 'terms_agreed'];
    const completed = requiredFields.filter((field) => formData[field]).length;
    return (completed / requiredFields.length) * 100;
  };

  const validateField = (name, value) => {
    let error = '';
    let success = false;

    switch (name) {
      case 'username':
        if (!value) error = 'Username is required';
        else if (value.length < 3) error = 'Username must be at least 3 characters';
        else if (!/^[a-zA-Z0-9_-]{3,150}$/.test(value))
          error = 'Username can only contain letters, numbers, underscores, and dashes';
        else success = true;
        break;
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(value)) error = 'Please enter a valid email address';
        else success = true;
        break;
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 8) error = 'Password must be at least 8 characters';
        else success = true;
        break;
      case 'confirmPassword':
        if (value !== formData.password) error = 'Passwords do not match';
        else if (value) success = true;
        break;
      case 'terms_agreed':
        if (!value) error = 'You must agree to the terms and conditions';
        else success = true;
        break;
    }

    return { error, success };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (name !== 'city' && name !== 'location_enabled') {
      const validation = validateField(name, newValue);
      setFieldValidation((prev) => ({ ...prev, [name]: validation }));
      setFormErrors((prev) => {
        if (validation.error) return { ...prev, [name]: validation.error };
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleGenreAdd = (e) => {
    if (e.key === 'Enter' && genreInput.trim()) {
      e.preventDefault();
      if (!formData.genres.includes(genreInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          genres: [...prev.genres, genreInput.trim()],
        }));
      }
      setGenreInput('');
    }
  };

  const handleGenreRemove = (genre) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.filter((g) => g !== genre),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const newValidation = {};
    ['username', 'email', 'password', 'confirmPassword', 'terms_agreed'].forEach((field) => {
      const validation = validateField(field, formData[field]);
      newValidation[field] = validation;
      if (validation.error) newErrors[field] = validation.error;
    });
    setFieldValidation(newValidation);
    setFormErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      await register(formData);
    }
  };

  const isFormValid =
    Object.keys(formErrors).length === 0 &&
    formData.username &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    formData.terms_agreed;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`space-y-5 bookish-glass p-6 rounded-xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <motion.h2
        className="text-2xl font-['Lora'] text-gradient"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Create Account
      </motion.h2>
      <FormProgress progress={calculateProgress()} />
      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          placeholder="Choose a unique username"
          required
          error={formErrors.username}
          success={fieldValidation.username?.success}
        />
        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email address"
          required
          error={formErrors.email}
          success={fieldValidation.email?.success}
        />
        <div className="relative">
          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password (min. 8 chars)"
            required
            error={formErrors.password}
            success={fieldValidation.password?.success}
          />
          <motion.button
            type="button"
            className="absolute right-3 top-9 text-[var(--primary)] hover:text-[var(--accent)]"
            onClick={() => setShowPassword(!showPassword)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </motion.button>
        </div>
        <div className="relative">
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
            error={formErrors.confirmPassword}
            success={fieldValidation.confirmPassword?.success}
          />
          <motion.button
            type="button"
            className="absolute right-3 top-9 text-[var(--primary)] hover:text-[var(--accent)]"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {showConfirmPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </motion.button>
        </div>
        <Input
          label="City"
          name="city"
          type="text"
          value={formData.city}
          onChange={handleChange}
          placeholder="Enter your city (optional)"
        />
        <p className="text-[var(--accent)] text-xs font-['Caveat'] -mt-3">
          💡 Helps you find local book swappers
        </p>
        <div className="space-y-3">
          <label className="block text-sm font-semibold font-['Lora'] text-[var(--primary)]">
            Favorite Genres
          </label>
          <motion.input
            type="text"
            value={genreInput}
            onChange={(e) => setGenreInput(e.target.value)}
            onKeyDown={handleGenreAdd}
            placeholder="Type a genre and press Enter"
            className="w-full px-4 py-3 rounded-xl font-['Open_Sans'] text-[var(--text)] placeholder-gray-400 bookish-input"
            whileFocus={{ scale: 1.02 }}
          />
          <p className="text-[var(--accent)] text-xs font-['Caveat']">
            📚 Helps us recommend books you'll love
          </p>
          <div className="flex flex-wrap gap-2 min-h-[2rem]">
            <AnimatePresence>
              {formData.genres.map((genre) => (
                <GenreTag key={genre} genre={genre} onRemove={handleGenreRemove} />
              ))}
            </AnimatePresence>
          </div>
        </div>
        <motion.div className="flex items-start space-x-3" whileHover={{ scale: 1.02 }}>
          <input
            type="checkbox"
            name="location_enabled"
            checked={formData.location_enabled}
            onChange={handleChange}
            className="checkbox-enhanced mt-1"
          />
          <label className="text-sm font-semibold font-['Lora'] text-[var(--primary)]">
            Enable location-based book swapping
            <p className="text-[var(--text)] text-xs font-['Open_Sans'] mt-1">
              Allow BookSwap to use your location to find nearby book swappers
            </p>
          </label>
        </motion.div>
        <motion.div className="flex items-start space-x-3" whileHover={{ scale: 1.02 }}>
          <input
            type="checkbox"
            name="terms_agreed"
            checked={formData.terms_agreed}
            onChange={handleChange}
            className="checkbox-enhanced mt-1"
          />
          <label className="text-sm font-semibold font-['Lora'] text-[var(--primary)]">
            I agree to the Terms and Conditions
            <p className="text-[var(--text)] text-xs font-['Open_Sans'] mt-1">
              By checking this, you agree to our{' '}
              <AuthLink to="/terms" text="Terms" className="inline-block" /> and{' '}
              <AuthLink to="/privacy" text="Privacy Policy" className="inline-block" />
            </p>
          </label>
        </motion.div>
        <ErrorMessage message={formErrors.terms_agreed || formErrors.general || error} />
      </div>
      <Button
        type="submit"
        text="Create Account"
        disabled={!isFormValid}
        isLoading={isLoading}
      />
      <div className="text-center">
        <AuthLink to="/login" text="Already have an account? Sign in" />
      </div>
    </motion.form>
  );
};

export default RegisterForm;