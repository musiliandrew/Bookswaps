import { useState } from 'react';
import { motion } from 'framer-motion';
import Input from '../Common/Input';
import Button from '../Common/Button';
import ErrorMessage from '../Common/ErrorMessage';
import AuthLink from '../Common/AuthLink';

const LoginForm = ({ className = '', onSubmit, error: externalError, isLoading: externalLoading }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!credentials.username) errors.username = 'Username is required';
    if (!credentials.password) errors.password = 'Password is required';
    if (credentials.password && credentials.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(credentials); // Use passed onSubmit
    }
  };

  const isDisabled = !credentials.username || !credentials.password || Object.keys(fieldErrors).length > 0;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`space-y-6 bookish-glass p-6 rounded-xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2
        className="text-2xl font-['Lora'] text-gradient"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Sign In
      </motion.h2>
      <div className="space-y-5">
        <Input
          label="Username or Email"
          name="username"
          type="text"
          value={credentials.username}
          onChange={handleChange}
          placeholder="Enter your username or email"
          required
          error={fieldErrors.username}
          autocomplete="username"
        />
        <div className="relative">
          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={credentials.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            error={fieldErrors.password}
            autocomplete="current-password"
          />
          <motion.button
            type="button"
            className="absolute right-3 top-9 text-[var(--primary)] hover:text-[var(--accent)]"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
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
      </div>
      <ErrorMessage message={externalError} />
      <Button
        type="submit"
        text={externalLoading ? 'Signing in...' : 'Sign In'}
        disabled={isDisabled || externalLoading}
      />
      <div className="text-center">
        <AuthLink to="/register" text="Don't have an account? Sign up" />
        <AuthLink to="/password-reset" text="Forgot password?" className="ml-2" />
      </div>
    </motion.form>
  );
};

export default LoginForm;