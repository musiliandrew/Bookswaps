import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../Common/Input';
import Button from '../Common/Button';
import ErrorMessage from '../Common/ErrorMessage';
import AuthLink from '../Common/AuthLink';

const PasswordResetForm = ({ className = '' }) => {
  const { token } = useParams();
  const [formData, setFormData] = useState({ email: '', new_password: '', confirm_password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { requestPasswordReset, confirmPasswordReset, isLoading, error } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (token) {
      if (formData.new_password !== formData.confirm_password) {
        return;
      }
      await confirmPasswordReset({ token, new_password: formData.new_password });
    } else {
      await requestPasswordReset({ email: formData.email });
    }
  };

  const isDisabled = token
    ? !formData.new_password ||
      !formData.confirm_password ||
      formData.new_password !== formData.confirm_password ||
      formData.new_password.length < 8
    : !formData.email;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`space-y-6 bookish-glass p-6 rounded-xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        className="text-2xl font-['Lora'] text-gradient"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {token ? 'Reset Password' : 'Request Password Reset'}
      </motion.h2>
      {token ? (
        <div className="space-y-4">
          <div className="relative">
            <Input
              label="New Password"
              name="new_password"
              type={showPassword ? 'text' : 'password'}
              value={formData.new_password}
              onChange={handleChange}
              placeholder="Enter new password (min. 8 characters)"
              required
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
          <Input
            label="Confirm Password"
            name="confirm_password"
            type={showPassword ? 'text' : 'password'}
            value={formData.confirm_password}
            onChange={handleChange}
            placeholder="Confirm new password"
            required
          />
        </div>
      ) : (
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />
      )}
      <ErrorMessage
        message={
          token && formData.new_password !== formData.confirm_password
            ? 'Passwords do not match'
            : error
        }
      />
      <Button
        type="submit"
        text={isLoading ? 'Processing...' : token ? 'Reset Password' : 'Send Reset Link'}
        disabled={isDisabled || isLoading}
      />
      <div className="text-center">
        <AuthLink to="/login" text="Back to Sign In" />
      </div>
    </motion.form>
  );
};

export default PasswordResetForm;