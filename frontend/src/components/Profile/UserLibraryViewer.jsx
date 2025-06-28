import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUsers } from '../../hooks/useUsers';
import { useSwaps } from '../../hooks/useSwaps';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  BookOpenIcon,
  ArrowPathIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  HeartIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import BookCard from '../Library/common/BookCard';
import Pagination from '../Common/Pagination';

const UserLibraryViewer = ({ userId, username, isOpen, onClose }) => {
  const { profile } = useAuth();
  const { getUserBooks, isLoading, error } = useUsers();
  const { initiateSwap } = useSwaps();
  
  const [userBooks, setUserBooks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    available_only: true,
    sort: 'title'
  });
  const [selectedBook, setSelectedBook] = useState(null);
  const [showSwapModal, setShowSwapModal] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadUserBooks();
    }
  }, [isOpen, userId, filters]);

  const loadUserBooks = async (page = 1) => {
    try {
      const result = await getUserBooks(userId, { ...filters, page });
      if (result) {
        setUserBooks(result.results || []);
        setPagination({
          next: result.next,
          previous: result.previous,
          page,
          totalPages: Math.ceil(result.count / (result.results?.length || 1))
        });
      }
    } catch (error) {
      console.error('Error loading user books:', error);
      toast.error('Failed to load user library');
    }
  };

  const handleSwapRequest = async (book) => {
    setSelectedBook(book);
    setShowSwapModal(true);
  };

  const handleInitiateSwap = async (myBookId) => {
    if (!selectedBook || !myBookId) return;

    try {
      const result = await initiateSwap({
        initiator_book_id: myBookId,
        receiver_id: userId,
        receiver_book_id: selectedBook.book_id,
        message: `Hi! I'd like to swap my book for "${selectedBook.title}"`
      });

      if (result) {
        toast.success('Swap request sent successfully!');
        setShowSwapModal(false);
        setSelectedBook(null);
      }
    } catch (error) {
      toast.error('Failed to send swap request');
      console.error('Swap request error:', error);
    }
  };

  const availableBooks = userBooks.filter(book => 
    book.available_for_exchange || book.available_for_borrow
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bookish-glass rounded-2xl border border-white/20 w-full max-w-6xl max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl">
                  <BookOpenIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-lora font-bold text-primary">
                    {username}'s Library
                  </h3>
                  <p className="text-sm text-primary/70">
                    {availableBooks.length} books available for exchange
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-primary/70" />
              </button>
            </div>

            {/* Filters */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary/50" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Search books..."
                  className="w-full pl-10 pr-4 py-2 bookish-input rounded-lg border-0 bg-white/10 text-primary text-sm"
                />
              </div>

              <select
                value={filters.genre}
                onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
                className="px-4 py-2 bookish-input rounded-lg border-0 bg-white/10 text-primary text-sm"
              >
                <option value="">All Genres</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Mystery">Mystery</option>
                <option value="Romance">Romance</option>
                <option value="Science Fiction">Science Fiction</option>
                <option value="Fantasy">Fantasy</option>
              </select>

              <select
                value={filters.sort}
                onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                className="px-4 py-2 bookish-input rounded-lg border-0 bg-white/10 text-primary text-sm"
              >
                <option value="title">Sort by Title</option>
                <option value="author">Sort by Author</option>
                <option value="year">Sort by Year</option>
                <option value="condition">Sort by Condition</option>
              </select>

              <label className="flex items-center gap-2 text-sm text-primary">
                <input
                  type="checkbox"
                  checked={filters.available_only}
                  onChange={(e) => setFilters(prev => ({ ...prev, available_only: e.target.checked }))}
                  className="rounded border-white/20"
                />
                Available only
              </label>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                <span className="ml-2 text-primary/70">Loading library...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400 mb-4">Failed to load library</p>
                <button
                  onClick={() => loadUserBooks()}
                  className="bookish-button-enhanced text-white px-4 py-2 rounded-lg"
                >
                  Try Again
                </button>
              </div>
            ) : userBooks.length === 0 ? (
              <div className="text-center py-12">
                <BookOpenIcon className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                <p className="text-primary/70">No books found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userBooks.map((book) => (
                    <motion.div
                      key={book.book_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative"
                    >
                      <BookCard
                        book={book}
                        showOwnerActions={false}
                        showSwapButton={book.available_for_exchange && book.user?.user_id !== profile?.user_id}
                        onSwapRequest={() => handleSwapRequest(book)}
                      />
                      
                      {/* Availability Badge */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {book.available_for_exchange && (
                          <div className="px-2 py-1 bg-green-500/20 border border-green-500/30 text-green-400 text-xs rounded-full">
                            Exchange
                          </div>
                        )}
                        {book.available_for_borrow && (
                          <div className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs rounded-full">
                            Borrow
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      pagination={pagination}
                      onPageChange={loadUserBooks}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* Swap Modal */}
        {showSwapModal && selectedBook && (
          <SwapRequestModal
            book={selectedBook}
            onClose={() => {
              setShowSwapModal(false);
              setSelectedBook(null);
            }}
            onSwapRequest={handleInitiateSwap}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// Simple swap request modal component
const SwapRequestModal = ({ book, onClose, onSwapRequest }) => {
  const { userLibrary, getUserLibrary } = useUsers();
  const [selectedMyBook, setSelectedMyBook] = useState('');

  useEffect(() => {
    getUserLibrary();
  }, []);

  const availableBooks = userLibrary?.filter(b => b.available_for_exchange) || [];

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div
        className="bookish-glass rounded-2xl border border-white/20 p-6 w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-primary mb-4">Request Book Swap</h3>
        <p className="text-primary/70 mb-4">
          Select one of your books to offer in exchange for "{book.title}"
        </p>

        <select
          value={selectedMyBook}
          onChange={(e) => setSelectedMyBook(e.target.value)}
          className="w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 text-primary mb-4"
        >
          <option value="">Select your book</option>
          {availableBooks.map((myBook) => (
            <option key={myBook.book_id} value={myBook.book_id}>
              {myBook.title} by {myBook.author}
            </option>
          ))}
        </select>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-primary"
          >
            Cancel
          </button>
          <button
            onClick={() => onSwapRequest(selectedMyBook)}
            disabled={!selectedMyBook}
            className="flex-1 bookish-button-enhanced text-white py-2 rounded-lg disabled:opacity-50"
          >
            Send Request
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserLibraryViewer;
