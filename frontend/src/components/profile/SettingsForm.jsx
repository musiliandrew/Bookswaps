import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import Input from '../common/Input';
import ErrorMessage from '../auth/ErrorMessage';

function SettingsForm({ onSubmit, error, isLoading, initialSettings, className = '' }) {
  const [formData, setFormData] = useState({
    email: initialSettings.email || '',
    password: '',
    password_confirm: '',
    privacy: initialSettings.privacy || 'public',
    mute_societies: initialSettings.mute_societies || [],
  });
  const [societyInput, setSocietyInput] = useState('');
  const [formErrors, setFormErrors] = useState({});

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

  const handleSocietyAdd = (e) => {
    if (e.key === 'Enter' && societyInput.trim()) {
      e.preventDefault();
      setFormData((prev) => ({
        ...prev,
        mute_societies: [...prev.mute_societies, societyInput.trim()],
      }));
      setSocietyInput('');
    }
  };

  const handleSocietyRemove = (society) => {
    setFormData((prev) => ({
      ...prev,
      mute_societies: prev.mute_societies.filter((s) => s !== society),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    onSubmit({
      email: formData.email || null,
      password: formData.password || null,
      privacy: formData.privacy,
      mute_societies: formData.mute_societies,
    });
  };

  const isDisabled = !formData.email && !formData.password && formData.privacy === initialSettings.privacy && formData.mute_societies.length === initialSettings.mute_societies?.length;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`frosted-glass bookish-border p-6 rounded-lg space-y-6 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-4">
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
            labelClassName="font-['Lora'] text-[var(--primary)]"
            aria-describedby={formErrors.email ? 'error-email' : ''}
          />
          {formErrors.email && (
            <motion.p
              id="error-email"
              className="text-[var(--error)] text-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              {formErrors.email}
            </motion.p>
          )}
        </motion.div>
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
            labelClassName="font-['Lora'] text-[var(--primary)]"
            aria-describedby={formErrors.password ? 'error-password' : ''}
          />
          {formErrors.password && (
            <motion.p
              id="error-password"
              className="text-[var(--error)] text-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              {formErrors.password}
            </motion.p>
          )}
        </motion.div>
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
            labelClassName="font-['Lora'] text-[var(--primary)]"
            aria-describedby={formErrors.password_confirm ? 'error-password-confirm' : ''}
          />
          {formErrors.password_confirm && (
            <motion.p
              id="error-password-confirm"
              className="text-[var(--error)] text-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              {formErrors.password_confirm}
            </motion.p>
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <label
            className="block text-sm font-['Lora'] text-[var(--primary)]"
          >
            Privacy Settings
          </label>
          <select
            name="privacy"
            value={formData.privacy}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bookish-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <label
            className="block text-sm font-['Lora'] text-[var(--primary)]"
          >
            Muted Societies (Optional)
          </label>
          <input
            type="text"
            value={societyInput}
            onChange={(e) => setSocietyInput(e.target.value)}
            onKeyDown={handleSocietyAdd}
            placeholder="Type a society ID and press Enter"
            className="mt-1 block w-full px-3 py-2 bookish-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.mute_societies.map((society) => (
              <motion.span
                key={society}
                className="frosted-glass bookish-border px-2 py-1 rounded-full text-sm text-[var(--primary)] font-['Caveat'] flex items-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {society}
                <button
                  type="button"
                  onClick={() => handleSocietyRemove(society)}
                  className="ml-2 text-[var(--primary)] hover:text-[var(--accent)]"
                >
                  ×
                </button>
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.3 }}
      >
        <ErrorMessage message={error} />
      </motion.div>
      <motion.div
        className="flex space-x-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.3 }}
      >
        <Button
          type="submit"
          text={isLoading ? 'Saving...' : 'Save Settings'}
          disabled={isDisabled || isLoading}
          className="w-full bookish-button bookish-button--primary"
        />
        <Button
          type="button"
          text="Cancel"
          onClick={() => onSubmit(null)}
          className="w-full bookish-button bookish-button--secondary"
        />
      </motion.div>
    </motion.form>
  );
}

export default SettingsForm;