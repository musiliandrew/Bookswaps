import { useState } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import Input from '../common/Input';
import ErrorMessage from './ErrorMessage';

function LoginForm({ onSubmit, error, isLoading, className = '' }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting credentials:', credentials);
    onSubmit(credentials);
  };

  const isDisabled = !credentials.username || !credentials.password;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`space-y-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Input
            label="Username or Email"
            name="username"
            type="text"
            value={credentials.username}
            onChange={handleChange}
            placeholder="Enter your username or email"
            required
            className="bookish-border"
            labelClassName="font-['Lora'] text-[var(--primary)]"
          />
        </motion.div>
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={credentials.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            className="bookish-border"
            labelClassName="font-['Lora'] text-[var(--primary)]"
          />
          <motion.button
            type="button"
            className="absolute right-3 top-9 text-[var(--primary)]"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </motion.button>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <ErrorMessage message={error} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <Button
          type="submit"
          text={isLoading ? 'Logging in...' : 'Login'}
          disabled={isDisabled || isLoading}
          className="w-full bookish-button bookish-button--primary"
        />
      </motion.div>
    </motion.form>
  );
}

export default LoginForm;