import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const { deleteAccount } = useAuth();
  const [confirmation, setConfirmation] = useState('');
  const [step, setStep] = useState(1); // 1: Warning, 2: Confirmation
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset modal state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setConfirmation('');
      setIsDeleting(false);
    }
  }, [isOpen]);

  const handleFirstStep = () => {
    setStep(2);
  };

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') {
      toast.error('Please type DELETE exactly as shown to confirm.');
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteAccount();
      if (result) {
        toast.success('Account deleted successfully. Goodbye!');
        onClose();
      }
    } catch {
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
      >
        <motion.div
          className="bookish-glass p-6 rounded-xl max-w-md w-full border border-[var(--secondary)]/20"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {step === 1 ? (
            // Warning Step
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-['Lora'] text-[var(--primary)] mb-4">Delete Your Account?</h3>
              
              <div className="text-left space-y-3 mb-6">
                <p className="text-[var(--text)] text-sm">
                  This action will permanently delete your BookSwap account and:
                </p>
                <ul className="text-sm text-[var(--secondary)] space-y-2 pl-4">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    Remove all your book listings and swap history
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    Delete your profile and personal information
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    Remove you from all societies and chat groups
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    Cancel any pending book swap requests
                  </li>
                </ul>
                <p className="text-[var(--text)] text-sm font-medium mt-4">
                  This action cannot be undone and your data cannot be recovered.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-[var(--secondary)]/30 text-[var(--secondary)] rounded-xl hover:bg-[var(--secondary)]/5 transition-colors font-['Open_Sans']"
                >
                  Keep Account
                </button>
                <button
                  onClick={handleFirstStep}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-['Open_Sans'] font-medium"
                >
                  Continue
                </button>
              </div>
            </div>
          ) : (
            // Confirmation Step
            <div>
              <h3 className="text-lg font-['Lora'] text-[var(--primary)] mb-4 text-center">
                Final Confirmation
              </h3>
              
              <div className="mb-6">
                <p className="text-[var(--text)] mb-4 text-center">
                  To confirm deletion, please type{' '}
                  <span className="font-mono bg-[var(--secondary)]/10 px-2 py-1 rounded text-red-600 font-bold">
                    DELETE
                  </span>{' '}
                  in the field below:
                </p>
                
                <input
                  type="text"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  className="bookish-input w-full p-3 rounded-lg text-center font-mono border border-[var(--secondary)]/30 focus:border-red-500 transition-colors"
                  placeholder="Type DELETE here"
                  disabled={isDeleting}
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 border border-[var(--secondary)]/30 text-[var(--secondary)] rounded-xl hover:bg-[var(--secondary)]/5 transition-colors font-['Open_Sans'] disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting || confirmation !== 'DELETE'}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-['Open_Sans'] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Deleting...
                    </div>
                  ) : (
                    'Delete Account'
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteAccountModal;