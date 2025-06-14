import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const AccountSettingsForm = ({ profile }) => {
  const { updateAccountSettings, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: profile?.email || '',
    password: '',
    profile_public: profile?.profile_public ?? true,
    email_notifications: profile?.email_notifications ?? true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      email: formData.email,
      password: formData.password || undefined,
      profile_public: formData.profile_public,
      email_notifications: formData.email_notifications,
    };
    const result = await updateAccountSettings(data);
    if (result) {
      toast.success('Account settings updated successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-['Lora'] text-[var(--primary)] mb-4">Account Settings</h2>
      <div>
        <label className="block text-[var(--secondary)] font-['Open_Sans']">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="bookish-input w-full p-2 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-[var(--secondary)] font-['Open_Sans']">New Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="bookish-input w-full p-2 rounded-lg"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="profile_public"
          checked={formData.profile_public}
          onChange={handleChange}
          className="checkbox-enhanced"
        />
        <label className="text-[var(--secondary)] font-['Open_Sans']">Public Profile</label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="email_notifications"
          checked={formData.email_notifications}
          onChange={handleChange}
          className="checkbox-enhanced"
        />
        <label className="text-[var(--secondary)] font-['Open_Sans']">Email Notifications</label>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="bookish-button-enhanced px-4 py-2 rounded-xl text-[var(--secondary)] disabled:opacity-50"
      >
        {isLoading ? 'Updating...' : 'Update Settings'}
      </button>
    </form>
  );
};

export default AccountSettingsForm;