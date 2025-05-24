import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

function FollowersModal({ isOpen, onClose, type, userId, getList, list, isLoading, error }) {
  useEffect(() => {
    if (isOpen && userId) {
      getList(userId, type);
    }
  }, [isOpen, userId, type, getList]);

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="frosted-glass bookish-border p-6 rounded-lg shadow-lg max-w-md w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-4">
          <motion.h3
            className="text-xl font-['Lora'] text-[var(--primary)] text-shadow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {type === 'followers' ? 'Followers' : 'Following'}
          </motion.h3>
          <motion.button
            onClick={onClose}
            className="text-[var(--primary)] hover:text-[var(--accent)] focus:outline-none"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </motion.button>
        </div>
        {isLoading ? (
          <motion.p
            className="text-[var(--primary)] font-['Open_Sans']"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            Loading...
          </motion.p>
        ) : error ? (
          <motion.p
            className="text-[var(--error)] font-['Open_Sans']"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        ) : list?.length ? (
          <motion.ul
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {list.map((user) => (
              <motion.li
                key={user.user_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <Link
                  to={`/users/${user.username}`}
                  className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors font-['Open_Sans']"
                  onClick={onClose}
                >
                  {user.username}{' '}
                  {user.city && (
                    <span className="text-[var(--text)]">({user.city})</span>
                  )}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <motion.p
            className="text-[var(--text)] font-['Open_Sans']"
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