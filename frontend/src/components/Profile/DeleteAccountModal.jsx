import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const DeleteAccountModal = () => {
  const { deleteAccount, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm.');
      return;
    }
    const result = await deleteAccount();
    if (result) {
      toast.success('Account deleted successfully!');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-['Lora'] text-[var(--primary)] mb-4">Delete Account</h2>
      <p className="text-[var(--text)] mb-4">
        This action is permanent and cannot be undone. All your data will be removed.
      </p>
      <button
        onClick={() => setIsOpen(true)}
        className="bookish-button-enhanced px-4 py-2 rounded-xl text-[var(--secondary)] bg-[var(--error)]"
      >
        Delete Account
      </button>

      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="bookish-glass p-6 rounded-xl max-w-md w-full">
            <h3 className="text-lg font-['Lora'] text-[var(--primary)] mb-4">Confirm Deletion</h3>
            <p className="text-[var(--text)] mb-4">Type <strong>DELETE</strong> to confirm.</p>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="bookish-input w-full p-2 rounded-lg mb-4"
            />
            <div className="flex gap-4">
              <button
                onClick={() => setIsOpen(false)}
                className="bookish-button-enhanced px-4 py-2 rounded-xl text-[var(--secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="bookish-button-enhanced px-4 py-2 rounded-xl text-[var(--secondary)] bg-[var(--error)] disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DeleteAccountModal;