import React, { useState, useEffect, useCallback } from 'react';
import { useLibrary } from '../../hooks/useLibrary';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import Pagination from '../Common/Pagination';
import BookCard from '../Library/common/BookCard';
import TabsNavigation from '../Library/common/TabsNavigation';
import SearchBar from '../Library/BrowseBooks/SearchBar';
import Filters from '../Library/BrowseBooks/Filters';
import BookDetailModal from '../Library/BrowseBooks/BookDetailModal';
import { StarIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';

const BrowseBooksPage = () => {
  const {
    listBooks,
    searchBooks,
    getBook,
    bookmarkBook,
    removeBookmark,
    favoriteBook,
    unfavoriteBook,
    listRecommendedBooks,
    books,
    searchResults,
    book,
    recommendedBooks,
    isLoading,
    error,
    pagination,
  } = useLibrary();

  const [filters, setFilters] = useState({ genre: '', available: '', sort: 'title' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeoutId, setSearchTimeoutId] = useState(null);
  const [activeTab, setActiveTab] = useState('recommended');
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

  const debouncedSearch = useCallback(
    (query) => {
      if (searchTimeoutId) clearTimeout(searchTimeoutId);
      const timeoutId = setTimeout(() => {
        if (query.length >= 3) {
          setIsSearching(true);
          searchBooks({ query });
        } else if (query.length === 0) {
          setIsSearching(false);
          setSearchQuery('');
        } else {
          toast.error('Search query must be at least 3 characters.');
        }
      }, 500);
      setSearchTimeoutId(timeoutId);
    },
    [searchBooks, searchTimeoutId]
  );

  useEffect(() => {
    return () => {
      if (searchTimeoutId) clearTimeout(searchTimeoutId);
    };
  }, [searchTimeoutId]);

  useEffect(() => {
    listBooks(filters);
    listRecommendedBooks();
  }, [filters, listBooks, listRecommendedBooks]);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => activeTab === 'recommended' && setActiveTab('browse'),
    onSwipedRight: () => activeTab === 'browse' && setActiveTab('recommended'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const handleSearch = (query) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookClick = async (bookId) => {
    try {
      await getBook(bookId);
      setIsDetailModalOpen(true);
    } catch {
      toast.error('Failed to fetch book details');
    }
  };

  const handleBookmark = async (bookId, isBookmarked) => {
    try {
      if (isBookmarked) {
        await removeBookmark(bookId);
      } else {
        await bookmarkBook(bookId);
      }
      // Success messages are now handled in the useLibrary hook
    } catch (error) {
      // Error messages are now handled in the useLibrary hook
      console.error('Bookmark operation failed:', error);
    }
  };

  const handleFavorite = async (bookId, isFavorited) => {
    try {
      if (isFavorited) {
        await unfavoriteBook(bookId);
      } else {
        await favoriteBook(bookId);
      }
      // Success messages are now handled in the useLibrary hook
    } catch (error) {
      // Error messages are now handled in the useLibrary hook
      console.error('Favorite operation failed:', error);
    }
  };

  const tabs = [
    { id: 'recommended', label: 'Recommended Books', icon: <StarIcon className="w-4 h-4" /> },
    { id: 'browse', label: 'Browse Books', icon: <BuildingLibraryIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen font-open-sans text-text" {...handlers}>
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-lora font-bold text-gradient mb-4 relative">
            🌍 Browse Books
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full opacity-20"
              animate={{ scale: [1, 1.2, 1], rotate: [0, -180, -360] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </h1>
          <motion.p
            className="font-open-sans text-primary/80 text-lg max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Explore a world of books, discover hidden gems, and find your next great read
          </motion.p>
        </motion.div>

        {/* Enhanced Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} isSmallScreen={isSmallScreen} />
        </motion.div>

        {/* Enhanced Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'recommended' ? 100 : -100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: activeTab === 'recommended' ? -100 : 100, scale: 0.95 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Enhanced Recommended Books Section */}
            {activeTab === 'recommended' && (
              <motion.div
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {recommendedBooks.length > 0 ? (
                  <>
                    <motion.div
                      className="flex items-center justify-between mb-8"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    >
                      <h2 className="text-3xl font-lora font-bold text-primary flex items-center">
                        <StarIcon className="w-8 h-8 mr-3 text-accent" />
                        Recommended for You
                      </h2>
                      <motion.div
                        className="text-sm text-primary/60 bg-white/10 px-3 py-1 rounded-full"
                        whileHover={{ scale: 1.05 }}
                      >
                        {recommendedBooks.length} books
                      </motion.div>
                    </motion.div>

                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    >
                      {recommendedBooks.slice(0, 8).map((recBook, index) => (
                        <motion.div
                          key={recBook.book.book_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.4 }}
                        >
                          <BookCard
                            book={recBook.book}
                            onClick={() => handleBookClick(recBook.book.book_id)}
                            onBookmark={handleBookmark}
                            onFavorite={handleFavorite}
                            isBookmarked={false}
                            isFavorited={false}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    className="text-center py-20"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="text-8xl mb-6">🌟</div>
                    <h3 className="text-2xl font-lora font-bold text-primary mb-4">Building Your Recommendations</h3>
                    <p className="text-primary/70 max-w-md mx-auto">
                      Add more books to your library and interact with the community to get personalized recommendations!
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Enhanced Browse Section */}
            {activeTab === 'browse' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {/* Enhanced Search and Filters */}
                <motion.div
                  className="flex flex-col lg:flex-row gap-6 mb-8 p-6 bookish-glass rounded-2xl border border-white/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <div className="flex-1">
                    <SearchBar searchQuery={searchQuery} onSearch={handleSearch} />
                  </div>
                  <div className="lg:w-80">
                    <Filters filters={filters} onFilterChange={handleFilterChange} />
                  </div>
                </motion.div>

                {/* Enhanced Loading State */}
                {isLoading && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <motion.div
                      className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full mb-4"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-lg font-medium text-primary">Discovering books...</p>
                  </div>
                )}

                {/* Enhanced Error State */}
                {error && (
                  <motion.div
                    className="text-center py-20"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-6xl mb-4">😔</div>
                    <p className="text-xl font-semibold text-red-600 mb-2">Oops! Something went wrong</p>
                    <p className="text-primary/70">{error}</p>
                  </motion.div>
                )}

                {/* Enhanced Books Grid */}
                {!isLoading && !error && (isSearching ? searchResults : books).length > 0 && (
                  <>
                    <motion.div
                      className="flex items-center justify-between mb-6"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    >
                      <h3 className="text-2xl font-lora font-bold text-primary">
                        {isSearching ? `Search Results for "${searchQuery}"` : 'All Books'}
                      </h3>
                      <motion.div
                        className="text-sm text-primary/60 bg-white/10 px-3 py-1 rounded-full"
                        whileHover={{ scale: 1.05 }}
                      >
                        {(isSearching ? searchResults : books).length} books
                      </motion.div>
                    </motion.div>

                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                    >
                      {(isSearching ? searchResults : books).map((bookItem, index) => (
                        <motion.div
                          key={bookItem.book_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.4 }}
                        >
                          <BookCard
                            book={bookItem}
                            onClick={() => handleBookClick(bookItem.book_id)}
                            onBookmark={handleBookmark}
                            onFavorite={handleFavorite}
                            isBookmarked={false}
                            isFavorited={false}
                          />
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                    >
                      <Pagination
                        pagination={pagination[isSearching ? 'search' : 'books']}
                        onPageChange={(page) =>
                          isSearching && searchQuery.length >= 3
                            ? searchBooks({ query: searchQuery }, page)
                            : listBooks(filters, page)
                        }
                      />
                    </motion.div>
                  </>
                )}

                {/* Enhanced Empty State */}
                {!isLoading && !error && (isSearching ? searchResults : books).length === 0 && (
                  <motion.div
                    className="text-center py-20"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="text-8xl mb-6">📚</div>
                    <h3 className="text-2xl font-lora font-bold text-primary mb-4">
                      {isSearching ? 'No Books Found' : 'No Books Available'}
                    </h3>
                    <p className="text-primary/70 max-w-md mx-auto">
                      {isSearching
                        ? `We couldn't find any books matching "${searchQuery}". Try adjusting your search terms.`
                        : 'No books are currently available. Check back later or try different filters.'
                      }
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <BookDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          book={book}
          onBookmark={handleBookmark}
          onFavorite={handleFavorite}
        />
      </div>
    </div>
  );
};

export default BrowseBooksPage;