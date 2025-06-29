import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  MapPinIcon,
  HeartIcon,
  BookOpenIcon,
  CameraIcon,
  EnvelopeIcon,
  CalendarIcon,
  GlobeAltIcon,
  PencilIcon,
  TagIcon,
  ChevronRightIcon,
  TrophyIcon,
  StarIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const ProfileCompletionTracker = ({ 
  showBanner = true, 
  showDetailedView = false,
  onFieldClick,
  className = ""
}) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [completionDetails, setCompletionDetails] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Calculate completion details from profile
  useEffect(() => {
    if (!profile) return;

    const calculateCompletion = () => {
      const fields = {
        // Essential (40 points total)
        username: {
          completed: !!profile.username,
          label: 'Username',
          description: 'Your unique identifier on BookSwaps',
          category: 'essential',
          weight: 20,
          icon: UserIcon,
          action: 'Edit in Profile Settings'
        },
        email: {
          completed: !!profile.email,
          label: 'Email Address',
          description: 'For notifications and account security',
          category: 'essential',
          weight: 20,
          icon: EnvelopeIcon,
          action: 'Update in Account Settings'
        },

        // Personal (30 points total)
        birth_date: {
          completed: !!profile.birth_date,
          label: 'Birth Date',
          description: 'Helps us recommend age-appropriate books',
          category: 'personal',
          weight: 15,
          icon: CalendarIcon,
          action: 'Add in Profile Settings'
        },
        gender: {
          completed: !!profile.gender,
          label: 'Gender',
          description: 'Optional demographic information',
          category: 'personal',
          weight: 15,
          icon: UserIcon,
          action: 'Select in Profile Settings'
        },

        // Location (20 points total)
        city: {
          completed: !!profile.city,
          label: 'City',
          description: 'Connect with local readers',
          category: 'location',
          weight: 10,
          icon: MapPinIcon,
          action: 'Add in Profile Settings'
        },
        country: {
          completed: !!profile.country,
          label: 'Country',
          description: 'Find readers in your region',
          category: 'location',
          weight: 10,
          icon: GlobeAltIcon,
          action: 'Add in Profile Settings'
        },

        // Social (30 points total)
        profile_picture: {
          completed: !!profile.profile_picture,
          label: 'Profile Picture',
          description: 'Help others recognize you',
          category: 'social',
          weight: 15,
          icon: CameraIcon,
          action: 'Upload in Profile Settings'
        },
        about_you: {
          completed: !!profile.about_you && profile.about_you.length > 20,
          label: 'Bio/About You',
          description: 'Tell others about your reading interests',
          category: 'social',
          weight: 15,
          icon: PencilIcon,
          action: 'Write in Profile Settings'
        },

        // Preferences (20 points total)
        favorite_genres: {
          completed: !!profile.favorite_genres && 
                    (Array.isArray(profile.favorite_genres) ? profile.favorite_genres.length > 0 : 
                     profile.favorite_genres.length > 0),
          label: 'Favorite Genres',
          description: 'Get personalized book recommendations',
          category: 'preferences',
          weight: 20,
          icon: TagIcon,
          action: 'Select in Profile Settings'
        }
      };

      // Calculate totals
      const totalWeight = Object.values(fields).reduce((sum, field) => sum + field.weight, 0);
      const completedWeight = Object.values(fields)
        .filter(field => field.completed)
        .reduce((sum, field) => sum + field.weight, 0);
      
      const percentage = Math.round((completedWeight / totalWeight) * 100);

      // Group by categories
      const categories = {};
      Object.entries(fields).forEach(([key, field]) => {
        if (!categories[field.category]) {
          categories[field.category] = [];
        }
        categories[field.category].push({ ...field, field: key });
      });

      // Get missing fields
      const missingFields = Object.entries(fields)
        .filter(([_, field]) => !field.completed)
        .map(([key, field]) => ({ ...field, field: key }))
        .sort((a, b) => b.weight - a.weight); // Sort by weight (importance)

      return {
        percentage,
        completedWeight,
        totalWeight,
        categories,
        missing_fields: missingFields,
        fields_info: fields,
        isCompleted: percentage >= 80
      };
    };

    setCompletionDetails(calculateCompletion());
  }, [profile]);

  const handleFieldClick = (fieldName) => {
    if (onFieldClick) {
      onFieldClick(fieldName);
    } else {
      // Navigate to appropriate settings section
      navigate('/profile/me?tab=settings&section=profile');
    }
  };

  const getCompletionLevel = (percentage) => {
    if (percentage >= 80) return { level: 'Complete', color: 'text-green-600', bgColor: 'bg-green-100', icon: TrophyIcon };
    if (percentage >= 60) return { level: 'Advanced', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: StarIcon };
    if (percentage >= 40) return { level: 'Intermediate', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: FireIcon };
    return { level: 'Beginner', color: 'text-red-600', bgColor: 'bg-red-100', icon: ExclamationTriangleIcon };
  };

  const getNextMilestone = (percentage) => {
    if (percentage < 40) return { target: 40, reward: 'Unlock basic recommendations' };
    if (percentage < 60) return { target: 60, reward: 'Unlock advanced matching' };
    if (percentage < 80) return { target: 80, reward: 'Unlock all features' };
    return { target: 100, reward: 'Profile mastery achieved!' };
  };

  if (!completionDetails || isDismissed) return null;

  const { percentage, missing_fields, isCompleted } = completionDetails;
  const completionLevel = getCompletionLevel(percentage);
  const nextMilestone = getNextMilestone(percentage);
  const LevelIcon = completionLevel.icon;

  // Don't show banner if profile is complete and user doesn't want detailed view
  if (isCompleted && !showDetailedView && showBanner) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <TrophyIcon className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-['Lora'] font-semibold text-green-800">
              🎉 Profile Complete!
            </h3>
            <p className="text-sm text-green-700 font-['Open_Sans']">
              You've unlocked all BookSwaps features. Great job!
            </p>
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-green-600 hover:text-green-800 transition-colors"
          >
            ×
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={className}>
      {/* Completion Banner */}
      {showBanner && !isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bookish-glass bookish-shadow rounded-lg p-6 mb-6 border border-[var(--primary)]/20"
        >
          <div className="flex items-start gap-4">
            {/* Progress Circle */}
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - percentage / 100)}`}
                  className={`transition-all duration-500 ${completionLevel.color}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-[var(--primary)]">
                  {percentage}%
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <LevelIcon className={`w-5 h-5 ${completionLevel.color}`} />
                <h3 className="font-['Lora'] text-lg text-[var(--primary)]">
                  {completionLevel.level} Profile
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${completionLevel.bgColor} ${completionLevel.color}`}>
                  {percentage}% Complete
                </span>
              </div>

              <p className="text-sm text-[var(--text)] mb-4 font-['Open_Sans']">
                {percentage < 40 
                  ? "Let's build your profile to unlock personalized recommendations!"
                  : percentage < 80 
                  ? "You're making great progress! A few more details to unlock all features."
                  : "Almost perfect! Just a few finishing touches needed."
                }
              </p>

              {/* Next Milestone */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-[var(--text)] mb-1">
                  <span>Next milestone: {nextMilestone.target}%</span>
                  <span>{nextMilestone.reward}</span>
                </div>
                <div className="w-full bg-[var(--secondary)]/50 rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(percentage / nextMilestone.target) * 100}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              {/* Quick Actions */}
              {missing_fields.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-[var(--primary)] mb-2 font-['Lora']">
                    Quick Actions ({missing_fields.length} remaining):
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {missing_fields.slice(0, 3).map((field) => {
                      const FieldIcon = field.icon;
                      return (
                        <motion.button
                          key={field.field}
                          onClick={() => handleFieldClick(field.field)}
                          className="flex items-center gap-2 px-3 py-2 bg-white/50 rounded-lg border border-[var(--primary)]/20 hover:border-[var(--accent)] transition-all text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <FieldIcon className="w-4 h-4 text-[var(--primary)]" />
                          <span className="text-[var(--primary)] font-medium">{field.label}</span>
                          <ChevronRightIcon className="w-3 h-3 text-[var(--text)]" />
                        </motion.button>
                      );
                    })}
                    {missing_fields.length > 3 && (
                      <button
                        onClick={() => setShowGuide(true)}
                        className="px-3 py-2 text-sm text-[var(--accent)] hover:text-[var(--primary)] transition-colors"
                      >
                        +{missing_fields.length - 3} more
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <motion.button
                  onClick={() => navigate('/profile/me?tab=settings')}
                  className="bookish-button-enhanced text-white px-4 py-2 rounded-lg font-medium font-['Open_Sans'] flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Complete Profile
                </motion.button>
                <motion.button
                  onClick={() => setShowGuide(!showGuide)}
                  className="bg-white/50 text-[var(--primary)] px-4 py-2 rounded-lg font-medium font-['Open_Sans'] border border-[var(--primary)]/30 hover:bg-white/70 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {showGuide ? 'Hide Guide' : 'View Guide'}
                </motion.button>
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => setIsDismissed(true)}
              className="text-[var(--text)] hover:text-[var(--primary)] transition-colors p-1"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {/* Detailed Guide */}
      <AnimatePresence>
        {(showGuide || showDetailedView) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bookish-glass bookish-shadow rounded-lg p-6 border border-[var(--primary)]/20">
              {/* Guide Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-['Lora'] text-[var(--primary)] mb-1">
                    Profile Completion Guide
                  </h3>
                  <p className="text-sm text-[var(--text)] font-['Open_Sans']">
                    Complete these sections to unlock all BookSwaps features
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

              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {Object.entries(completionDetails.categories).map(([categoryKey, categoryFields]) => {
                  const categoryInfo = {
                    essential: {
                      label: 'Essential Info',
                      icon: UserIcon,
                      color: 'text-red-600',
                      bgColor: 'bg-red-50',
                      description: 'Required for your account'
                    },
                    personal: {
                      label: 'Personal Details',
                      icon: CalendarIcon,
                      color: 'text-blue-600',
                      bgColor: 'bg-blue-50',
                      description: 'Personalize your experience'
                    },
                    location: {
                      label: 'Location',
                      icon: MapPinIcon,
                      color: 'text-green-600',
                      bgColor: 'bg-green-50',
                      description: 'Connect with local readers'
                    },
                    social: {
                      label: 'Social Profile',
                      icon: HeartIcon,
                      color: 'text-purple-600',
                      bgColor: 'bg-purple-50',
                      description: 'Build your reading community'
                    },
                    preferences: {
                      label: 'Preferences',
                      icon: BookOpenIcon,
                      color: 'text-orange-600',
                      bgColor: 'bg-orange-50',
                      description: 'Get better recommendations'
                    }
                  };

                  const info = categoryInfo[categoryKey];
                  const CategoryIcon = info.icon;
                  const completedFields = categoryFields.filter(f => f.completed).length;
                  const totalFields = categoryFields.length;
                  const categoryPercentage = Math.round((completedFields / totalFields) * 100);

                  return (
                    <motion.div
                      key={categoryKey}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        categoryPercentage === 100
                          ? 'border-green-200 bg-green-50'
                          : 'border-[var(--primary)]/20 bg-white/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${info.bgColor}`}>
                          <CategoryIcon className={`w-5 h-5 ${info.color}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-['Lora'] font-semibold text-[var(--primary)]">
                            {info.label}
                          </h4>
                          <p className="text-xs text-[var(--text)] font-['Open_Sans']">
                            {info.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${categoryPercentage === 100 ? 'text-green-600' : 'text-[var(--primary)]'}`}>
                            {categoryPercentage}%
                          </div>
                          <div className="text-xs text-[var(--text)]">
                            {completedFields}/{totalFields}
                          </div>
                        </div>
                      </div>

                      {/* Category Progress Bar */}
                      <div className="w-full bg-[var(--secondary)]/50 rounded-full h-2 mb-3">
                        <motion.div
                          className={`h-2 rounded-full ${
                            categoryPercentage === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${categoryPercentage}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                        />
                      </div>

                      {/* Category Fields */}
                      <div className="space-y-2">
                        {categoryFields.map((field) => {
                          const FieldIcon = field.icon;
                          return (
                            <motion.button
                              key={field.field}
                              onClick={() => !field.completed && handleFieldClick(field.field)}
                              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left ${
                                field.completed
                                  ? 'bg-green-100 cursor-default'
                                  : 'bg-white/70 hover:bg-white cursor-pointer hover:shadow-sm'
                              }`}
                              whileHover={!field.completed ? { scale: 1.01 } : {}}
                              disabled={field.completed}
                            >
                              {field.completed ? (
                                <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                              ) : (
                                <FieldIcon className="w-5 h-5 text-[var(--primary)] flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className={`text-sm font-medium font-['Open_Sans'] ${
                                  field.completed ? 'text-green-800' : 'text-[var(--primary)]'
                                }`}>
                                  {field.label}
                                </div>
                                <div className={`text-xs font-['Open_Sans'] truncate ${
                                  field.completed ? 'text-green-600' : 'text-[var(--text)]'
                                }`}>
                                  {field.completed ? '✓ Completed' : field.action}
                                </div>
                              </div>
                              {!field.completed && (
                                <ChevronRightIcon className="w-4 h-4 text-[var(--text)] flex-shrink-0" />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Completion Rewards */}
              <div className="bg-gradient-to-r from-[var(--accent)]/10 to-[var(--primary)]/10 rounded-lg p-4">
                <h4 className="font-['Lora'] font-semibold text-[var(--primary)] mb-3">
                  🎁 Completion Rewards
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className={`flex items-center gap-2 ${percentage >= 40 ? 'text-green-600' : 'text-[var(--text)]'}`}>
                    <div className={`w-2 h-2 rounded-full ${percentage >= 40 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>40%: Basic book recommendations</span>
                  </div>
                  <div className={`flex items-center gap-2 ${percentage >= 60 ? 'text-green-600' : 'text-[var(--text)]'}`}>
                    <div className={`w-2 h-2 rounded-full ${percentage >= 60 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>60%: Advanced user matching</span>
                  </div>
                  <div className={`flex items-center gap-2 ${percentage >= 80 ? 'text-green-600' : 'text-[var(--text)]'}`}>
                    <div className={`w-2 h-2 rounded-full ${percentage >= 80 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>80%: All features unlocked</span>
                  </div>
                  <div className={`flex items-center gap-2 ${percentage >= 100 ? 'text-green-600' : 'text-[var(--text)]'}`}>
                    <div className={`w-2 h-2 rounded-full ${percentage >= 100 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>100%: Profile mastery badge</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileCompletionTracker;
