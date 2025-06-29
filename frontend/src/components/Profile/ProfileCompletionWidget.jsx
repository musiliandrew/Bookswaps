import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  StarIcon,
  FireIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const ProfileCompletionWidget = ({ 
  compact = false,
  showProgress = true,
  showMissingFields = true,
  className = ""
}) => {
  const { profile } = useAuth();
  const [completionDetails, setCompletionDetails] = useState(null);

  // Calculate completion details from profile
  useEffect(() => {
    if (!profile) return;

    const calculateCompletion = () => {
      const fields = {
        username: { completed: !!profile.username, weight: 20, label: 'Username' },
        email: { completed: !!profile.email, weight: 20, label: 'Email' },
        birth_date: { completed: !!profile.birth_date, weight: 15, label: 'Birth Date' },
        gender: { completed: !!profile.gender, weight: 15, label: 'Gender' },
        city: { completed: !!profile.city, weight: 10, label: 'City' },
        country: { completed: !!profile.country, weight: 10, label: 'Country' },
        profile_picture: { completed: !!profile.profile_picture, weight: 15, label: 'Profile Picture' },
        about_you: { 
          completed: !!profile.about_you && profile.about_you.length > 20, 
          weight: 15, 
          label: 'Bio/About You' 
        },
        favorite_genres: { 
          completed: !!profile.favorite_genres && 
                    (Array.isArray(profile.favorite_genres) ? profile.favorite_genres.length > 0 : 
                     profile.favorite_genres.length > 0), 
          weight: 20, 
          label: 'Favorite Genres' 
        }
      };

      const totalWeight = Object.values(fields).reduce((sum, field) => sum + field.weight, 0);
      const completedWeight = Object.values(fields)
        .filter(field => field.completed)
        .reduce((sum, field) => sum + field.weight, 0);
      
      const percentage = Math.round((completedWeight / totalWeight) * 100);

      const missingFields = Object.entries(fields)
        .filter(([_, field]) => !field.completed)
        .map(([key, field]) => ({ ...field, field: key }))
        .sort((a, b) => b.weight - a.weight);

      return {
        percentage,
        completedWeight,
        totalWeight,
        missing_fields: missingFields,
        isCompleted: percentage >= 80,
        completedFields: Object.values(fields).filter(f => f.completed).length,
        totalFields: Object.keys(fields).length
      };
    };

    setCompletionDetails(calculateCompletion());
  }, [profile]);

  const getCompletionLevel = (percentage) => {
    if (percentage >= 80) return { level: 'Complete', color: 'text-green-600', bgColor: 'bg-green-100', icon: TrophyIcon };
    if (percentage >= 60) return { level: 'Advanced', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: StarIcon };
    if (percentage >= 40) return { level: 'Good', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: FireIcon };
    return { level: 'Basic', color: 'text-red-600', bgColor: 'bg-red-100', icon: ExclamationTriangleIcon };
  };

  if (!completionDetails) return null;

  const { percentage, missing_fields, isCompleted, completedFields, totalFields } = completionDetails;
  const completionLevel = getCompletionLevel(percentage);
  const LevelIcon = completionLevel.icon;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-white/50 backdrop-blur-sm border border-[var(--primary)]/20 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center gap-3">
          {/* Mini Progress Circle */}
          <div className="relative w-12 h-12 flex-shrink-0">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - percentage / 100)}`}
                className={`transition-all duration-500 ${completionLevel.color}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-[var(--primary)]">
                {percentage}%
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <LevelIcon className={`w-4 h-4 ${completionLevel.color}`} />
              <span className="font-['Lora'] font-semibold text-[var(--primary)] text-sm">
                {completionLevel.level} Profile
              </span>
            </div>
            <p className="text-xs text-[var(--text)] font-['Open_Sans']">
              {completedFields}/{totalFields} fields completed
            </p>
            {missing_fields.length > 0 && (
              <p className="text-xs text-[var(--accent)] font-['Open_Sans'] mt-1">
                {missing_fields.length} fields remaining
              </p>
            )}
          </div>

          {/* Status Icon */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${completionLevel.bgColor}`}>
            <LevelIcon className={`w-4 h-4 ${completionLevel.color}`} />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/50 backdrop-blur-sm border border-[var(--primary)]/20 rounded-lg p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${completionLevel.bgColor}`}>
            <LevelIcon className={`w-5 h-5 ${completionLevel.color}`} />
          </div>
          <div>
            <h3 className="font-['Lora'] font-semibold text-[var(--primary)]">
              Profile Completion
            </h3>
            <p className="text-sm text-[var(--text)] font-['Open_Sans']">
              {completionLevel.level} • {completedFields}/{totalFields} fields
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[var(--primary)] font-['Lora']">
            {percentage}%
          </div>
          {isCompleted && (
            <div className="text-xs text-green-600 font-['Open_Sans']">
              ✓ Complete
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-4">
          <div className="w-full bg-[var(--secondary)]/50 rounded-full h-3">
            <motion.div
              className={`h-3 rounded-full ${
                isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="flex justify-between text-xs text-[var(--text)] mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Missing Fields */}
      {showMissingFields && missing_fields.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-[var(--primary)] mb-2 font-['Lora']">
            Missing Fields ({missing_fields.length}):
          </h4>
          <div className="space-y-2">
            {missing_fields.slice(0, 3).map((field) => (
              <div
                key={field.field}
                className="flex items-center gap-2 text-sm text-[var(--text)] font-['Open_Sans']"
              >
                <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
                <span className="flex-1">{field.label}</span>
                <span className="text-xs text-[var(--accent)]">{field.weight}pts</span>
              </div>
            ))}
            {missing_fields.length > 3 && (
              <div className="text-xs text-[var(--text)] font-['Open_Sans'] pl-4">
                +{missing_fields.length - 3} more fields
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completion Message */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center gap-2 text-green-800">
            <TrophyIcon className="w-4 h-4" />
            <span className="font-medium font-['Lora'] text-sm">Profile Complete!</span>
          </div>
          <p className="text-xs text-green-700 mt-1 font-['Open_Sans']">
            All features unlocked. Great job!
          </p>
        </motion.div>
      )}

      {/* Next Steps */}
      {!isCompleted && missing_fields.length > 0 && (
        <div className="mt-4 p-3 bg-[var(--accent)]/10 rounded-lg">
          <h5 className="text-sm font-medium text-[var(--primary)] mb-2 font-['Lora']">
            Next Steps:
          </h5>
          <div className="text-xs text-[var(--text)] font-['Open_Sans']">
            Complete <strong>{missing_fields[0].label}</strong> to earn {missing_fields[0].weight} points
            {percentage < 80 && (
              <span className="block mt-1 text-[var(--accent)]">
                {80 - percentage}% more to unlock all features
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProfileCompletionWidget;
