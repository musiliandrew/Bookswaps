import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  SparklesIcon,
  BookOpenIcon,
  UserIcon,
  HashtagIcon,
  CalendarIcon,
  PhotoIcon,
  CheckCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useLibrary } from '../../../hooks/useLibrary';
import { getBookCoverUrl } from '../../../utils/imageUtils';
import { useDebounce } from '../../../hooks/useDebounce';
import { toast } from 'react-toastify';

const SmartBookSearch = ({ onBookSelect, onManualAdd, isOpen, onClose }) => {
  const { searchOpenLibrary, openLibraryResults, isLoading, error } = useLibrary();
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('general');
  const [, setSelectedBook] = useState(null);
  const [showResults, setShowResults] = useState(false);
  
  // Debounce search query to avoid too many API calls
  const debouncedQuery = useDebounce(query, 500);

  const handleSearch = useCallback(async () => {
    if (!debouncedQuery || debouncedQuery.length < 2) return;

    setShowResults(true);
    try {
      await searchOpenLibrary(debouncedQuery, searchType, 10);
    } catch (err) {
      console.error('Search error:', err);
      toast.error('Search failed. Please try again.');
    }
  }, [debouncedQuery, searchType, searchOpenLibrary]);

  // Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 2) {
      handleSearch();
    } else {
      setShowResults(false);
    }
  }, [debouncedQuery, searchType, handleSearch]);

  const handleBookSelect = (book) => {
    setSelectedBook(book);
    onBookSelect(book);
    setQuery('');
    setShowResults(false);
  };

  const handleClear = () => {
    setQuery('');
    setShowResults(false);
    setSelectedBook(null);
  };

  const searchTypes = [
    { value: 'general', label: '🔍 General', description: 'Search everything' },
    { value: 'title', label: '📖 Title', description: 'Search by book title' },
    { value: 'author', label: '👤 Author', description: 'Search by author name' },
    { value: 'isbn', label: '#️⃣ ISBN', description: 'Search by ISBN number' }
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="w-full max-w-sm sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] bookish-glass rounded-xl sm:rounded-2xl border border-white/20 overflow-hidden"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="p-3 sm:p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg sm:rounded-xl">
                <SparklesIcon className="w-5 sm:w-6 h-5 sm:h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-lora font-bold text-primary">Smart Book Search</h2>
                <p className="text-xs sm:text-sm text-primary/70 hidden sm:block">Find books instantly from Open Library</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 text-primary transition-colors"
            >
              <XMarkIcon className="w-5 sm:w-6 h-5 sm:h-6" />
            </button>
          </div>

          {/* Search Type Selector */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {searchTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSearchType(type.value)}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  searchType === type.value
                    ? 'bg-accent text-white shadow-lg'
                    : 'bg-white/10 text-primary hover:bg-white/20'
                }`}
              >
                <span className="sm:hidden">{type.label.split(' ')[0]}</span>
                <span className="hidden sm:inline">{type.label}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder={`Search by ${searchTypes.find(t => t.value === searchType)?.description || 'anything'}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 pl-10 sm:pl-14 pr-10 sm:pr-12 bookish-input rounded-xl sm:rounded-2xl border-0 bg-white/10 backdrop-blur-sm text-primary placeholder-primary/60 focus:bg-white/20 transition-all duration-300 text-sm sm:text-base mobile-search-input"
              autoFocus
            />
            <MagnifyingGlassIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 sm:w-6 h-5 sm:h-6 text-primary/60 mobile-search-icon" />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-primary/20 hover:bg-primary/30 text-primary transition-all duration-200 mobile-search-clear"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto max-h-[65vh] sm:max-h-[60vh]">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                className="p-4 sm:p-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="inline-flex items-center space-x-2 text-primary">
                  <div className="animate-spin rounded-full h-5 sm:h-6 w-5 sm:w-6 border-b-2 border-accent"></div>
                  <span className="text-sm sm:text-base">Searching Open Library...</span>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                className="p-4 sm:p-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-red-400 text-sm sm:text-base">{error}</p>
              </motion.div>
            )}

            {showResults && !isLoading && openLibraryResults.length === 0 && query.length >= 2 && (
              <motion.div
                className="p-4 sm:p-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <BookOpenIcon className="w-12 sm:w-16 h-12 sm:h-16 text-primary/30 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-primary mb-2">No books found</h3>
                <p className="text-sm sm:text-base text-primary/70 mb-3 sm:mb-4 px-2">
                  We couldn't find any books matching "{query}". Try a different search term or add the book manually.
                </p>
                <button
                  onClick={onManualAdd}
                  className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-accent text-white rounded-lg sm:rounded-xl hover:bg-accent/90 transition-colors text-sm sm:text-base"
                >
                  <PlusIcon className="w-4 sm:w-5 h-4 sm:h-5" />
                  <span className="hidden sm:inline">Add Book Manually</span>
                  <span className="sm:hidden">Add Manually</span>
                </button>
              </motion.div>
            )}

            {showResults && !isLoading && openLibraryResults.length > 0 && (
              <motion.div
                className="p-3 sm:p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="grid gap-2 sm:gap-4">
                  {openLibraryResults.map((book, index) => (
                    <BookSearchResult
                      key={`${book.open_library_key}-${index}`}
                      book={book}
                      onSelect={() => handleBookSelect(book)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {!showResults && !isLoading && (
              <motion.div
                className="p-4 sm:p-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SparklesIcon className="w-12 sm:w-16 h-12 sm:h-16 text-accent/30 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-primary mb-2">Start typing to search</h3>
                <p className="text-sm sm:text-base text-primary/70 mb-4 sm:mb-6 px-2">
                  Search millions of books from Open Library. Just type a title, author, or ISBN.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-primary/60">
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    <BookOpenIcon className="w-3 sm:w-4 h-3 sm:h-4" />
                    <span>Search by title</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    <UserIcon className="w-3 sm:w-4 h-3 sm:h-4" />
                    <span>Search by author</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    <HashtagIcon className="w-3 sm:w-4 h-3 sm:h-4" />
                    <span>Search by ISBN</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    <PlusIcon className="w-3 sm:w-4 h-3 sm:h-4" />
                    <span>Add manually if not found</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            <p className="text-xs text-primary/60 text-center sm:text-left">
              <span className="hidden sm:inline">Powered by Open Library • Millions of books available</span>
              <span className="sm:hidden">Powered by Open Library</span>
            </p>
            <button
              onClick={onManualAdd}
              className="text-xs sm:text-sm text-accent hover:text-accent/80 transition-colors"
            >
              <span className="hidden sm:inline">Can't find your book? Add manually →</span>
              <span className="sm:hidden">Add manually →</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Helper function to get the best available cover image
const getBestCoverImage = (book) => {
  return getBookCoverUrl(book, 'L');
};

// Book Search Result Component
const BookSearchResult = ({ book, onSelect }) => {
  const [imageError, setImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(getBestCoverImage(book));

  const handleImageError = () => {
    if (!imageError && book.isbn) {
      // Try medium size as fallback
      const cleanIsbn = book.isbn.replace(/[^0-9]/g, '');
      if (cleanIsbn.length >= 10) {
        setCurrentImageUrl(`https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg`);
        return;
      }
    }
    setImageError(true);
  };
  return (
    <motion.div
      className="p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
    >
      <div className="flex space-x-3 sm:space-x-4">
        {/* Book Cover - Enhanced Visibility */}
        <div className="flex-shrink-0 relative">
          <div className="w-12 sm:w-16 h-16 sm:h-20 bg-gradient-to-br from-white/90 to-gray-100/90 rounded-md sm:rounded-lg shadow-lg border border-white/30 overflow-hidden">
            {currentImageUrl && !imageError ? (
              <img
                src={currentImageUrl}
                alt={book.title}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={handleImageError}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <BookOpenIcon className="w-6 sm:w-8 h-6 sm:h-8 text-primary/60" />
              </div>
            )}
          </div>
        </div>

        {/* Book Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-primary group-hover:text-accent transition-colors line-clamp-2">
            {book.title}
          </h3>
          {book.author && (
            <p className="text-xs sm:text-sm text-primary/70 mt-1">by {book.author}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2 text-xs text-primary/60">
            {book.year && (
              <div className="flex items-center space-x-1">
                <CalendarIcon className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                <span>{book.year}</span>
              </div>
            )}
            {book.isbn && (
              <div className="flex items-center space-x-1 hidden sm:flex">
                <HashtagIcon className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                <span>ISBN: {book.isbn}</span>
              </div>
            )}
            {book.publisher && (
              <span className="truncate max-w-20 sm:max-w-32 hidden sm:inline">{book.publisher}</span>
            )}
          </div>

          {book.genres && book.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5 sm:mt-2">
              {book.genres.slice(0, 2).map((genre, index) => (
                <span
                  key={index}
                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-accent/20 text-accent text-xs rounded-full truncate max-w-16 sm:max-w-none"
                >
                  {genre}
                </span>
              ))}
              {book.genres.length > 2 && (
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary/20 text-primary text-xs rounded-full">
                  +{book.genres.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Select Button */}
        <div className="flex-shrink-0 flex items-center">
          <div className="p-1.5 sm:p-2 bg-accent/20 text-accent rounded-lg sm:rounded-xl group-hover:bg-accent group-hover:text-white transition-all">
            <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SmartBookSearch;
