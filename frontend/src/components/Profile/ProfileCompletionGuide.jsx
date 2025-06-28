import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  UserIcon,
  MapPinIcon,
  HeartIcon,
  BookOpenIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

const ProfileCompletionGuide = ({ 
  completionDetails, 
  onFieldClick,
  className = "" 
}) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const navigate = useNavigate();

  if (!completionDetails) return null;

  const { percentage, categories, missing_fields } = completionDetails;

  const categoryIcons = {
    essential: UserIcon,
    personal: UserIcon,
    location: MapPinIcon,
    social: HeartIcon,
    preferences: BookOpenIcon
  };

  const categoryLabels = {
    essential: 'Essential Information',
    personal: 'Personal Details',
    location: 'Location',
    social: 'Social Profile',
    preferences: 'Reading Preferences'
  };

  const categoryDescriptions = {
    essential: 'Required for your account',
    personal: 'Help us personalize your experience',
    location: 'Connect with local readers',
    social: 'Build your reading community',
    preferences: 'Get better book recommendations'
  };

  const handleFieldClick = (field) => {
    if (onFieldClick) {
      onFieldClick(field);
    } else {
      // Default behavior - navigate to settings
      navigate('/profile/me?tab=settings');
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const getCategoryCompletion = (categoryFields) => {
    const totalFields = categoryFields.filter(f => f.weight > 0).length;
    const completedFields = categoryFields.filter(f => f.completed && f.weight > 0).length;
    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 100;
  };

  return (
    <motion.div
      className={`bookish-glass bookish-shadow rounded-lg p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-['Lora'] text-[var(--primary)] mb-1">
            Profile Completion Guide
          </h3>
          <p className="text-sm text-[var(--text)] font-['Open_Sans']">
            Complete your profile to unlock all features
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[var(--primary)] font-['Lora']">
            {percentage}%
          </div>
          <div className="text-xs text-[var(--text)] font-['Open_Sans']">
            Complete
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-[var(--secondary)]/50 rounded-full h-3">
          <motion.div
            className="h-3 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Quick Actions for Missing Fields */}
      {missing_fields.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-[var(--primary)] mb-3 font-['Lora']">
            Quick Actions ({missing_fields.length} remaining)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {missing_fields.slice(0, 4).map((field) => (
              <motion.button
                key={field.field}
                onClick={() => handleFieldClick(field.field)}
                className="flex items-center gap-2 p-3 bg-white/50 rounded-lg border border-[var(--primary)]/20 hover:border-[var(--accent)] transition-all text-left"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <XCircleIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--primary)] font-['Open_Sans'] truncate">
                    {field.label}
                  </div>
                  <div className="text-xs text-[var(--text)] font-['Open_Sans'] truncate">
                    {field.description}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
          {missing_fields.length > 4 && (
            <p className="text-xs text-[var(--text)] mt-2 font-['Open_Sans']">
              +{missing_fields.length - 4} more fields to complete
            </p>
          )}
        </div>
      )}

      {/* Categories */}
      <div className="space-y-3">
        {Object.entries(categories).map(([categoryKey, categoryFields]) => {
          if (categoryFields.length === 0) return null;
          
          const Icon = categoryIcons[categoryKey];
          const completion = getCategoryCompletion(categoryFields);
          const isExpanded = expandedCategory === categoryKey;
          
          return (
            <div key={categoryKey} className="border border-[var(--primary)]/10 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(categoryKey)}
                className="w-full flex items-center justify-between p-4 bg-white/30 hover:bg-white/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-[var(--primary)]" />
                  <div className="text-left">
                    <div className="font-medium text-[var(--primary)] font-['Lora']">
                      {categoryLabels[categoryKey]}
                    </div>
                    <div className="text-xs text-[var(--text)] font-['Open_Sans']">
                      {categoryDescriptions[categoryKey]}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-[var(--primary)]">
                    {completion}%
                  </div>
                  {isExpanded ? (
                    <ChevronUpIcon className="w-4 h-4 text-[var(--text)]" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-[var(--text)]" />
                  )}
                </div>
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-white/20 space-y-2">
                      {categoryFields.map((field) => (
                        <motion.div
                          key={field.field}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            field.completed 
                              ? 'bg-green-50 hover:bg-green-100' 
                              : 'bg-red-50 hover:bg-red-100'
                          }`}
                          onClick={() => !field.completed && handleFieldClick(field.field)}
                          whileHover={!field.completed ? { scale: 1.01 } : {}}
                        >
                          {field.completed ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className={`text-sm font-medium font-['Open_Sans'] ${
                              field.completed ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {field.label}
                            </div>
                            <div className={`text-xs font-['Open_Sans'] ${
                              field.completed ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {field.description}
                            </div>
                          </div>
                          {field.weight > 0 && (
                            <div className="text-xs text-[var(--text)] font-['Open_Sans']">
                              {field.weight}pts
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Completion Reward Message */}
      {percentage >= 80 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircleIcon className="w-5 h-5" />
            <span className="font-medium font-['Lora']">Profile Complete!</span>
          </div>
          <p className="text-sm text-green-700 mt-1 font-['Open_Sans']">
            Great job! Your profile is now complete and you have access to all BookSwaps features.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProfileCompletionGuide;
