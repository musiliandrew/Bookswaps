import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const AccountSettingsForm = () => {
  const { profile, updateAccountSettings, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    profile_public: true,
    email_notifications: true,
  });
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // Populate form with profile data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        email: profile.email || '',
        profile_public: profile.profile_public ?? true,
        email_notifications: profile.email_notifications ?? true,
      }));
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords if changing password
    if (showPasswordFields) {
      if (!formData.password) {
        toast.error('Please enter a new password');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (formData.password.length < 8) {
        toast.error('Password must be at least 8 characters long');
        return;
      }
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
      // Reset password fields after successful update
      if (showPasswordFields) {
        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: '',
        }));
        setShowPasswordFields(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-['Lora'] text-[var(--primary)] mb-4">Account Settings</h2>
      
      {/* Email Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-['Lora'] text-[var(--secondary)]">Email Settings</h3>
        <div>
          <label className="block text-[var(--secondary)] font-['Open_Sans'] mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="bookish-input w-full p-3 rounded-lg border border-[var(--secondary)]/20 focus:border-[var(--accent)] transition-colors"
            placeholder="your@email.com"
          />
        </div>
      </div>

      {/* Password Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-['Lora'] text-[var(--secondary)]">Password</h3>
          <button
            type="button"
            onClick={() => setShowPasswordFields(!showPasswordFields)}
            className="text-[var(--accent)] hover:text-[var(--accent)]/80 font-['Open_Sans'] text-sm underline"
          >
            {showPasswordFields ? 'Cancel Password Change' : 'Change Password'}
          </button>
        </div>
        
        {showPasswordFields && (
          <div className="space-y-4 p-4 bg-[var(--secondary)]/5 rounded-lg">
            <div>
              <label className="block text-[var(--secondary)] font-['Open_Sans'] mb-1">New Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="bookish-input w-full p-3 rounded-lg border border-[var(--secondary)]/20 focus:border-[var(--accent)] transition-colors"
                placeholder="Enter new password"
                minLength={8}
              />
              <p className="text-xs text-[var(--secondary)]/60 mt-1">
                Must be at least 8 characters long
              </p>
            </div>
            
            <div>
              <label className="block text-[var(--secondary)] font-['Open_Sans'] mb-1">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="bookish-input w-full p-3 rounded-lg border border-[var(--secondary)]/20 focus:border-[var(--accent)] transition-colors"
                placeholder="Confirm new password"
                minLength={8}
              />
            </div>
          </div>
        )}
      </div>

      {/* Privacy Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-['Lora'] text-[var(--secondary)]">Privacy Settings</h3>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-[var(--secondary)]/10">
            <input
              type="checkbox"
              name="profile_public"
              id="profile_public"
              checked={formData.profile_public}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-[var(--accent)] bg-transparent border-2 border-[var(--secondary)]/30 rounded focus:ring-[var(--accent)] focus:ring-2"
            />
            <div>
              <label htmlFor="profile_public" className="text-[var(--secondary)] font-['Open_Sans'] font-medium cursor-pointer">
                Public Profile
              </label>
              <p className="text-sm text-[var(--secondary)]/70 mt-1">
                Allow other users to view your profile and book collections
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg border border-[var(--secondary)]/10">
            <input
              type="checkbox"
              name="email_notifications"
              id="email_notifications"
              checked={formData.email_notifications}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-[var(--accent)] bg-transparent border-2 border-[var(--secondary)]/30 rounded focus:ring-[var(--accent)] focus:ring-2"
            />
            <div>
              <label htmlFor="email_notifications" className="text-[var(--secondary)] font-['Open_Sans'] font-medium cursor-pointer">
                Email Notifications
              </label>
              <p className="text-sm text-[var(--secondary)]/70 mt-1">
                Receive notifications about messages, follows, and book swap updates
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="bookish-button-enhanced w-full px-6 py-3 rounded-xl text-[var(--secondary)] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:transform hover:scale-[1.02]"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            Updating Settings...
          </span>
        ) : (
          'Update Account Settings'
        )}
      </button>
    </form>
  );
};

export default AccountSettingsForm;