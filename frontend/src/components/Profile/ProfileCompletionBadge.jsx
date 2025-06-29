import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrophyIcon,
  StarIcon,
  FireIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const ProfileCompletionBadge = ({ 
  variant = 'default', // 'default', 'minimal', 'detailed'
  showPercentage = true,
  showLabel = true,
  onClick,
  className = ""
}) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [completionDetails, setCompletionDetails] = useState(null);

  // Calculate completion details from profile
  useEffect(() => {
    if (!profile) return;

    const calculateCompletion = () => {
      const fields = {
        username: { completed: !!profile.username, weight: 20 },
        email: { completed: !!profile.email, weight: 20 },
        birth_date: { completed: !!profile.birth_date, weight: 15 },
        gender: { completed: !!profile.gender, weight: 15 },
        city: { completed: !!profile.city, weight: 10 },
        country: { completed: !!profile.country, weight: 10 },
        profile_picture: { completed: !!profile.profile_picture, weight: 15 },
        about_you: { 
          completed: !!profile.about_you && profile.about_you.length > 20, 
          weight: 15 
        },
        favorite_genres: { 
          completed: !!profile.favorite_genres && 
                    (Array.isArray(profile.favorite_genres) ? profile.favorite_genres.length > 0 : 
                     profile.favorite_genres.length > 0), 
          weight: 20 
        }
      };

      const totalWeight = Object.values(fields).reduce((sum, field) => sum + field.weight, 0);
      const completedWeight = Object.values(fields)
        .filter(field => field.completed)
        .reduce((sum, field) => sum + field.weight, 0);
      
      const percentage = Math.round((completedWeight / totalWeight) * 100);

      return {
        percentage,
        isCompleted: percentage >= 80
      };
    };

    setCompletionDetails(calculateCompletion());
  }, [profile]);

  const getCompletionLevel = (percentage) => {
    if (percentage >= 80) return { 
      level: 'Complete', 
      color: 'text-green-600', 
      bgColor: 'bg-green-100', 
      borderColor: 'border-green-200',
      icon: TrophyIcon,
      emoji: '🏆'
    };
    if (percentage >= 60) return { 
      level: 'Advanced', 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100', 
      borderColor: 'border-blue-200',
      icon: StarIcon,
      emoji: '⭐'
    };
    if (percentage >= 40) return { 
      level: 'Good', 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100', 
      borderColor: 'border-yellow-200',
      icon: FireIcon,
      emoji: '🔥'
    };
    return { 
      level: 'Basic', 
      color: 'text-red-600', 
      bgColor: 'bg-red-100', 
      borderColor: 'border-red-200',
      icon: ExclamationTriangleIcon,
      emoji: '⚠️'
    };
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/profile/me?tab=settings');
    }
  };

  if (!completionDetails) return null;

  const { percentage, isCompleted } = completionDetails;
  const completionLevel = getCompletionLevel(percentage);
  const LevelIcon = completionLevel.icon;

  // Minimal variant - just a small indicator
  if (variant === 'minimal') {
    return (
      <motion.button
        onClick={handleClick}
        className={`relative inline-flex items-center justify-center w-8 h-8 rounded-full ${completionLevel.bgColor} ${completionLevel.borderColor} border-2 transition-all hover:scale-110 ${className}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title={`Profile ${percentage}% complete`}
      >
        <span className="text-sm">{completionLevel.emoji}</span>
        {!isCompleted && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>
    );
  }

  // Default variant - compact badge
  if (variant === 'default') {
    return (
      <motion.button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${completionLevel.bgColor} ${completionLevel.borderColor} border transition-all hover:shadow-sm ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <LevelIcon className={`w-4 h-4 ${completionLevel.color}`} />
        {showLabel && (
          <span className={`text-sm font-medium ${completionLevel.color}`}>
            {completionLevel.level}
          </span>
        )}
        {showPercentage && (
          <span className={`text-xs font-bold ${completionLevel.color}`}>
            {percentage}%
          </span>
        )}
        {!isCompleted && (
          <ChevronRightIcon className={`w-3 h-3 ${completionLevel.color}`} />
        )}
      </motion.button>
    );
  }

  // Detailed variant - full information
  return (
    <motion.button
      onClick={handleClick}
      className={`flex items-center gap-3 p-4 rounded-lg ${completionLevel.bgColor} ${completionLevel.borderColor} border-2 transition-all hover:shadow-md w-full text-left ${className}`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${completionLevel.bgColor} border-2 ${completionLevel.borderColor}`}>
        <LevelIcon className={`w-5 h-5 ${completionLevel.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-['Lora'] font-semibold ${completionLevel.color}`}>
            {completionLevel.level} Profile
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${completionLevel.bgColor} ${completionLevel.color}`}>
            {percentage}%
          </span>
        </div>
        <p className="text-xs text-gray-600 font-['Open_Sans']">
          {isCompleted 
            ? "All features unlocked! 🎉" 
            : `${100 - percentage}% remaining to unlock all features`
          }
        </p>
      </div>

      {/* Progress Circle */}
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
          <span className={`text-xs font-bold ${completionLevel.color}`}>
            {percentage}%
          </span>
        </div>
      </div>

      {/* Arrow */}
      {!isCompleted && (
        <ChevronRightIcon className={`w-5 h-5 ${completionLevel.color} flex-shrink-0`} />
      )}
    </motion.button>
  );
};

export default ProfileCompletionBadge;
