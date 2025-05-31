import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useUsers } from '../../hooks/useUsers';
import UserSearchForm from '../../components/users/UserSearchForm';
import UserCard from '../../components/users/UserCard';
import AuthLink from '../../components/auth/AuthLink';

function SearchUsersPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { searchUsers, searchResults, error, isLoading } = useUsers();
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (data) => {
    try {
      await searchUsers(data);
    } catch {
      setGlobalError('Failed to perform search.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5E8C7] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        <motion.h2
          className="text-center text-3xl font-['Playfair_Display'] text-[#FF6F61] mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Find Book Lovers
        </motion.h2>
        <motion.p
          className="text-center text-sm text-[#333] font-['Poppins'] mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Search for users by username or favorite genres.
        </motion.p>

        {/* Global Error */}
        <AnimatePresence>
          {(error || globalError) && (
            <motion.p
              className="text-[#D32F2F] text-sm text-center mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {globalError || error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Search Form */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <UserSearchForm
            onSubmit={handleSubmit}
            error={error}
            isLoading={isLoading}
          />
        </motion.div>

        {/* Search Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {isLoading ? (
            <div className="text-center">
              <div className="bookish-spinner mx-auto"></div>
              <p className="text-[#333] font-['Poppins'] mt-2">Searching...</p>
            </div>
          ) : searchResults?.length ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <AnimatePresence>
                {searchResults.map((user, index) => (
                  <motion.li
                    key={user.id || user.username}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <UserCard user={user} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <p className="text-center text-[#333] font-['Poppins']">
              No users found. Try different search criteria.
            </p>
          )}
        </motion.div>

        {/* Back Link */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <AuthLink
            to="/profile/me"
            text="Back to Profile"
            className="text-[#333] hover:text-[#FFA726] font-['Poppins'] transition-colors"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SearchUsersPage;