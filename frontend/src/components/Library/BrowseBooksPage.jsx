import { useState, useEffect, useCallback } from 'react';
import { useLibrary } from '../../hooks/useLibrary';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import Pagination from '../Common/Pagination';
import BookCard from '../Library/common/BookCard';
import SearchBar from '../Library/BrowseBooks/SearchBar';
import Filters from '../Library/BrowseBooks/Filters';
import BookDetailModal from '../Library/BrowseBooks/BookDetailModal';

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
      // Error handled by hook
    }
  };

  const handleBookmark = async (bookId, isBookmarked) => {
    try {
      if (isBookmarked) {
        await removeBookmark(bookId);
      } else {
        await bookmarkBook(bookId);
      }
    } catch (error) {
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
    } catch (error) {
      console.error('Favorite operation failed:', error);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Page Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--primary-600)' }}>
          Browse Books
        </h1>
        <p className="text-sm md:text-base" style={{ color: 'var(--neutral-600)' }}>
          Discover books from our community library
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.nav
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex gap-2 p-1 rounded-xl" style={{ backgroundColor: 'var(--neutral-100)' }}>
          <motion.button
            onClick={() => setActiveTab('recommended')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all`}
            style={{
              backgroundColor: activeTab === 'recommended' ? 'white' : 'transparent',
              color: activeTab === 'recommended' ? 'var(--primary-600)' : 'var(--neutral-600)',
              boxShadow: activeTab === 'recommended' ? 'var(--shadow-sm)' : 'none'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <StarIcon className="w-5 h-5" />
            <span>Recommended</span>
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('browse')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all`}
            style={{
              backgroundColor: activeTab === 'browse' ? 'white' : 'transparent',
              color: activeTab === 'browse' ? 'var(--primary-600)' : 'var(--neutral-600)',
              boxShadow: activeTab === 'browse' ? 'var(--shadow-sm)' : 'none'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            <span>All Books</span>
          </motion.button>
        </div>
      </motion.nav>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Recommended Tab */}
          {activeTab === 'recommended' && (
            <div>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="spinner-lg"></div>
                </div>
              ) : recommendedBooks.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: 'var(--neutral-900)' }}>
                      <StarSolidIcon className="w-6 h-6" style={{ color: 'var(--warning-500)' }} />
                      Recommended for You
                    </h2>
                    <span className="text-sm px-3 py-1 rounded-full"
                          style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                      {recommendedBooks.length} books
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {recommendedBooks.map((recBook, index) => (
                      <motion.div
                        key={recBook.book.book_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
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
                  </div>
                </>
              ) : (
                <div className="card p-12 text-center">
                  <StarIcon className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--neutral-400)' }} />
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--neutral-700)' }}>
                    No Recommendations Yet
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>
                    Start adding books to your library to get personalized recommendations
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Browse Tab */}
          {activeTab === 'browse' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="card p-4">
                <SearchBar searchQuery={searchQuery} onSearch={handleSearch} />
                <div className="mt-4">
                  <Filters filters={filters} onFilterChange={handleFilterChange} />
                </div>
              </div>

              {/* Books Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="spinner-lg"></div>
                </div>
              ) : isSearching && searchResults?.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--neutral-900)' }}>
                      Search Results
                    </h2>
                    <span className="text-sm px-3 py-1 rounded-full"
                          style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                      {searchResults.length} results
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {searchResults.map((book, index) => (
                      <motion.div
                        key={book.book_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <BookCard
                          book={book}
                          onClick={() => handleBookClick(book.book_id)}
                          onBookmark={handleBookmark}
                          onFavorite={handleFavorite}
                          isBookmarked={false}
                          isFavorited={false}
                        />
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : books?.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--neutral-900)' }}>
                      All Books
                    </h2>
                    <span className="text-sm px-3 py-1 rounded-full"
                          style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                      {pagination?.total || books.length} books
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {books.map((book, index) => (
                      <motion.div
                        key={book.book_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <BookCard
                          book={book}
                          onClick={() => handleBookClick(book.book_id)}
                          onBookmark={handleBookmark}
                          onFavorite={handleFavorite}
                          isBookmarked={false}
                          isFavorited={false}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.pages > 1 && (
                    <div className="mt-8">
                      <Pagination pagination={pagination} onPageChange={(page) => listBooks({ ...filters, page })} />
                    </div>
                  )}
                </>
              ) : (
                <div className="card p-12 text-center">
                  <MagnifyingGlassIcon className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--neutral-400)' }} />
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--neutral-700)' }}>
                    No Books Found
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Book Detail Modal */}
      <BookDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        book={book}
        onBookmark={handleBookmark}
        onFavorite={handleFavorite}
        isBookmarked={false}
        isFavorited={false}
      />
    </div>
  );
};

export default BrowseBooksPage;
