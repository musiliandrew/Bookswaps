import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const ProfileCompletionBanner = ({ 
  completionPercentage = 0, 
  isCompleted = false,
  onDismiss 
}) => {
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || isCompleted || completionPercentage >= 80) {
    return null;
  }

  const handleCompleteProfile = () => {
    navigate('/profile/me?tab=settings');
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  const getCompletionMessage = () => {
    if (completionPercentage < 30) {
      return "Let's get your profile started!";
    } else if (completionPercentage < 60) {
      return "You're making great progress!";
    } else {
      return "Almost there! Complete your profile.";
    }
  };

  const getCompletionColor = () => {
    if (completionPercentage < 30) return 'bg-red-500';
    if (completionPercentage < 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6 relative"
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-4">
        {/* Circular progress indicator */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
            {/* Background circle */}
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="4"
            />
            {/* Progress circle */}
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - completionPercentage / 100)}`}
              className={`transition-all duration-500 ${
                completionPercentage < 30 ? 'text-red-500' :
                completionPercentage < 60 ? 'text-yellow-500' :
                'text-green-500'
              }`}
            />
          </svg>
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-700">
              {completionPercentage}%
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-['Lora'] text-lg text-[var(--primary)] mb-1">
            {getCompletionMessage()}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Complete your profile to get better book recommendations and connect with fellow readers.
          </p>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <motion.div
              className={`h-2 rounded-full transition-all duration-500 ${getCompletionColor()}`}
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
            />
          </div>

          {/* Action button */}
          <motion.button
            onClick={handleCompleteProfile}
            className="bg-[var(--accent)] text-[var(--primary)] px-4 py-2 rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Complete Profile
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileCompletionBanner;
