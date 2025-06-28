import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';

const ChatPreferencesForm = () => {
  const { profile, updateChatPreferences, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    location_enabled: false,
    mute_societies: '',
  });

  // Populate form with profile data when profile loads
  useEffect(() => {
    if (profile?.chat_preferences) {
      setFormData({
        location_enabled: profile.chat_preferences.location_enabled ?? false,
        mute_societies: Array.isArray(profile.chat_preferences.mute_societies) 
          ? profile.chat_preferences.mute_societies.join(', ') 
          : (profile.chat_preferences.mute_societies || ''),
      });
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

    // Prepare data for API - ensure we send the exact structure expected
    const submitData = {
      chat_preferences: {
        location_enabled: formData.location_enabled,
        mute_societies: formData.mute_societies
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean), // Remove empty strings
      },
    };

    const result = await updateChatPreferences(submitData);
    if (result) {
      toast.success('Chat preferences updated successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-['Lora'] text-[var(--primary)] mb-4">Chat Preferences</h2>
      
      {/* Location Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-['Lora'] text-[var(--primary)]">Location Settings</h3>

        <div className="flex items-start gap-3 p-4 rounded-lg border border-[var(--primary)]/10 bg-[var(--primary)]/5">
          <input
            type="checkbox"
            name="location_enabled"
            id="location_enabled"
            checked={formData.location_enabled}
            onChange={handleChange}
            className="mt-1 w-4 h-4 text-[var(--accent)] bg-transparent border-2 border-[var(--primary)]/30 rounded focus:ring-[var(--accent)] focus:ring-2"
          />
          <div>
            <label htmlFor="location_enabled" className="text-[var(--primary)] font-['Open_Sans'] font-medium cursor-pointer">
              Enable Location Sharing
            </label>
            <p className="text-sm text-[var(--text)] mt-1">
              Allow other users to see your approximate location for local book swaps and meetups.
              Your exact location is never shared.
            </p>
          </div>
        </div>
      </div>

      {/* Society Management */}
      <div className="space-y-4">
        <h3 className="text-lg font-['Lora'] text-[var(--primary)]">Society Management</h3>

        <div>
          <label className="block text-[var(--primary)] font-['Open_Sans'] mb-2 font-medium">
            Muted Societies
            <span className="text-sm text-[var(--text)] ml-1">(comma-separated)</span>
          </label>
          <input
            type="text"
            name="mute_societies"
            value={formData.mute_societies}
            onChange={handleChange}
            className="bookish-input w-full p-3 rounded-lg border border-[var(--primary)]/20 focus:border-[var(--accent)] transition-colors"
            placeholder="Fantasy Book Club, Local Reading Group, Book Swap Society..."
          />
          <p className="text-sm text-[var(--text)] mt-2">
            Enter the names of societies whose notifications you want to mute. You'll still be a member
            but won't receive chat notifications from these groups.
          </p>
        </div>
      </div>

      {/* Notification Preview */}
      <div className="space-y-4">
        <h3 className="text-lg font-['Lora'] text-[var(--primary)]">Current Settings</h3>

        <div className="p-4 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--primary)]">Location Sharing:</span>
              <span className={`font-medium ${formData.location_enabled ? 'text-green-600' : 'text-red-600'}`}>
                {formData.location_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--primary)]">Muted Societies:</span>
              <span className="text-[var(--text)] text-right max-w-xs">
                {formData.mute_societies || 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="bookish-button-enhanced w-full px-6 py-3 rounded-lg text-white font-medium font-['Open_Sans'] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:transform hover:scale-[1.02]"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            Updating Preferences...
          </span>
        ) : (
          'Update Chat Preferences'
        )}
      </button>
    </form>
  );
};

export default ChatPreferencesForm;