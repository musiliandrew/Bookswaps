import { useState } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import Input from '../common/Input';
import ErrorMessage from './ErrorMessage';

function PasswordResetConfirmForm({ onSubmit, error, isLoading, className = '' }) {
  const [formData, setFormData] = useState({ new_password: '', confirm_password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      return;
    }
    onSubmit({ new_password: formData.new_password });
  };

  const isDisabled =
    !formData.new_password ||
    !formData.confirm_password ||
    formData.new_password !== formData.confirm_password ||
    formData.new_password.length < 8;

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
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Input
            label="New Password"
            name="new_password"
            type={showPassword ? 'text' : 'password'}
            value={formData.new_password}
            onChange={handleChange}
            placeholder="Enter new password (min. 8 characters)"
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
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Input
            label="Confirm Password"
            name="confirm_password"
            type={showPassword ? 'text' : 'password'}
            value={formData.confirm_password}
            onChange={handleChange}
            placeholder="Confirm new password"
            required
            className="bookish-border"
            labelClassName="font-['Lora'] text-[var(--primary)]"
          />
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <ErrorMessage
          message={
            formData.new_password !== formData.confirm_password
              ? 'Passwords do not match'
              : error
          }
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <Button
          type="submit"
          text={isLoading ? 'Resetting...' : 'Reset Password'}
          disabled={isDisabled || isLoading}
          className="w-full bookish-button bookish-button--primary"
        />
      </motion.div>
    </motion.form>
  );
}

export default PasswordResetConfirmForm;