import { useState } from 'react';
import { motion } from 'framer-motion';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorMessage from './ErrorMessage';

const LoginForm = ({ onSubmit, error, isLoading, className = '' }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
    
    // Clear field error when user starts typing
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submit triggered with credentials:', credentials);
    if (validateForm()) {
      console.log('Validation passed, calling onSubmit');
      onSubmit(credentials);
    } else {
      console.log('Validation failed:', fieldErrors);
    }
  };

  const isDisabled = !credentials.username || !credentials.password || Object.keys(fieldErrors).length > 0;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`space-y-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="space-y-5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Input
            label="Username or Email"
            name="username"
            type="text"
            value={credentials.username}
            onChange={handleChange}
            placeholder="Enter your username or email"
            required
          />
          {fieldErrors.username && (
            <motion.p 
              className="mt-1 text-sm text-red-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {fieldErrors.username}
            </motion.p>
          )}
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={credentials.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
          
          <motion.button
            type="button"
            className="absolute right-3 top-9 text-[var(--primary)] hover:text-[var(--accent)] transition-colors duration-300 p-1"
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
          
          {fieldErrors.password && (
            <motion.p 
              className="mt-1 text-sm text-red-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {fieldErrors.password}
            </motion.p>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <ErrorMessage message={error} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Button
          type="submit"
          text={isLoading ? 'Signing in...' : 'Sign In'}
          disabled={isDisabled || isLoading}
          isLoading={isLoading}
        />
      </motion.div>
    </motion.form>
  );
};

export default LoginForm;