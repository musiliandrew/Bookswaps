import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ProfileCompletionGuide from './ProfileCompletionGuide';

const ProfileCompletionModal = ({ 
  isOpen, 
  onClose, 
  completionDetails,
  onFieldClick 
}) => {
  if (!isOpen) return null;

  const handleFieldClick = (field) => {
    // Close modal and handle field click
    onClose();
    if (onFieldClick) {
      onFieldClick(field);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bookish-glass bookish-shadow rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--primary)]/20">
          <div>
            <h2 className="text-2xl font-['Lora'] text-[var(--primary)]">
              Complete Your Profile
            </h2>
            <p className="text-sm text-[var(--text)] font-['Open_Sans'] mt-1">
              Follow this guide to unlock all BookSwaps features
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text)] hover:text-[var(--primary)] transition-colors p-1"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <ProfileCompletionGuide
            completionDetails={completionDetails}
            onFieldClick={handleFieldClick}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileCompletionModal;
