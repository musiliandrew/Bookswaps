import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpenIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useBooks } from '../../hooks/useBooks';

const SmartTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Type your message...",
  className = "",
  maxLength = 500,
  showBookReferences = true,
  minRows = 1,
  maxRows = 6
}) => {
  const [showBookSearch, setShowBookSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [bookSearchResults, setBookSearchResults] = useState([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const textareaRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const modalRef = useRef(null);
  const { searchBooks } = useBooks();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Fast book search with debouncing
  const searchBooksDebounced = async (query) => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search for 150ms for ultra-fast response
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchBooks(query);
        // Limit to 2 results as requested
        setBookSearchResults(results.slice(0, 2));
      } catch (error) {
        console.error('Book search error:', error);
        // Fallback: show some sample results for demo
        const sampleBooks = [
          {
            book_id: 'sample-1',
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            genre: 'Classic Literature'
          },
          {
            book_id: 'sample-2',
            title: 'To Kill a Mockingbird',
            author: 'Harper Lee',
            genre: 'Fiction'
          }
        ].filter(book =>
          book.title.toLowerCase().includes(query.toLowerCase()) ||
          book.author.toLowerCase().includes(query.toLowerCase())
        );
        setBookSearchResults(sampleBooks.slice(0, 2));
      }
    }, 150);
  };

  // Calculate cursor position for dropdown placement - simplified
  const calculateCursorPosition = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const rect = textarea.getBoundingClientRect();

    // Position modal below the textarea (simpler and more reliable)
    const top = rect.bottom + 8;
    const left = rect.left;

    // Ensure modal stays within viewport
    const modalWidth = 320;
    const modalHeight = 250;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let finalLeft = left;
    let finalTop = top;

    // Adjust horizontal position if modal would go off-screen
    if (left + modalWidth > viewportWidth) {
      finalLeft = Math.max(10, viewportWidth - modalWidth - 10);
    }

    // Adjust vertical position if modal would go off-screen
    if (top + modalHeight > viewportHeight) {
      finalTop = Math.max(10, rect.top - modalHeight - 8);
    }

    setDropdownPosition({ top: finalTop, left: finalLeft });
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.drag-handle')) {
      setIsDragging(true);
      const rect = modalRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newLeft = e.clientX - dragOffset.x;
      const newTop = e.clientY - dragOffset.y;

      // Keep modal within viewport
      const modalWidth = 320;
      const modalHeight = 200;
      const adjustedLeft = Math.max(0, Math.min(newLeft, window.innerWidth - modalWidth));
      const adjustedTop = Math.max(0, Math.min(newTop, window.innerHeight - modalHeight));

      setDropdownPosition({ top: adjustedTop, left: adjustedLeft });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showBookSearch && modalRef.current && !modalRef.current.contains(event.target) && !textareaRef.current.contains(event.target)) {
        setShowBookSearch(false);
        setBookSearchResults([]);
      }
    };

    if (showBookSearch) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showBookSearch]);

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    const newCursorPosition = e.target.selectionStart;
    setCursorPosition(newCursorPosition);
    onChange(newValue);

    // Auto-resize textarea
    autoResizeTextarea(e.target);

    // Check for book@ trigger - improved detection
    if (showBookReferences) {
      const textBeforeCursor = newValue.substring(0, newCursorPosition);
      // More flexible regex that allows spaces and other characters
      const bookMatch = textBeforeCursor.match(/book@([^@\n]*)$/);

      if (bookMatch) {
        const query = bookMatch[1].trim();
        setSearchQuery(query);

        // Only show modal if not already showing to prevent flicker
        if (!showBookSearch) {
          setShowBookSearch(true);
          // Calculate dropdown position with a small delay to ensure textarea is updated
          setTimeout(() => calculateCursorPosition(), 10);
        }

        // Search immediately if query has content, otherwise show popular books
        if (query.length > 0) {
          searchBooksDebounced(query);
        } else {
          // Show popular books when just "book@" is typed for instant results
          setBookSearchResults([
            {
              book_id: 'sample-1',
              title: 'The Great Gatsby',
              author: 'F. Scott Fitzgerald',
              genre: 'Classic Literature'
            },
            {
              book_id: 'sample-2',
              title: 'To Kill a Mockingbird',
              author: 'Harper Lee',
              genre: 'Fiction'
            }
          ]);
        }
      } else {
        // Only hide if we're not in the middle of typing a book reference
        const hasBookAt = textBeforeCursor.includes('book@');
        if (!hasBookAt) {
          setShowBookSearch(false);
          setBookSearchResults([]);
        }
      }
    }
  };

  const autoResizeTextarea = (textarea) => {
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const lineHeight = 24; // Approximate line height
    const minHeight = lineHeight * minRows;
    const maxHeight = lineHeight * maxRows;

    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
      if (showBookSearch && bookSearchResults.length > 0) {
        e.preventDefault();
        // Handle book selection navigation
        return;
      }
    }
    
    // Update cursor position
    setTimeout(() => {
      setCursorPosition(e.target.selectionStart);
    }, 0);
  };

  const insertBookReference = (book) => {
    const text = value || '';
    const beforeCursor = text.substring(0, cursorPosition);
    const afterCursor = text.substring(cursorPosition);
    
    // Find the book@ trigger and replace it
    const beforeTrigger = beforeCursor.replace(/book@\w*$/, '');
    const bookReference = `[📚 ${book.title} by ${book.author}](book:${book.book_id})`;
    
    const newText = beforeTrigger + bookReference + afterCursor;
    onChange(newText);
    
    // Close search
    setShowBookSearch(false);
    setBookSearchResults([]);
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newPosition = beforeTrigger.length + bookReference.length;
      textareaRef.current?.setSelectionRange(newPosition, newPosition);
    }, 0);
  };



  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full resize-none border border-[var(--accent)]/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all bg-white/80 backdrop-blur-sm text-[var(--dark-primary)] placeholder-[var(--text)] font-open-sans ${className}`}
        rows={minRows}
        style={{ minHeight: `${24 * minRows}px`, maxHeight: `${24 * maxRows}px` }}
      />
      
      {/* Character count */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-400">
        {(value || '').length}/{maxLength}
      </div>

      {/* Book search dropdown - positioned at cursor */}
      <AnimatePresence>
        {showBookSearch && bookSearchResults.length > 0 && (
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-[9999] bg-[var(--secondary)] border border-[var(--accent)]/30 rounded-lg shadow-xl overflow-hidden backdrop-blur-sm cursor-move"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              minWidth: '280px',
              maxWidth: '320px'
            }}
            onMouseDown={handleMouseDown}
          >
            {/* Search header */}
            <div className="drag-handle px-3 py-2 bg-gradient-to-r from-[var(--accent)]/10 to-[var(--secondary)]/20 border-b border-[var(--accent)]/20 flex items-center justify-between cursor-move">
              <div className="flex items-center space-x-2">
                <MagnifyingGlassIcon className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm text-[var(--text)] font-open-sans">
                  {searchQuery ? `"${searchQuery}"` : 'Book search'}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowBookSearch(false);
                  setBookSearchResults([]);
                }}
                className="p-1 hover:bg-[var(--accent)]/20 rounded transition-colors"
              >
                <XMarkIcon className="w-4 h-4 text-[var(--text)]/60" />
              </button>
            </div>

            {/* Search results */}
            <div className="max-h-32 overflow-y-auto">
              {bookSearchResults.length > 0 ? (
                bookSearchResults.map((book, index) => (
                  <motion.button
                    key={book.book_id}
                    onClick={() => insertBookReference(book)}
                    className="w-full px-3 py-3 text-left hover:bg-[var(--accent)]/10 transition-colors flex items-center space-x-3 border-b border-[var(--accent)]/10 last:border-b-0"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <BookOpenIcon className="w-5 h-5 text-[var(--accent)] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--dark-primary)] truncate font-lora">
                        {book.title}
                      </div>
                      <div className="text-xs text-[var(--text)] truncate font-open-sans">
                        by {book.author}
                      </div>
                      {book.genre && (
                        <div className="text-xs text-[var(--text)]/70 truncate font-open-sans">
                          {book.genre}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-[var(--accent)] font-open-sans">
                      Click
                    </div>
                  </motion.button>
                ))
              ) : searchQuery ? (
                <div className="px-3 py-2 text-sm text-[var(--text)]/60 text-center">
                  No books found for "{searchQuery}"
                </div>
              ) : (
                <div className="px-3 py-2 text-sm text-[var(--text)]/60 text-center">
                  Start typing to search books...
                </div>
              )}
            </div>

            {/* Help text */}
            <div className="px-3 py-2 bg-[var(--primary)]/5 border-t border-[var(--accent)]/20">
              <div className="text-xs text-[var(--text)]/70">
                💡 Type <code className="bg-[var(--accent)]/20 text-[var(--dark-primary)] px-1 rounded">book@</code> to reference books
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartTextEditor;
