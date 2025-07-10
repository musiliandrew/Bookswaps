import { useState, useCallback } from 'react';
import { handleApiCall } from '../utils/apiUtils';
import { api } from '../utils/api';
import { API_ENDPOINTS } from '../utils/constants';

export const useBooks = () => {
  const [books, setBooks] = useState([]);
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  // Search books for the smart reference system
  const searchBooks = useCallback(async (query, limit = 10) => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      setIsLoading(true);
      const response = await api.get(API_ENDPOINTS.SEARCH_BOOKS, {
        params: {
          q: query.trim(),
          limit: limit
        }
      });
      
      return response.data?.results || response.data || [];
    } catch (error) {
      console.error('Error searching books:', error);
      setError(error.message || 'Failed to search books');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get a specific book by ID
  const getBook = useCallback(async (bookId) => {
    if (!bookId) return null;

    try {
      setIsLoading(true);
      const response = await api.get(API_ENDPOINTS.GET_BOOK(bookId));
      const bookData = response.data;
      setBook(bookData);
      return bookData;
    } catch (error) {
      console.error('Error fetching book:', error);
      setError(error.message || 'Failed to fetch book');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // List books with pagination
  const listBooks = useCallback(async (page = 1, filters = {}) => {
    const result = await handleApiCall(
      () => api.get(API_ENDPOINTS.LIST_BOOKS, {
        params: {
          page,
          ...filters
        }
      }),
      setIsLoading,
      setError,
      null,
      'List books'
    );

    if (result) {
      setBooks(result.results || result);
      setPagination({
        count: result.count,
        next: result.next,
        previous: result.previous,
        current_page: page
      });
    }

    return result;
  }, []);

  // Add a new book
  const addBook = useCallback(async (bookData) => {
    const result = await handleApiCall(
      () => api.post(API_ENDPOINTS.ADD_BOOK, bookData),
      setIsLoading,
      setError,
      'Book added successfully!',
      'Add book'
    );

    if (result) {
      // Refresh the books list
      await listBooks();
    }

    return result;
  }, [listBooks]);

  // Update book availability
  const updateBookAvailability = useCallback(async (bookId, availabilityData) => {
    const result = await handleApiCall(
      () => api.patch(API_ENDPOINTS.UPDATE_AVAILABILITY(bookId), availabilityData),
      setIsLoading,
      setError,
      'Availability updated!',
      'Update availability'
    );

    if (result) {
      // Update the book in the current list
      setBooks(prev => prev.map(book => 
        book.book_id === bookId ? { ...book, ...result } : book
      ));
      
      // Update the single book if it's the current one
      if (book?.book_id === bookId) {
        setBook(prev => ({ ...prev, ...result }));
      }
    }

    return result;
  }, [book]);

  // Remove book from library
  const removeBook = useCallback(async (bookId) => {
    const result = await handleApiCall(
      () => api.delete(API_ENDPOINTS.REMOVE_BOOK(bookId)),
      setIsLoading,
      setError,
      'Book removed from library!',
      'Remove book'
    );

    if (result) {
      // Remove from the books list
      setBooks(prev => prev.filter(book => book.book_id !== bookId));
      
      // Clear the single book if it's the removed one
      if (book?.book_id === bookId) {
        setBook(null);
      }
    }

    return result;
  }, [book]);

  // Bookmark a book
  const bookmarkBook = useCallback(async (bookId) => {
    const result = await handleApiCall(
      () => api.post(API_ENDPOINTS.BOOKMARK_BOOK(bookId)),
      setIsLoading,
      setError,
      'Book bookmarked!',
      'Bookmark book'
    );

    return result;
  }, []);

  // Remove bookmark
  const removeBookmark = useCallback(async (bookId) => {
    const result = await handleApiCall(
      () => api.delete(API_ENDPOINTS.REMOVE_BOOKMARK(bookId)),
      setIsLoading,
      setError,
      'Bookmark removed!',
      'Remove bookmark'
    );

    return result;
  }, []);

  // Favorite a book
  const favoriteBook = useCallback(async (bookId) => {
    const result = await handleApiCall(
      () => api.post(API_ENDPOINTS.FAVORITE_BOOK(bookId)),
      setIsLoading,
      setError,
      'Book added to favorites!',
      'Favorite book'
    );

    return result;
  }, []);

  // Remove from favorites
  const unfavoriteBook = useCallback(async (bookId) => {
    const result = await handleApiCall(
      () => api.delete(API_ENDPOINTS.UNFAVORITE_BOOK(bookId)),
      setIsLoading,
      setError,
      'Book removed from favorites!',
      'Unfavorite book'
    );

    return result;
  }, []);

  // Get user's bookmarks
  const getBookmarks = useCallback(async () => {
    const result = await handleApiCall(
      () => api.get(API_ENDPOINTS.GET_BOOKMARKS),
      setIsLoading,
      setError,
      null,
      'Get bookmarks'
    );

    return result;
  }, []);

  // Get user's favorites
  const getFavorites = useCallback(async () => {
    const result = await handleApiCall(
      () => api.get(API_ENDPOINTS.GET_FAVORITES),
      setIsLoading,
      setError,
      null,
      'Get favorites'
    );

    return result;
  }, []);

  // Get user's library
  const getUserLibrary = useCallback(async (page = 1, filters = {}) => {
    const result = await handleApiCall(
      () => api.get(API_ENDPOINTS.USER_LIBRARY, {
        params: {
          page,
          ...filters
        }
      }),
      setIsLoading,
      setError,
      null,
      'Get user library'
    );

    if (result) {
      setBooks(result.results || result);
      setPagination({
        count: result.count,
        next: result.next,
        previous: result.previous,
        current_page: page
      });
    }

    return result;
  }, []);

  return {
    // State
    books,
    book,
    isLoading,
    error,
    pagination,

    // Actions
    searchBooks,
    getBook,
    listBooks,
    addBook,
    updateBookAvailability,
    removeBook,
    bookmarkBook,
    removeBookmark,
    favoriteBook,
    unfavoriteBook,
    getBookmarks,
    getFavorites,
    getUserLibrary,

    // Utilities
    setBooks,
    setBook,
    setError
  };
};
