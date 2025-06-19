import React, { useState, useEffect, useCallback } from 'react';
import { useLibrary } from '../../hooks/useLibrary';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import Pagination from '../Common/Pagination';
import BookCard from '../Library/BrowseBooks/BookCard';
import TabsNavigation from '../Library/BrowseBooks/TabsNavigation';
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
      if (isBookmarked) await removeBookmark(bookId);
      else await bookmarkBook(bookId);
      toast.success(isBookmarked ? 'Bookmark removed' : 'Book bookmarked');
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  const handleFavorite = async (bookId, isFavorited) => {
    try {
      if (isFavorited) await unfavoriteBook(bookId);
      else await favoriteBook(bookId);
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  return (
    <div className="min-h-screen bg-background font-open-sans text-text pt-16 pb-20" {...handlers}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-lora font-bold text-primary mb-6">Browse Books</h1>

        <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} isSmallScreen={isSmallScreen} />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'recommended' ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === 'recommended' ? -100 : 100 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'recommended' && recommendedBooks.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-lora font-bold text-primary mb-4">Recommended Books</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendedBooks.slice(0, 4).map((recBook) => (
                    <BookCard
                      key={recBook.book.book_id}
                      book={recBook.book}
                      onClick={() => handleBookClick(recBook.book.book_id)}
                      onBookmark={handleBookmark}
                      onFavorite={handleFavorite}
                      isBookmarked={false}
                      isFavorited={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'browse' && (
              <>
                <SearchBar searchQuery={searchQuery} onSearch={handleSearch} />
                <Filters filters={filters} onFilterChange={handleFilterChange} />
                {isLoading && <div className="text-center text-lg">Loading...</div>}
                {error && <div className="text-center text-error text-lg">{error}</div>}
                {(isSearching ? searchResults : books).length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(isSearching ? searchResults : books).map((bookItem) => (
                        <BookCard
                          key={bookItem.book_id}
                          book={bookItem}
                          onClick={() => handleBookClick(bookItem.book_id)}
                          onBookmark={handleBookmark}
                          onFavorite={handleFavorite}
                          isBookmarked={false}
                          isFavorited={false}
                        />
                      ))}
                    </div>
                    <Pagination
                      pagination={pagination[isSearching ? 'search' : 'books']}
                      onPageChange={(page) =>
                        isSearching
                          ? searchBooks({ query: searchQuery }, page)
                          : listBooks(filters, page)
                      }
                    />
                  </>
                ) : (
                  <div className="text-center text-lg">No books found.</div>
                )}
              </>
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