import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import Input from '../common/Input';
import ErrorMessage from '../auth/ErrorMessage';

function SettingsForm({ onSubmit, onCancel, error, isLoading, initialSettings, className = '' }) {
  const [formData, setFormData] = useState({
    email: initialSettings.email || '',
    password: '',
    password_confirm: '',
    privacy: initialSettings.privacy || 'public',
    mute_societies: initialSettings.mute_societies || [],
    notifications: {
      swaps: initialSettings.notifications?.swaps ?? true,
      messages: initialSettings.notifications?.messages ?? true,
      societies: initialSettings.notifications?.societies ?? true,
    },
  });
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState(error);
  const [availableSocieties, setAvailableSocieties] = useState([]); // Fetch from API

  // Mock fetching societies (replace with actual API call)
  useEffect(() => {
    // Simulate GET /discussions/societies/
    const fetchSocieties = async () => {
      try {
        // Replace with: const response = await fetch('/api/discussions/societies/');
        const mockSocieties = [
          { id: '1', name: 'Sci-Fi Readers' },
          { id: '2', name: 'Classic Literature' },
          { id: '3', name: 'Mystery Book Club' },
        ];
        setAvailableSocieties(mockSocieties);
      } catch {
        setServerError('Failed to load societies.');
      }
    };
    fetchSocieties();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password && formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Passwords do not match';
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (key) => {
    setFormData((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }));
  };

  const handleSocietyToggle = (societyId) => {
    setFormData((prev) => ({
      ...prev,
      mute_societies: prev.mute_societies.includes(societyId)
        ? prev.mute_societies.filter((id) => id !== societyId)
        : [...prev.mute_societies, societyId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      await onSubmit({
        email: formData.email || null,
        password: formData.password || null,
        privacy: formData.privacy,
        mute_societies: formData.mute_societies,
        notifications: formData.notifications,
      });
    } catch {
      setServerError('Failed to update settings. Please try again.');
    }
  };

  useEffect(() => {
    setServerError(error);
  }, [error]);

  const isDisabled =
    !formData.email &&
    !formData.password &&
    formData.privacy === initialSettings.privacy &&
    JSON.stringify(formData.mute_societies.sort()) === JSON.stringify((initialSettings.mute_societies || []).sort()) &&
    JSON.stringify(formData.notifications) === JSON.stringify(initialSettings.notifications || { swaps: true, messages: true, societies: true });

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`bookish-glass bookish-shadow p-8 rounded-2xl space-y-6 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
    >
      <div className="space-y-6">
        {/* Email */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="bookish-border"
            labelClassName="font-['Poppins'] text-[#333]"
            aria-describedby={formErrors.email ? 'error-email' : ''}
          />
          {formErrors.email && (
            <motion.p
              id="error-email"
              className="text-[#D32F2F] text-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              {formErrors.email}
            </motion.p>
          )}
        </motion.div>
        {/* Password */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Input
            label="New Password (Optional)"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter new password"
            className="bookish-border"
            labelClassName="font-['Poppins'] text-[#333]"
            aria-describedby={formErrors.password ? 'error-password' : ''}
          />
          {formErrors.password && (
            <motion.p
              id="error-password"
              className="text-[#D32F2F] text-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              {formErrors.password}
            </motion.p>
          )}
        </motion.div>
        {/* Confirm Password */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Input
            label="Confirm New Password"
            name="password_confirm"
            type="password"
            value={formData.password_confirm}
            onChange={handleChange}
            placeholder="Confirm new password"
            className="bookish-border"
            labelClassName="font-['Poppins'] text-[#333]"
            aria-describedby={formErrors.password_confirm ? 'error-password-confirm' : ''}
          />
          {formErrors.password_confirm && (
            <motion.p
              id="error-password-confirm"
              className="text-[#D32F2F] text-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              {formErrors.password_confirm}
            </motion.p>
          )}
        </motion.div>
        {/* Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <label className="block text-sm font-['Poppins'] text-[#333] mb-2">
            Privacy Settings
          </label>
          <select
            name="privacy"
            value={formData.privacy}
            onChange={handleChange}
            className="bookish-border w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6F61] focus:border-[#FF6F61] font-['Poppins'] text-[#333]"
            aria-label="Select privacy setting"
          >
            <option value="public">Public</option>
            <option value="friends_only">Friends Only</option>
            <option value="private">Private</option>
          </select>
        </motion.div>
        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <label className="block text-sm font-['Poppins'] text-[#333] mb-2">
            Notifications
          </label>
          <div className="space-y-2">
            {['swaps', 'messages', 'societies'].map((key) => (
              <div key={key} className="flex items-center">
                <input
                  type="checkbox"
                  id={`notify-${key}`}
                  checked={formData.notifications[key]}
                  onChange={() => handleNotificationToggle(key)}
                  className="bookish-border h-4 w-4 text-[#FF6F61] focus:ring-[#FF6F61]"
                />
                <label
                  htmlFor={`notify-${key}`}
                  className="ml-2 text-sm font-['Poppins'] text-[#333]"
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)} Notifications
                </label>
              </div>
            ))}
          </div>
        </motion.div>
        {/* Muted Societies */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <label className="block text-sm font-['Poppins'] text-[#333] mb-2">
            Muted Societies (Optional)
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {availableSocieties.map((society) => (
              <motion.button
                key={society.id}
                type="button"
                className={`society-tag px-3 py-1 rounded-full text-sm font-['Caveat'] ${
                  formData.mute_societies.includes(society.id)
                    ? 'bg-[#FF6F61] text-white'
                    : 'bg-[#F5E8C7] text-[#333]'
                }`}
                onClick={() => handleSocietyToggle(society.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {society.name}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
      {serverError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          <ErrorMessage message={serverError} />
        </motion.div>
      )}
      <motion.div
        className="flex space-x-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.3 }}
      >
        <Button
          type="submit"
          text={isLoading ? 'Saving...' : 'Save Settings'}
          disabled={isDisabled}
          className="w-full bookish-button-enhanced bg-[#FF6F61] text-white"
        />
        <Button
          type="button"
          text="Cancel"
          onClick={onCancel}
          className="w-full bookish-button-enhanced bg-[#B0B0B0] text-white"
        />
      </motion.div>
    </motion.form>
  );
}

export default SettingsForm;