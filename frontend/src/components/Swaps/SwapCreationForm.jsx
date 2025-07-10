import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLibrary } from '../../hooks/useLibrary';
import { useUsers } from '../../hooks/useUsers';
import { 
  BookOpenIcon, 
  UserIcon, 
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const SwapCreationForm = ({ onSubmit, onCancel, isLoading }) => {
  const { userLibrary, getUserLibrary } = useLibrary();
  const { searchUsers, getUserBooks } = useUsers();
  
  const [formData, setFormData] = useState({
    initiator_book_id: '',
    receiver_id: '',
    receiver_book_id: '',
    message: ''
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBooksForReceiver, setUserBooksForReceiver] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    getUserLibrary();
  }, [getUserLibrary]);

  useEffect(() => {
    const searchUsersDebounced = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchUsers({ query: searchQuery });
          setSearchResults(results?.results || []);
        } catch (error) {
          console.error('Error searching users:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchUsersDebounced);
  }, [searchQuery, searchUsers]);

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setFormData(prev => ({ ...prev, receiver_id: user.user_id }));
    setSearchQuery(user.username);
    setSearchResults([]);

    // Fetch the selected user's books
    try {
      const result = await getUserBooks(user.user_id);
      setUserBooksForReceiver(result?.results || []);
    } catch (error) {
      console.error('Error fetching user books:', error);
      setUserBooksForReceiver([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.initiator_book_id) {
      alert('Please select a book to offer');
      return;
    }

    if (!formData.receiver_id) {
      alert('Please select a user to swap with');
      return;
    }

    // Clean up the form data - convert empty strings to null for optional fields
    const cleanedData = {
      ...formData,
      receiver_book_id: formData.receiver_book_id || null,
      message: formData.message || null
    };

    onSubmit(cleanedData);
  };

  const availableBooks = userLibrary?.filter(book =>
    book.available_for_exchange && book.condition !== 'damaged'
  ) || [];

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4 sm:space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Your Book Selection */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          <BookOpenIcon className="w-4 h-4 inline mr-1" />
          Book You're Offering
        </label>
        <select
          value={formData.initiator_book_id}
          onChange={(e) => setFormData(prev => ({ ...prev, initiator_book_id: e.target.value }))}
          className="w-full px-3 py-2 sm:py-3 border border-[var(--secondary)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent text-sm sm:text-base"
          required
        >
          <option value="">Select a book from your library</option>
          {availableBooks.map((book) => (
            <option key={book.book_id} value={book.book_id}>
              {book.title} {book.author && `by ${book.author}`}
            </option>
          ))}
        </select>
        {availableBooks.length === 0 && (
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            No available books in your library. Add some books first!
          </p>
        )}
      </div>

      {/* User Search */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          <UserIcon className="w-4 h-4 inline mr-1" />
          Find Book Owner to Swap With
        </label>
        <div className="relative">
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] mobile-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username or book title..."
              className="w-full pl-10 pr-10 py-2 sm:py-3 border border-[var(--secondary)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent text-sm sm:text-base mobile-search-input"
            />
            {selectedUser && (
              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null);
                  setSearchQuery('');
                  setFormData(prev => ({ ...prev, receiver_id: '', receiver_book_id: '' }));
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mobile-search-clear"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-xs text-[var(--text-secondary)] mt-1">
            💡 Tip: You can swap with any user - no need to follow them first!
          </p>

          {/* Search Results - Improved UI */}
          {searchResults.length > 0 && (
            <div className="absolute z-20 w-full mt-2 bg-[var(--card-bg)] border border-[var(--secondary)] rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {searchResults.map((user, index) => (
                <button
                  key={user.user_id}
                  type="button"
                  onClick={() => handleUserSelect(user)}
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 text-left hover:bg-[var(--secondary)]/20 transition-colors border-b border-[var(--secondary)] last:border-b-0 focus:bg-[var(--secondary)]/20 focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--accent)] rounded-full flex items-center justify-center text-white text-sm sm:text-base font-medium flex-shrink-0">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--text-primary)] text-sm sm:text-base truncate">
                        {user.username}
                      </p>
                      {user.full_name && (
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] truncate">
                          {user.full_name}
                        </p>
                      )}
                      {user.books_count !== undefined && (
                        <p className="text-xs text-[var(--accent)] mt-1">
                          {user.books_count} books in library
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {isSearching && (
            <div className="absolute z-20 w-full mt-2 bg-[var(--card-bg)] border border-[var(--secondary)] rounded-lg shadow-xl p-3 sm:p-4 text-center">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-[var(--accent)] mx-auto"></div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2">Searching users...</p>
            </div>
          )}
        </div>
      </div>

      {/* Receiver's Book Selection (Optional) */}
      {selectedUser && userBooksForReceiver.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            <BookOpenIcon className="w-4 h-4 inline mr-1" />
            Book You Want (Optional)
          </label>
          <select
            value={formData.receiver_book_id}
            onChange={(e) => setFormData(prev => ({ ...prev, receiver_book_id: e.target.value }))}
            className="w-full px-3 py-2 sm:py-3 border border-[var(--secondary)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent text-sm sm:text-base"
          >
            <option value="">No specific book (one-way swap)</option>
            {userBooksForReceiver.map((book) => (
              <option key={book.book_id} value={book.book_id}>
                {book.title} {book.author && `by ${book.author}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Message (Optional)
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          placeholder="Add a personal message to your swap request..."
          rows={3}
          className="w-full px-3 py-2 sm:py-3 border border-[var(--secondary)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent resize-none text-sm sm:text-base mobile-form-textarea"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 mobile-swap-actions">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 sm:py-3 bg-[var(--secondary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--secondary)]/80 transition-colors text-sm sm:text-base font-medium mobile-swap-button"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !formData.initiator_book_id || !formData.receiver_id}
          className="flex-1 px-4 py-2 sm:py-3 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium mobile-swap-button"
        >
          {isLoading ? 'Proposing...' : 'Propose Swap'}
        </button>
      </div>
    </motion.form>
  );
};

export default SwapCreationForm;
