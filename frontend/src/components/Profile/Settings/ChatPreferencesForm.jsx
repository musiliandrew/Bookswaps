import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';
import {
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  SpeakerXMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  PlusIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const ChatPreferencesForm = () => {
  const { profile, updateChatPreferences, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    location_enabled: false,
    mute_societies: [],
  });
  const [originalData, setOriginalData] = useState({});
  const [newSociety, setNewSociety] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Popular societies for suggestions
  const popularSocieties = [
    'Fantasy Book Club', 'Local Reading Group', 'Book Swap Society',
    'Mystery Lovers', 'Romance Readers', 'Sci-Fi Enthusiasts',
    'Classic Literature', 'Young Adult Readers'
  ];

  // Populate form with profile data when profile loads
  useEffect(() => {
    if (profile?.chat_preferences) {
      const mutedSocieties = Array.isArray(profile.chat_preferences.mute_societies)
        ? profile.chat_preferences.mute_societies
        : [];

      const data = {
        location_enabled: profile.chat_preferences.location_enabled ?? false,
        mute_societies: mutedSocieties,
      };

      setFormData(data);
      setOriginalData(data);
    }
  }, [profile]);

  // Check for changes
  useEffect(() => {
    const changed = formData.location_enabled !== originalData.location_enabled ||
      JSON.stringify(formData.mute_societies) !== JSON.stringify(originalData.mute_societies);
    setHasChanges(changed);
  }, [formData, originalData]);

  const handleChange = (e) => {
    const { name, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    }
  };

  const addSociety = (society) => {
    if (society && !formData.mute_societies.includes(society)) {
      setFormData(prev => ({
        ...prev,
        mute_societies: [...prev.mute_societies, society]
      }));
    }
    setNewSociety('');
  };

  const removeSociety = (societyToRemove) => {
    setFormData(prev => ({
      ...prev,
      mute_societies: prev.mute_societies.filter(society => society !== societyToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data for API - ensure we send the exact structure expected
    const submitData = {
      chat_preferences: {
        location_enabled: formData.location_enabled,
        mute_societies: formData.mute_societies,
      },
    };

    const result = await updateChatPreferences(submitData);
    if (result) {
      toast.success('Chat preferences updated successfully!');
      // Update original data to reflect changes
      setOriginalData({ ...formData });
    }
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
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-2xl font-['Lora'] font-bold text-[var(--primary)]">Chat Preferences</h2>
            <p className="text-sm text-[var(--text)]/70">Manage your chat and notification settings</p>
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

      {/* Location Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <MapPinIcon className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="text-lg font-['Lora'] font-semibold text-[var(--primary)]">Location Settings</h3>
        </div>

        <motion.div
          className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
            formData.location_enabled !== originalData.location_enabled
              ? 'border-[var(--accent)] bg-[var(--accent)]/5'
              : 'border-[var(--primary)]/10 hover:border-[var(--primary)]/20'
          }`}
          whileHover={{ scale: 1.01 }}
        >
          <div className="relative">
            <input
              type="checkbox"
              name="location_enabled"
              id="location_enabled"
              checked={formData.location_enabled}
              onChange={handleChange}
              className="w-5 h-5 text-[var(--accent)] bg-transparent border-2 border-[var(--primary)]/30 rounded focus:ring-[var(--accent)] focus:ring-2 transition-colors"
            />
            {formData.location_enabled !== originalData.location_enabled && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--accent)] rounded-full flex items-center justify-center">
                <CheckIcon className="w-2 h-2 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <label htmlFor="location_enabled" className="text-[var(--primary)] font-['Open_Sans'] font-medium cursor-pointer">
                Enable Location Sharing
              </label>
              {formData.location_enabled !== originalData.location_enabled && (
                <span className="text-xs text-[var(--accent)] font-medium">• Modified</span>
              )}
            </div>
            <p className="text-sm text-[var(--text)]/70 mt-1">
              Allow other users to see your approximate location for local book swaps and meetups.
              Your exact location is never shared.
            </p>
            <div className="flex items-center gap-1 mt-2">
              <MapPinIcon className="w-4 h-4 text-[var(--text)]/50" />
              <span className="text-xs text-[var(--text)]/60">
                {formData.location_enabled ? 'Location sharing enabled' : 'Location sharing disabled'}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Muted Societies Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <SpeakerXMarkIcon className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="text-lg font-['Lora'] font-semibold text-[var(--primary)]">Muted Societies</h3>
          {JSON.stringify(formData.mute_societies) !== JSON.stringify(originalData.mute_societies) && (
            <span className="text-xs text-[var(--accent)] font-medium">• Modified</span>
          )}
        </div>

        <div className="p-4 border border-[var(--primary)]/10 rounded-lg bg-[var(--secondary)]/5">
          <p className="text-sm text-[var(--text)]/70 mb-4">
            Mute notifications from specific societies. You'll remain a member but won't receive chat notifications from these groups.
          </p>

          {/* Current Muted Societies */}
          <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-3 border border-[var(--primary)]/20 rounded-lg bg-white/50 mb-4">
            <AnimatePresence>
              {formData.mute_societies.map((society, index) => (
                <motion.span
                  key={society}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                >
                  <SpeakerXMarkIcon className="w-3 h-3" />
                  {society}
                  <button
                    type="button"
                    onClick={() => removeSociety(society)}
                    className="ml-1 hover:text-red-900 transition-colors"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>

            {formData.mute_societies.length === 0 && (
              <span className="text-[var(--text)]/50 text-sm">No societies muted</span>
            )}
          </div>

          {/* Add New Society */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSociety}
              onChange={(e) => setNewSociety(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSociety(newSociety);
                }
              }}
              className="flex-1 p-2 border border-[var(--primary)]/20 rounded-lg focus:border-[var(--accent)] transition-colors"
              placeholder="Enter society name to mute..."
            />
            <button
              type="button"
              onClick={() => addSociety(newSociety)}
              disabled={!newSociety.trim()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Popular Societies */}
          <div>
            <p className="text-sm text-[var(--text)]/70 mb-2">Quick add popular societies:</p>
            <div className="flex flex-wrap gap-2">
              {popularSocieties
                .filter(society => !formData.mute_societies.includes(society))
                .slice(0, 6)
                .map(society => (
                  <button
                    key={society}
                    type="button"
                    onClick={() => addSociety(society)}
                    className="px-3 py-1 border border-red-300 text-red-600 rounded-full text-sm hover:bg-red-50 transition-colors"
                  >
                    + {society}
                  </button>
                ))
              }
            </div>
          </div>
        </div>
      </motion.div>

      {/* Settings Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <UserGroupIcon className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="text-lg font-['Lora'] font-semibold text-[var(--primary)]">Current Settings</h3>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-r from-[var(--accent)]/10 to-[var(--primary)]/10 border border-[var(--accent)]/20">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-[var(--primary)] font-medium">Location Sharing:</span>
              </div>
              <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                formData.location_enabled
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {formData.location_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <SpeakerXMarkIcon className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-[var(--primary)] font-medium">Muted Societies:</span>
              </div>
              <div className="text-right max-w-xs">
                {formData.mute_societies.length > 0 ? (
                  <div className="flex flex-wrap gap-1 justify-end">
                    {formData.mute_societies.map(society => (
                      <span key={society} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                        {society}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[var(--text)]/60">None</span>
                )}
              </div>
            </div>
          </div>
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
              Updating Preferences...
            </span>
          ) : hasChanges ? (
            <span className="flex items-center justify-center gap-2">
              <CheckIcon className="w-5 h-5" />
              Save Chat Preferences
            </span>
          ) : (
            'No Changes to Save'
          )}
        </button>

        {hasChanges && (
          <p className="text-center text-sm text-[var(--text)]/60 mt-2">
            You have unsaved changes. Click "Save Chat Preferences" to update.
          </p>
        )}
      </motion.div>
    </motion.form>
  );
};

export default ChatPreferencesForm;