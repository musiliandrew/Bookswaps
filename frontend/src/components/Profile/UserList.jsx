import { motion } from 'framer-motion';
import UserCard from './UserCard';
import ErrorMessage from '../Common/ErrorMessage';

const UserList = ({ users, isLoading, error, className = '' }) => {
  if (isLoading) {
    return (
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bookish-spinner mx-auto w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[var(--text)] font-['Open_Sans'] mt-2">Loading...</p>
      </motion.div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!users || users.length === 0) {
    return (
      <motion.p
        className="text-[var(--text)] font-['Open_Sans'] text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        No users found.
      </motion.p>
    );
  }

  return (
    <motion.div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {users.map((user, index) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
        >
          <UserCard user={user} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default UserList;