import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import Input from '../common/Input';
import ErrorMessage from './ErrorMessage';

function PasswordResetConfirmForm({ onSubmit, error, isLoading }) {
  const [formData, setFormData] = useState({ new_password: '', confirm_password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
          <button
            type="button"
            className="absolute right-3 top-9 text-[var(--primary)]"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>
        <div className="relative">
          <Input
            label="Confirm Password"
            name="confirm_password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirm_password}
            onChange={handleChange}
            placeholder="Confirm new password"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-9 text-[var(--primary)]"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
          >
            {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <ErrorMessage
        message={
          formData.new_password !== formData.confirm_password
            ? 'Passwords do not match'
            : error
        }
      />
      <Button
        type="submit"
        text={isLoading ? 'Resetting...' : 'Reset Password'}
        disabled={isDisabled || isLoading}
        className="w-full"
      />
    </form>
  );
}

export default PasswordResetConfirmForm;