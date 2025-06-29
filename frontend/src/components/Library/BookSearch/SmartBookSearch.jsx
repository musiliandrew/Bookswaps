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
import { useDebounce } from '../../../hooks/useDebounce';
import { toast } from 'react-toastify';

const SmartBookSearch = ({ onBookSelect, onManualAdd, isOpen, onClose }) => {
  const { searchOpenLibrary, openLibraryResults, isLoading, error } = useLibrary();
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('general');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showResults, setShowResults] = useState(false);
  
  // Debounce search query to avoid too many API calls
  const debouncedQuery = useDebounce(query, 500);

  // Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 2) {
      handleSearch();
    } else {
      setShowResults(false);
    }
  }, [debouncedQuery, searchType]);

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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="w-full max-w-4xl max-h-[90vh] bookish-glass rounded-2xl border border-white/20 overflow-hidden"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl">
                <SparklesIcon className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-lora font-bold text-primary">Smart Book Search</h2>
                <p className="text-sm text-primary/70">Find books instantly from Open Library</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-primary transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Search Type Selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {searchTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSearchType(type.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  searchType === type.value
                    ? 'bg-accent text-white shadow-lg'
                    : 'bg-white/10 text-primary hover:bg-white/20'
                }`}
              >
                {type.label}
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
              className="w-full px-6 py-4 pl-14 pr-12 bookish-input rounded-2xl border-0 bg-white/10 backdrop-blur-sm text-primary placeholder-primary/60 focus:bg-white/20 transition-all duration-300"
              autoFocus
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-primary/60" />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-primary/20 hover:bg-primary/30 text-primary transition-all duration-200"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                className="p-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="inline-flex items-center space-x-2 text-primary">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
                  <span>Searching Open Library...</span>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                className="p-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-red-400">{error}</p>
              </motion.div>
            )}

            {showResults && !isLoading && openLibraryResults.length === 0 && query.length >= 2 && (
              <motion.div
                className="p-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <BookOpenIcon className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-primary mb-2">No books found</h3>
                <p className="text-primary/70 mb-4">
                  We couldn't find any books matching "{query}". Try a different search term or add the book manually.
                </p>
                <button
                  onClick={onManualAdd}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add Book Manually</span>
                </button>
              </motion.div>
            )}

            {showResults && !isLoading && openLibraryResults.length > 0 && (
              <motion.div
                className="p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="grid gap-4">
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
                className="p-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SparklesIcon className="w-16 h-16 text-accent/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-primary mb-2">Start typing to search</h3>
                <p className="text-primary/70 mb-6">
                  Search millions of books from Open Library. Just type a title, author, or ISBN.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm text-primary/60">
                  <div className="flex items-center space-x-2">
                    <BookOpenIcon className="w-4 h-4" />
                    <span>Search by title</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4" />
                    <span>Search by author</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <HashtagIcon className="w-4 h-4" />
                    <span>Search by ISBN</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <PlusIcon className="w-4 h-4" />
                    <span>Add manually if not found</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-primary/60">
              Powered by Open Library • Millions of books available
            </p>
            <button
              onClick={onManualAdd}
              className="text-sm text-accent hover:text-accent/80 transition-colors"
            >
              Can't find your book? Add manually →
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Book Search Result Component
const BookSearchResult = ({ book, onSelect }) => {
  return (
    <motion.div
      className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
    >
      <div className="flex space-x-4">
        {/* Book Cover */}
        <div className="flex-shrink-0">
          {book.cover_image_url ? (
            <img
              src={book.cover_image_url}
              alt={book.title}
              className="w-16 h-20 object-cover rounded-lg shadow-md"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`w-16 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center ${book.cover_image_url ? 'hidden' : 'flex'}`}
          >
            <BookOpenIcon className="w-8 h-8 text-primary/60" />
          </div>
        </div>

        {/* Book Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-primary group-hover:text-accent transition-colors line-clamp-2">
            {book.title}
          </h3>
          {book.author && (
            <p className="text-sm text-primary/70 mt-1">by {book.author}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-primary/60">
            {book.year && (
              <div className="flex items-center space-x-1">
                <CalendarIcon className="w-3 h-3" />
                <span>{book.year}</span>
              </div>
            )}
            {book.isbn && (
              <div className="flex items-center space-x-1">
                <HashtagIcon className="w-3 h-3" />
                <span>ISBN: {book.isbn}</span>
              </div>
            )}
            {book.publisher && (
              <span className="truncate max-w-32">{book.publisher}</span>
            )}
          </div>

          {book.genres && book.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {book.genres.slice(0, 3).map((genre, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full"
                >
                  {genre}
                </span>
              ))}
              {book.genres.length > 3 && (
                <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                  +{book.genres.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Select Button */}
        <div className="flex-shrink-0 flex items-center">
          <div className="p-2 bg-accent/20 text-accent rounded-xl group-hover:bg-accent group-hover:text-white transition-all">
            <CheckCircleIcon className="w-5 h-5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SmartBookSearch;
