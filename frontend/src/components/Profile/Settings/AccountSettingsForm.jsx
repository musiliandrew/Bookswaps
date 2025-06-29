import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';
import {
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  LockClosedIcon,
  BellIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const AccountSettingsForm = () => {
  const { profile, updateAccountSettings, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    profile_public: true,
    email_notifications: true,
  });
  const [originalData, setOriginalData] = useState({});
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Populate form with profile data when profile loads
  useEffect(() => {
    if (profile) {
      const data = {
        email: profile.email || '',
        password: '',
        confirmPassword: '',
        profile_public: profile.profile_public ?? true,
        email_notifications: profile.email_notifications ?? true,
      };
      setFormData(data);
      setOriginalData({
        email: profile.email || '',
        profile_public: profile.profile_public ?? true,
        email_notifications: profile.email_notifications ?? true,
      });
    }
  }, [profile]);

  // Check for changes
  useEffect(() => {
    const changed = Object.keys(originalData).some(key => {
      return formData[key] !== originalData[key];
    }) || showPasswordFields;
    setHasChanges(changed);
  }, [formData, originalData, showPasswordFields]);

  // Validation
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        if (showPasswordFields) {
          if (!value) {
            newErrors.password = 'Password is required';
          } else if (value.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
          } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
            newErrors.password = 'Password must contain uppercase, lowercase, and number';
          } else {
            delete newErrors.password;
          }
        }
        break;
      case 'confirmPassword':
        if (showPasswordFields) {
          if (!value) {
            newErrors.confirmPassword = 'Please confirm your password';
          } else if (value !== formData.password) {
            newErrors.confirmPassword = 'Passwords do not match';
          } else {
            delete newErrors.confirmPassword;
          }
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    validateField(name, newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const fieldsToValidate = ['email'];
    if (showPasswordFields) {
      fieldsToValidate.push('password', 'confirmPassword');
    }

    const isValid = fieldsToValidate.every(field =>
      validateField(field, formData[field])
    );

    if (!isValid) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    // Prepare data for API
    const submitData = {
      email: formData.email,
      profile_public: formData.profile_public,
      email_notifications: formData.email_notifications,
    };

    // Only include password if it's being changed
    if (showPasswordFields && formData.password) {
      submitData.password = formData.password;
    }

    const result = await updateAccountSettings(submitData);
    if (result) {
      toast.success('Account settings updated successfully!');
      // Update original data to reflect changes
      setOriginalData({
        email: formData.email,
        profile_public: formData.profile_public,
        email_notifications: formData.email_notifications,
      });
      // Reset password fields after successful update
      if (showPasswordFields) {
        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: '',
        }));
        setShowPasswordFields(false);
        setShowPassword(false);
        setShowConfirmPassword(false);
      }
    }
  };

  const getFieldStatus = (fieldName) => {
    if (errors[fieldName]) return 'error';
    if (formData[fieldName] !== originalData[fieldName]) return 'changed';
    return 'normal';
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--primary)]/20 rounded-xl">
            <ShieldCheckIcon className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-2xl font-['Lora'] font-bold text-[var(--primary)]">Account Settings</h2>
            <p className="text-sm text-[var(--text)]/70">Manage your account security and preferences</p>
          </div>
        </div>

        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full text-sm font-medium"
          >
            <ExclamationTriangleIcon className="w-4 h-4" />
            Unsaved changes
          </motion.div>
        )}
      </div>

      {/* Email Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <EnvelopeIcon className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="text-lg font-['Lora'] font-semibold text-[var(--primary)]">Email Settings</h3>
        </div>

        <div className="space-y-2">
          <label className="block text-[var(--primary)] font-['Open_Sans'] font-medium">
            Email Address
            {getFieldStatus('email') === 'changed' && (
              <span className="ml-2 text-xs text-[var(--accent)]">• Modified</span>
            )}
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full p-3 rounded-lg border transition-all ${
                getFieldStatus('email') === 'error'
                  ? 'border-red-500 focus:border-red-500 bg-red-50/50'
                  : getFieldStatus('email') === 'changed'
                  ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                  : 'border-[var(--primary)]/20 focus:border-[var(--accent)]'
              }`}
              placeholder="your@email.com"
            />
            {getFieldStatus('email') === 'changed' && (
              <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--accent)]" />
            )}
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>
      </motion.div>

      {/* Password Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <LockClosedIcon className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="text-lg font-['Lora'] font-semibold text-[var(--primary)]">Password Settings</h3>
        </div>

        {!showPasswordFields ? (
          <div className="p-4 rounded-lg border border-[var(--primary)]/10 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--accent)]/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-[var(--primary)] font-medium">Password is secure</p>
                <p className="text-sm text-[var(--text)]/70">Click to change your password</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordFields(true)}
              className="flex items-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white px-4 py-2 rounded-lg font-medium font-['Open_Sans'] transition-all hover:scale-[1.02]"
            >
              <LockClosedIcon className="w-4 h-4" />
              Change Password
            </button>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 p-4 border border-[var(--accent)]/30 rounded-lg bg-[var(--accent)]/5"
            >
              <div className="space-y-2">
                <label className="block text-[var(--primary)] font-['Open_Sans'] font-medium">
                  New Password
                  {errors.password && (
                    <span className="ml-2 text-xs text-red-500">• Error</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full p-3 pr-12 rounded-lg border transition-all ${
                      errors.password
                        ? 'border-red-500 focus:border-red-500 bg-red-50/50'
                        : 'border-[var(--primary)]/20 focus:border-[var(--accent)]'
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text)]/60 hover:text-[var(--primary)] transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-[var(--primary)] font-['Open_Sans'] font-medium">
                  Confirm New Password
                  {errors.confirmPassword && (
                    <span className="ml-2 text-xs text-red-500">• Error</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full p-3 pr-12 rounded-lg border transition-all ${
                      errors.confirmPassword
                        ? 'border-red-500 focus:border-red-500 bg-red-50/50'
                        : formData.confirmPassword && formData.confirmPassword === formData.password
                        ? 'border-green-500 bg-green-50/50'
                        : 'border-[var(--primary)]/20 focus:border-[var(--accent)]'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text)]/60 hover:text-[var(--primary)] transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
                )}
                {formData.confirmPassword && formData.confirmPassword === formData.password && !errors.confirmPassword && (
                  <p className="text-green-600 text-sm flex items-center gap-1">
                    <CheckIcon className="w-4 h-4" />
                    Passwords match
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordFields(false);
                    setFormData(prev => ({
                      ...prev,
                      password: '',
                      confirmPassword: '',
                    }));
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.password;
                      delete newErrors.confirmPassword;
                      return newErrors;
                    });
                    setShowPassword(false);
                    setShowConfirmPassword(false);
                  }}
                  className="px-4 py-2 border border-[var(--primary)]/30 text-[var(--primary)] rounded-lg hover:bg-[var(--primary)]/10 font-medium font-['Open_Sans'] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* Privacy Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <GlobeAltIcon className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="text-lg font-['Lora'] font-semibold text-[var(--primary)]">Privacy Settings</h3>
        </div>

        <div className="space-y-3">
          <motion.div
            className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
              formData.profile_public !== originalData.profile_public
                ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                : 'border-[var(--primary)]/10 hover:border-[var(--primary)]/20'
            }`}
            whileHover={{ scale: 1.01 }}
          >
            <div className="relative">
              <input
                type="checkbox"
                name="profile_public"
                id="profile_public"
                checked={formData.profile_public}
                onChange={handleChange}
                className="w-5 h-5 text-[var(--accent)] bg-transparent border-2 border-[var(--primary)]/30 rounded focus:ring-[var(--accent)] focus:ring-2 transition-colors"
              />
              {formData.profile_public !== originalData.profile_public && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--accent)] rounded-full flex items-center justify-center">
                  <CheckIcon className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <label htmlFor="profile_public" className="text-[var(--primary)] font-['Open_Sans'] font-medium cursor-pointer">
                  Public Profile
                </label>
                {formData.profile_public !== originalData.profile_public && (
                  <span className="text-xs text-[var(--accent)] font-medium">• Modified</span>
                )}
              </div>
              <p className="text-sm text-[var(--text)]/70 mt-1">
                Allow other users to view your profile and book collections
              </p>
              <div className="flex items-center gap-1 mt-2">
                <GlobeAltIcon className="w-4 h-4 text-[var(--text)]/50" />
                <span className="text-xs text-[var(--text)]/60">
                  {formData.profile_public ? 'Visible to everyone' : 'Only visible to you'}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
              formData.email_notifications !== originalData.email_notifications
                ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                : 'border-[var(--primary)]/10 hover:border-[var(--primary)]/20'
            }`}
            whileHover={{ scale: 1.01 }}
          >
            <div className="relative">
              <input
                type="checkbox"
                name="email_notifications"
                id="email_notifications"
                checked={formData.email_notifications}
                onChange={handleChange}
                className="w-5 h-5 text-[var(--accent)] bg-transparent border-2 border-[var(--primary)]/30 rounded focus:ring-[var(--accent)] focus:ring-2 transition-colors"
              />
              {formData.email_notifications !== originalData.email_notifications && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--accent)] rounded-full flex items-center justify-center">
                  <CheckIcon className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <label htmlFor="email_notifications" className="text-[var(--primary)] font-['Open_Sans'] font-medium cursor-pointer">
                  Email Notifications
                </label>
                {formData.email_notifications !== originalData.email_notifications && (
                  <span className="text-xs text-[var(--accent)] font-medium">• Modified</span>
                )}
              </div>
              <p className="text-sm text-[var(--text)]/70 mt-1">
                Receive notifications about messages, follows, and book swap updates
              </p>
              <div className="flex items-center gap-1 mt-2">
                <BellIcon className="w-4 h-4 text-[var(--text)]/50" />
                <span className="text-xs text-[var(--text)]/60">
                  {formData.email_notifications ? 'Notifications enabled' : 'Notifications disabled'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="pt-4"
      >
        <button
          type="submit"
          disabled={isLoading || !hasChanges}
          className={`w-full px-6 py-4 rounded-lg font-medium font-['Open_Sans'] transition-all ${
            hasChanges
              ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white hover:shadow-lg hover:scale-[1.02]'
              : 'bg-[var(--secondary)]/50 text-[var(--text)]/50 cursor-not-allowed'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              Updating Settings...
            </span>
          ) : hasChanges ? (
            <span className="flex items-center justify-center gap-2">
              <CheckIcon className="w-5 h-5" />
              Save Account Settings
            </span>
          ) : (
            'No Changes to Save'
          )}
        </button>

        {hasChanges && (
          <p className="text-center text-sm text-[var(--text)]/60 mt-2">
            You have unsaved changes. Click "Save Account Settings" to update.
          </p>
        )}
      </motion.div>
    </motion.form>
  );
};

export default AccountSettingsForm;