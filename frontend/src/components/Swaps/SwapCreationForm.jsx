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
  const { userBooks, getUserBooks } = useLibrary();
  const { searchUsers } = useUsers();
  
  const [formData, setFormData] = useState({
    initiator_book_id: '',
    receiver_user_id: '',
    receiver_book_id: '',
    message: ''
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBooksForReceiver, setUserBooksForReceiver] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    getUserBooks();
  }, [getUserBooks]);

  useEffect(() => {
    const searchUsersDebounced = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchUsers(searchQuery);
          setSearchResults(results || []);
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
    setFormData(prev => ({ ...prev, receiver_user_id: user.user_id }));
    setSearchQuery(user.username);
    setSearchResults([]);
    
    // Fetch the selected user's books
    try {
      // This would need to be implemented in the backend
      // const books = await getUserBooks(user.user_id);
      // setUserBooksForReceiver(books || []);
    } catch (error) {
      console.error('Error fetching user books:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.initiator_book_id) {
      alert('Please select a book to offer');
      return;
    }
    
    if (!formData.receiver_user_id) {
      alert('Please select a user to swap with');
      return;
    }

    onSubmit(formData);
  };

  const availableBooks = userBooks.filter(book => book.availability === 'Available');

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
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
          className="w-full px-3 py-2 border border-[var(--secondary)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
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
          User to Swap With
        </label>
        <div className="relative">
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for users by username..."
              className="w-full pl-10 pr-10 py-2 border border-[var(--secondary)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            />
            {selectedUser && (
              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null);
                  setSearchQuery('');
                  setFormData(prev => ({ ...prev, receiver_user_id: '', receiver_book_id: '' }));
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-[var(--card-bg)] border border-[var(--secondary)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((user) => (
                <button
                  key={user.user_id}
                  type="button"
                  onClick={() => handleUserSelect(user)}
                  className="w-full px-4 py-3 text-left hover:bg-[var(--secondary)]/20 transition-colors border-b border-[var(--secondary)] last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[var(--accent)] rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{user.username}</p>
                      {user.full_name && (
                        <p className="text-sm text-[var(--text-secondary)]">{user.full_name}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {isSearching && (
            <div className="absolute z-10 w-full mt-1 bg-[var(--card-bg)] border border-[var(--secondary)] rounded-lg shadow-lg p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--accent)] mx-auto"></div>
              <p className="text-sm text-[var(--text-secondary)] mt-2">Searching users...</p>
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
            className="w-full px-3 py-2 border border-[var(--secondary)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
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
          className="w-full px-3 py-2 border border-[var(--secondary)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-[var(--secondary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--secondary)]/80 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !formData.initiator_book_id || !formData.receiver_user_id}
          className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Proposing...' : 'Propose Swap'}
        </button>
      </div>
    </motion.form>
  );
};

export default SwapCreationForm;
