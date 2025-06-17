import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useAuth } from '../../hooks/useAuth';
import { useLibrary } from '../../hooks/useLibrary';
import { useSwaps } from '../../hooks/useSwaps';
import LibraryList from '../../components/Library/LibraryList';
import SwapCard from '../../components/Library/SwapCard';
import SearchBar from '../../components/Library/SearchBar';
import ErrorBoundary from '../../components/Common/ErrorBoundary';

const LibraryPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, profile, isLoading: authLoading, error: authError } = useAuth();
  const { getUserLibrary, userLibrary, isLoading: libLoading, error: libError } = useLibrary();
  const { getSwaps, swaps, isLoading: swapsLoading, error: swapsError } = useSwaps();
  const [activeTab, setActiveTab] = useState('books');
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    getUserLibrary();
    getSwaps({ status: 'pending' });
  }, [isAuthenticated, navigate, getUserLibrary, getSwaps]);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => activeTab === 'books' && setActiveTab('swaps'),
    onSwipedRight: () => activeTab === 'swaps' && setActiveTab('books'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const tabs = [
    { id: 'books', label: 'Books', icon: '/assets/icons/books.svg' },
    { id: 'swaps', label: 'Swaps', icon: '/assets/icons/swap.svg' },
  ];

  if (authLoading || libLoading || swapsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bookish-spinner w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError || libError || swapsError) {
    return (
      <div className="text-center p-4 text-[var(--text)]">
        {authError || libError || swapsError || 'Failed to load library data. Please try again.'}
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <div className="min-h-screen bookish-gradient p-4" {...handlers}>
      {/* Bottom Navbar */}
      <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md bg-[var(--primary)] bookish-glass rounded-xl p-2 flex justify-around items-center z-10 shadow-lg">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'text-[#D4A017] underline'
                : 'text-[var(--secondary)] hover:text-[var(--accent)]'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSmallScreen ? (
              <img src={tab.icon} alt={`${tab.label} icon`} className="w-6 h-6" />
            ) : (
              <span className="text-sm font-['Open_Sans']">{tab.label}</span>
            )}
            {!isSmallScreen && activeTab === tab.id && (
              <motion.div
                className="w-2 h-1 bg-[#D4A017] rounded-full mt-1"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
        ))}
      </nav>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 'books' ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTab === 'books' ? -100 : 100 }}
          transition={{ duration: 0.3 }}
          className="mt-20 mb-20"
        >
          {activeTab === 'books' ? (
            <BooksSection userLibrary={userLibrary} profile={profile} />
          ) : (
            <SwapsSection swaps={swaps} profile={profile} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
    </ErrorBoundary>
  );
};

// BooksSection Component
const BooksSection = ({ userLibrary }) => {
  const handleSearch = () => {};

  return (
    <motion.div
      className="bookish-glass p-6 rounded-xl max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-['Lora'] text-[var(--primary)] mb-4">My Books</h1>
      <SearchBar onSearch={handleSearch} />
      <LibraryList books={userLibrary} />
    </motion.div>
  );
};

// SwapsSection Component
const SwapsSection = ({ swaps, profile }) => {
  return (
    <motion.div
      className="bookish-glass p-6 rounded-xl max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-['Lora'] text-[var(--primary)] mb-4">My Swaps</h1>
      {swaps.length > 0 ? (
        swaps.map((swap) => (
          <SwapCard
            key={swap.id}
            swap={swap}
            isReceived={profile?.id === swap.responder.id}
            className="mb-6 last:mb-0"
          />
        ))
      ) : (
        <p className="text-[var(--text)] font-['Open_Sans'] text-center">No swaps available.</p>
      )}
    </motion.div>
  );
};

export default LibraryPage;