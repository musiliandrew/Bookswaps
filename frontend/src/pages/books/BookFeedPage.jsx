import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import BookCard from '../../components/home/BookCard';
import BookSearchForm from '../../components/books/BookSearchForm';
import ErrorMessage from '../../components/auth/ErrorMessage';

function BookFeedPage() {
  const navigate = useNavigate();
  const { getBooks, books, error, isLoading, isAuthenticated } = useAuth();
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      getBooks({}).catch(() => setGlobalError('Failed to load books.'));
    }
  }, [isAuthenticated, navigate, getBooks]);

  const handleSearch = async (data) => {
    try {
      await getBooks(data);
    } catch {
      setGlobalError('Failed to perform search.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5E8C7] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        <motion.h2
          className="text-center text-3xl font-['Playfair_Display'] text-[#FF6F61] mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Discover Books
        </motion.h2>
        <motion.p
          className="text-center text-sm text-[#333] font-['Poppins'] mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Browse books available for swapping.
        </motion.p>

        {/* Search Form */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <BookSearchForm onSubmit={handleSearch} error={error} isLoading={isLoading} />
        </motion.div>

        {/* Global Error */}
        <AnimatePresence>
          {(error || globalError) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ErrorMessage message={globalError || error} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Book Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {isLoading ? (
            <div className="text-center">
              <div className="bookish-spinner mx-auto"></div>
              <p className="text-[#333] font-['Poppins'] mt-2">Loading...</p>
            </div>
          ) : books?.length ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <AnimatePresence>
                {books.map((book, index) => (
                  <motion.li
                    key={book.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <BookCard book={book} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <p className="text-center text-[#333] font-['Poppins']">
              No books found. Try different search criteria.
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default BookFeedPage;