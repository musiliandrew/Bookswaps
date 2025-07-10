import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { useBooks } from '../../hooks/useBooks';

const BookReferencePicker = ({
  isOpen,
  onClose,
  onSelectBook,
  position = { x: 0, y: 0 },
  searchQuery = ""
}) => {
  const [query, setQuery] = useState(searchQuery);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dragPosition, setDragPosition] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const { searchBooks } = useBooks();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Update drag position when position prop changes
  useEffect(() => {
    setDragPosition(getOptimalPosition(position));
  }, [position]);

  // Get optimal position to keep modal in viewport
  const getOptimalPosition = (pos) => {
    const modalWidth = 320;
    const modalHeight = 400;
    const padding = 20;

    let x = pos.x;
    let y = pos.y;

    // Ensure modal stays within viewport horizontally
    if (x + modalWidth > window.innerWidth - padding) {
      x = window.innerWidth - modalWidth - padding;
    }
    if (x < padding) {
      x = padding;
    }

    // Ensure modal stays within viewport vertically
    if (y + modalHeight > window.innerHeight - padding) {
      y = window.innerHeight - modalHeight - padding;
    }
    if (y < padding) {
      y = padding;
    }

    return { x, y };
  };

  // Handle drag functionality
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDrag = (event, info) => {
    const newPosition = {
      x: dragPosition.x + info.delta.x,
      y: dragPosition.y + info.delta.y
    };
    setDragPosition(getOptimalPosition(newPosition));
  };

  useEffect(() => {
    if (query.length >= 2) {
      searchForBooks(query);
    } else {
      setBooks([]);
    }
  }, [query]);

  const searchForBooks = async (searchQuery) => {
    setIsLoading(true);
    try {
      const results = await searchBooks(searchQuery, 8);
      setBooks(results || []);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Failed to search books:', error);
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!books.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % books.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + books.length) % books.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (books[selectedIndex]) {
          handleSelectBook(books[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  const handleSelectBook = (book) => {
    const bookReference = `[📚 | ${book.title}](book:${book.book_id})`;
    onSelectBook(bookReference, book, true); // true indicates auto-send
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        drag
        dragMomentum={false}
        dragElastic={0.1}
        dragConstraints={{
          left: 10,
          right: window.innerWidth - 330,
          top: 10,
          bottom: window.innerHeight - 410
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrag={handleDrag}
        className={`fixed z-50 bg-gradient-to-br from-[var(--secondary)]/95 to-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--primary)]/20 w-80 max-h-96 overflow-hidden ${
          isDragging ? 'cursor-grabbing shadow-3xl scale-105' : 'cursor-grab'
        } transition-all duration-200`}
        style={{
          left: dragPosition.x,
          top: dragPosition.y,
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header with Drag Handle */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 border-b border-[var(--primary)]/20">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Bars3Icon className="w-4 h-4 text-[var(--primary)]/60 cursor-grab" />
              <BookOpenIcon className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <h3 className="font-semibold text-[var(--primary)] font-lora">Reference a Book</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[var(--primary)]/10 rounded-full transition-colors"
          >
            <XMarkIcon className="w-4 h-4 text-[var(--primary)]" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-[var(--primary)]/20">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--primary)]/60" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search for books..."
              className="w-full pl-10 pr-4 py-2.5 border border-[var(--secondary)] rounded-xl bg-[#FEF3C7]/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] font-open-sans text-[var(--text)] placeholder-[var(--text)]/60"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-[var(--text)]/70">
              <div className="animate-spin w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="font-open-sans text-sm">Searching books...</p>
            </div>
          ) : query.length < 2 ? (
            <div className="p-4 text-center text-[var(--text)]/70">
              <BookOpenIcon className="w-8 h-8 mx-auto mb-2 text-[var(--primary)]/40" />
              <p className="font-open-sans text-sm">Type at least 2 characters to search</p>
            </div>
          ) : books.length === 0 ? (
            <div className="p-4 text-center text-[var(--text)]/70">
              <BookOpenIcon className="w-8 h-8 mx-auto mb-2 text-[var(--primary)]/40" />
              <p className="font-open-sans text-sm">No books found</p>
            </div>
          ) : (
            <div className="py-2">
              {books.map((book, index) => (
                <motion.div
                  key={book.book_id}
                  className={`flex items-start space-x-3 p-3 cursor-pointer transition-all duration-200 ${
                    index === selectedIndex
                      ? 'bg-gradient-to-r from-[var(--primary)]/15 to-[var(--accent)]/10 border-l-3 border-[var(--primary)] shadow-sm'
                      : 'hover:bg-[var(--secondary)]/20'
                  }`}
                  onClick={() => handleSelectBook(book)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Book Cover */}
                  <div className="flex-shrink-0">
                    {book.cover_image ? (
                      <img
                        src={book.cover_image}
                        alt={book.title}
                        className="w-10 h-12 object-cover rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-12 bg-gradient-to-br from-[var(--secondary)] to-[var(--accent)]/30 rounded-lg flex items-center justify-center shadow-sm">
                        <BookOpenIcon className="w-5 h-5 text-[var(--primary)]" />
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[var(--primary)] text-sm line-clamp-1 font-lora">
                      {book.title}
                    </h4>
                    <p className="text-xs text-[var(--text)]/70 mb-1 font-open-sans">
                      by {book.author}
                    </p>
                    {book.genre && (
                      <span className="inline-block bg-[var(--accent)]/20 text-[var(--primary)] text-xs px-2 py-1 rounded-full font-open-sans font-medium">
                        {book.genre}
                      </span>
                    )}
                  </div>

                  {/* Selection Indicator */}
                  {index === selectedIndex && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse"></div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--primary)]/20 bg-gradient-to-r from-[var(--secondary)]/30 to-[var(--accent)]/10">
          <p className="text-xs text-[var(--text)]/60 text-center font-open-sans">
            Use ↑↓ to navigate, Enter to select, Esc to close • Drag to move
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookReferencePicker;
