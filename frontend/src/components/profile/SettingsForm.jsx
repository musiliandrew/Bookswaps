import { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import ErrorMessage from '../auth/ErrorMessage';

function SettingsForm({ onSubmit, error, isLoading, initialSettings }) {
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
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          aria-describedby={formErrors.email ? 'error-email' : ''}
        />
        {formErrors.email && (
          <p id="error-email" className="text-red-500 text-sm">
            {formErrors.email}
          </p>
        )}
        <Input
          label="New Password (Optional)"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter new password"
          aria-describedby={formErrors.password ? 'error-password' : ''}
        />
        {formErrors.password && (
          <p id="error-password" className="text-red-500 text-sm">
            {formErrors.password}
          </p>
        )}
        <Input
          label="Confirm New Password"
          name="password_confirm"
          type="password"
          value={formData.password_confirm}
          onChange={handleChange}
          placeholder="Confirm new password"
          aria-describedby={formErrors.password_confirm ? 'error-password-confirm' : ''}
        />
        {formErrors.password_confirm && (
          <p id="error-password-confirm" className="text-red-500 text-sm">
            {formErrors.password_confirm}
          </p>
        )}
        <div>
          <label className="block text-sm font-medium text-[var(--primary)]">
            Privacy Settings
          </label>
          <select
            name="privacy"
            value={formData.privacy}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--primary)]">
            Muted Societies (Optional)
          </label>
          <input
            type="text"
            value={societyInput}
            onChange={(e) => setSocietyInput(e.target.value)}
            onKeyDown={handleSocietyAdd}
            placeholder="Type a society ID and press Enter"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.mute_societies.map((society) => (
              <span
                key={society}
                className="bg-[var(--primary)] text-[var(--secondary)] px-2 py-1 rounded-full text-sm flex items-center"
              >
                {society}
                <button
                  type="button"
                  onClick={() => handleSocietyRemove(society)}
                  className="ml-2 text-[var(--secondary)]"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
      <ErrorMessage message={error} />
      <div className="flex space-x-4">
        <Button
          type="submit"
          text={isLoading ? 'Saving...' : 'Save Settings'}
          disabled={isDisabled || isLoading}
          className="w-full"
        />
        <Button
          type="button"
          text="Cancel"
          onClick={() => onSubmit(null)}
          className="w-full bg-gray-500 hover:bg-gray-600"
        />
      </div>
    </form>
  );
}

export default SettingsForm;