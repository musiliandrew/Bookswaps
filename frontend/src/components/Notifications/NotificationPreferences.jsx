import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  BellIcon, 
  EnvelopeIcon, 
  DevicePhoneMobileIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  UserGroupIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState({
    email_enabled: true,
    push_enabled: true,
    categories: {
      swaps: {
        enabled: true,
        email: true,
        push: true,
        types: {
          swap_proposed: true,
          swap_accepted: true,
          swap_confirmed: true,
          swap_cancelled: false
        }
      },
      social: {
        enabled: true,
        email: false,
        push: true,
        types: {
          follow_request: true,
          follow_accepted: true,
          message_received: true,
          society_joined: true,
          society_message: false
        }
      },
      discussions: {
        enabled: true,
        email: false,
        push: true,
        types: {
          note_added: true,
          note_liked: false,
          discussion_upvoted: true,
          discussion_mentioned: true
        }
      },
      system: {
        enabled: true,
        email: true,
        push: true,
        types: {
          system_announcement: true,
          maintenance_notice: true,
          security_alert: true
        }
      }
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const categoryIcons = {
    swaps: ArrowPathIcon,
    social: UserGroupIcon,
    discussions: ChatBubbleLeftRightIcon,
    system: BellIcon
  };

  const categoryLabels = {
    swaps: 'Book Swaps',
    social: 'Social Activity',
    discussions: 'Discussions',
    system: 'System Notifications'
  };

  const typeLabels = {
    swap_proposed: 'Swap Proposed',
    swap_accepted: 'Swap Accepted',
    swap_confirmed: 'Swap Confirmed',
    swap_cancelled: 'Swap Cancelled',
    follow_request: 'Follow Requests',
    follow_accepted: 'Follow Accepted',
    message_received: 'Direct Messages',
    society_joined: 'Society Joined',
    society_message: 'Society Messages',
    note_added: 'Comments Added',
    note_liked: 'Comments Liked',
    discussion_upvoted: 'Discussion Upvoted',
    discussion_mentioned: 'Mentioned in Discussion',
    system_announcement: 'Announcements',
    maintenance_notice: 'Maintenance Notices',
    security_alert: 'Security Alerts'
  };

  const handleCategoryToggle = (category, field) => {
    setPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: {
          ...prev.categories[category],
          [field]: !prev.categories[category][field]
        }
      }
    }));
  };

  const handleTypeToggle = (category, type) => {
    setPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: {
          ...prev.categories[category],
          types: {
            ...prev.categories[category].types,
            [type]: !prev.categories[category].types[type]
          }
        }
      }
    }));
  };

  const handleGlobalToggle = (field) => {
    setPreferences(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const savePreferences = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to save preferences
      // await api.post('/api/swaps/notifications/preferences/', preferences);
      toast.success('Notification preferences saved!');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--secondary)]">
        {/* Header */}
        <div className="p-6 border-b border-[var(--secondary)]">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
            Notification Preferences
          </h2>
          <p className="text-[var(--text-secondary)]">
            Customize how and when you receive notifications from Bookswaps.
          </p>
        </div>

        {/* Global Settings */}
        <div className="p-6 border-b border-[var(--secondary)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Global Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-[var(--secondary)]/20 rounded-lg">
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="w-5 h-5 text-[var(--accent)]" />
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Email Notifications</p>
                  <p className="text-sm text-[var(--text-secondary)]">Receive notifications via email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.email_enabled}
                  onChange={() => handleGlobalToggle('email_enabled')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--accent)]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-[var(--secondary)]/20 rounded-lg">
              <div className="flex items-center gap-3">
                <DevicePhoneMobileIcon className="w-5 h-5 text-[var(--accent)]" />
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Push Notifications</p>
                  <p className="text-sm text-[var(--text-secondary)]">Receive browser push notifications</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.push_enabled}
                  onChange={() => handleGlobalToggle('push_enabled')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--accent)]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Category Settings */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Notification Categories
          </h3>
          <div className="space-y-6">
            {Object.entries(preferences.categories).map(([category, settings]) => {
              const IconComponent = categoryIcons[category];
              return (
                <div key={category} className="border border-[var(--secondary)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5 text-[var(--accent)]" />
                      <h4 className="font-medium text-[var(--text-primary)]">
                        {categoryLabels[category]}
                      </h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enabled}
                        onChange={() => handleCategoryToggle(category, 'enabled')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--accent)]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                    </label>
                  </div>

                  {settings.enabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3"
                    >
                      {/* Delivery methods */}
                      <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={settings.email}
                            onChange={() => handleCategoryToggle(category, 'email')}
                            className="rounded border-[var(--secondary)] text-[var(--accent)] focus:ring-[var(--accent)]"
                          />
                          <span className="text-sm text-[var(--text-secondary)]">Email</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={settings.push}
                            onChange={() => handleCategoryToggle(category, 'push')}
                            className="rounded border-[var(--secondary)] text-[var(--accent)] focus:ring-[var(--accent)]"
                          />
                          <span className="text-sm text-[var(--text-secondary)]">Push</span>
                        </label>
                      </div>

                      {/* Specific notification types */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(settings.types).map(([type, enabled]) => (
                          <label key={type} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={() => handleTypeToggle(category, type)}
                              className="rounded border-[var(--secondary)] text-[var(--accent)] focus:ring-[var(--accent)]"
                            />
                            <span className="text-sm text-[var(--text-primary)]">
                              {typeLabels[type]}
                            </span>
                          </label>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className="p-6 border-t border-[var(--secondary)]">
          <motion.button
            onClick={savePreferences}
            disabled={isLoading}
            className="w-full md:w-auto px-6 py-3 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationPreferences;
