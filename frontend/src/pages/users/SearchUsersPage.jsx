import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import UserSearchForm from '../../components/users/UserSearchForm';
import UserCard from '../../components/users/UserCard';
import AuthLink from '../../components/auth/AuthLink';

function SearchUsersPage() {
  const navigate = useNavigate();
  const { searchUsers, searchResults, error, isLoading } = useAuth();
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('access_token')) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (data) => {
    await searchUsers(data);
    setHasSearched(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--sage)] py-12 px-4 sm:px-6 lg:px-8">
      {/* Main Content */}
      <motion.div
        className="max-w-4xl mx-auto w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          className="text-center text-2xl sm:text-3xl font-['Lora'] text-[var(--primary)] text-shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Find Book Lovers
        </motion.h2>
        <motion.p
          className="mt-2 text-center text-sm text-[var(--text)] font-['Open_Sans']"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Search for users by username or favorite genres.
        </motion.p>

        {/* Search Form */}
        <motion.div
          className="mt-8 frosted-glass p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <UserSearchForm
            onSubmit={handleSubmit}
            error={error}
            isLoading={isLoading}
            className="space-y-4"
          />
        </motion.div>

        {/* Search Results */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {hasSearched && !isLoading && (
            <>
              {searchResults?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {searchResults.map((user, index) => (
                      <motion.div
                        key={user.username}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <UserCard user={user} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <p className="text-center text-[var(--text)]">No users found.</p>
              )}
            </>
          )}
        </motion.div>

        {/* Back Link */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <AuthLink
            to="/me/profile"
            text="Back to Profile"
            className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SearchUsersPage;