import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const ProfileCompletionBanner = ({
  completionPercentage = 0,
  isCompleted = false,
  completionDetails = null,
  onDismiss,
  onShowGuide
}) => {
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if dismissed or 100% complete
  if (isDismissed || completionPercentage >= 100) {
    return null;
  }

  // Show completion celebration at 100%
  if (completionPercentage >= 100 || isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 3 }}
            >
              🏆
            </motion.div>
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
            onClick={handleDismiss}
            className="text-green-600 hover:text-green-800 transition-colors text-xl"
          >
            ×
          </button>
        </div>
      </motion.div>
    );
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
      className="bookish-glass bookish-shadow rounded-lg p-4 mb-6 relative border border-[var(--primary)]/20"
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-[var(--text)] hover:text-[var(--primary)] transition-colors"
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
          <p className="text-sm text-[var(--text)] mb-3 font-['Open_Sans']">
            Complete your profile to get better book recommendations and connect with fellow readers.
          </p>

          {/* Detailed Missing Fields */}
          {completionDetails && completionDetails.missing_fields && completionDetails.missing_fields.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-[var(--primary)] mb-2 font-['Lora']">
                Missing Fields ({completionDetails.missing_fields.length}):
              </p>
              <div className="space-y-2">
                {completionDetails.missing_fields.slice(0, 4).map((field, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
                    <span className="text-[var(--text)] font-['Open_Sans'] flex-1">
                      {field.label}
                    </span>
                    <span className="text-xs text-[var(--accent)] font-medium">
                      {field.weight}pts
                    </span>
                  </div>
                ))}
                {completionDetails.missing_fields.length > 4 && (
                  <div className="text-xs text-[var(--text)] font-['Open_Sans'] pl-4">
                    +{completionDetails.missing_fields.length - 4} more fields
                  </div>
                )}
              </div>

              {/* Completion Explanation */}
              <div className="mt-3 p-3 bg-[var(--accent)]/10 rounded-lg">
                <p className="text-xs text-[var(--text)] font-['Open_Sans']">
                  <strong>Why {completionPercentage}%?</strong> You've completed{' '}
                  {completionDetails.completedWeight || 0} out of{' '}
                  {completionDetails.totalWeight || 100} total points.{' '}
                  Complete the missing fields above to reach 100%.
                </p>
              </div>
            </div>
          )}
          
          {/* Progress bar */}
          <div className="w-full bg-[var(--secondary)]/50 rounded-full h-2 mb-3">
            <motion.div
              className={`h-2 rounded-full transition-all duration-500 ${getCompletionColor()}`}
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <motion.button
              onClick={handleCompleteProfile}
              className="bookish-button-enhanced text-white px-4 py-2 rounded-lg font-medium font-['Open_Sans'] flex-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Complete Profile
            </motion.button>
            {onShowGuide && (
              <motion.button
                onClick={onShowGuide}
                className="bg-white/50 text-[var(--primary)] px-4 py-2 rounded-lg font-medium font-['Open_Sans'] border border-[var(--primary)]/30 hover:bg-white/70 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Guide
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileCompletionBanner;
