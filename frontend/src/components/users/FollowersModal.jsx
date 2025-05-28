import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

function FollowersModal({ isOpen, onClose, type, userId, getList, list, isLoading, error }) {
  const [modalError, setModalError] = useState(error);

  useEffect(() => {
    if (isOpen && userId) {
      getList(userId, type).catch(() => setModalError(`Failed to load ${type}.`));
    }
  }, [isOpen, userId, type, getList]);

  useEffect(() => {
    setModalError(error);
  }, [error]);

  const handleRetry = () => {
    setModalError('');
    getList(userId, type).catch(() => setModalError(`Failed to load ${type}.`));
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-[#333] bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-labelledby="followers-modal-title"
      aria-modal="true"
    >
      <motion.div
        className="bookish-glass bookish-shadow p-8 rounded-2xl max-w-md w-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h3
            id="followers-modal-title"
            className="text-xl font-['Playfair_Display'] text-[#FF6F61]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {type === 'followers' ? 'Followers' : 'Following'}
          </motion.h3>
          <motion.button
            onClick={onClose}
            className="text-[#333] hover:text-[#FF6F61] focus:outline-none"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </motion.button>
        </div>
        {isLoading ? (
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div className="bookish-spinner mx-auto"></div>
            <p className="text-[#333] font-['Poppins'] mt-2">Loading...</p>
          </motion.div>
        ) : modalError ? (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.2 }}
          >
            <p
              id="followers-error"
              className="text-[#D32F2F] font-['Poppins'] mb-4"
            >
              {modalError}
            </p>
            <button
              onClick={handleRetry}
              className="text-[#333] hover:text-[#FFA726] font-['Poppins'] underline"
              aria-label="Retry loading list"
            >
              Retry
            </button>
          </motion.div>
        ) : list?.length ? (
          <motion.ul
            className="space-y-4 max-h-96 overflow-y-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {list.map((user, index) => (
              <motion.li
                key={user.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#FF6F61]">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={`${user.username}'s avatar`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#F5E8C7] flex items-center justify-center">
                        <XMarkIcon className="h-6 w-6 text-[#333]" />
                      </div>
                    )}
                  </div>
                  <Link
                    to={`/profile/${user.id}`}
                    className="text-[#333] hover:text-[#FFA726] font-['Poppins'] transition-colors"
                    onClick={onClose}
                  >
                    {user.username}
                    {user.city && (
                      <span className="text-[#333] text-sm"> ({user.city})</span>
                    )}
                  </Link>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <motion.p
            className="text-[#333] font-['Poppins'] text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            No {type} found.
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}

export default FollowersModal;