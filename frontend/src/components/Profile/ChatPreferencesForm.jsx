import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const ChatPreferencesForm = ({ profile }) => {
  const { updateChatPreferences, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    location_enabled: profile?.chat_preferences?.location_enabled ?? false,
    mute_societies: profile?.chat_preferences?.mute_societies?.join(', ') || '',
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
      chat_preferences: {
        location_enabled: formData.location_enabled,
        mute_societies: formData.mute_societies.split(',').map((s) => s.trim()).filter(Boolean),
      },
    };
    const result = await updateChatPreferences(data);
    if (result) {
      toast.success('Chat preferences updated successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-['Lora'] text-[var(--primary)] mb-4">Chat Preferences</h2>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="location_enabled"
          checked={formData.location_enabled}
          onChange={handleChange}
          className="checkbox-enhanced"
        />
        <label className="text-[var(--secondary)] font-['Open_Sans']">Enable Location Sharing</label>
      </div>
      <div>
        <label className="block text-[var(--secondary)] font-['Open_Sans']">Mute Societies (comma-separated)</label>
        <input
          type="text"
          name="mute_societies"
          value={formData.mute_societies}
          onChange={handleChange}
          className="bookish-input w-full p-2 rounded-lg"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="bookish-button-enhanced px-4 py-2 rounded-xl text-[var(--secondary)] disabled:opacity-50"
      >
        {isLoading ? 'Updating...' : 'Update Preferences'}
      </button>
    </form>
  );
};

export default ChatPreferencesForm;