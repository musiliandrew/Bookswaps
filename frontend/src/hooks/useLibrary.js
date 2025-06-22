import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import { handleApiCall, handleApiCallWithResult } from '../utils/apiUtils';
import { API_ENDPOINTS } from '../utils/constants';
import { useNotifications } from './useNotifications';

export function useLibrary() {
  const [book, setBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [userLibrary, setUserLibrary] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    books: { next: null, previous: null, page: 1, totalPages: 1 },
    search: { next: null, previous: null, page: 1, totalPages: 1 },
    library: { next: null, previous: null, page: 1, totalPages: 1 },
    bookmarks: { next: null, previous: null, page: 1, totalPages: 1 },
    favorites: { next: null, previous: null, page: 1, totalPages: 1 },
    history: { next: null, previous: null, page: 1, totalPages: 1 },
    recommended: { next: null, previous: null, page: 1, totalPages: 1 },
  });

  const { notifications, isWebSocketConnected } = useNotifications();

  const updatePagination = (data, key, page) => {
    setPagination((prev) => ({
      ...prev,
      [key]: {
        next: data.next,
        previous: data.previous,
        page,
        totalPages: Math.ceil(data.count / (data.results?.length || 1)),
      },
    }));
  };

  const getUserLibrary = useCallback(async (page = 1) => {
    const result = await handleApiCall(
      () => api.get(`${API_ENDPOINTS.USER_LIBRARY}?page=${page}`),
      setIsLoading,
      setError,
      null,
      'Fetch user library'
    );
    if (result) {
      setUserLibrary(result.results || []);
      updatePagination(result, 'library', page);
    }
    return result;
  }, []);

  const getBook = useCallback(async (bookId) => {
    const result = await handleApiCall(
      () => api.get(API_ENDPOINTS.GET_BOOK(bookId)),
      setIsLoading,
      setError,
      null,
      'Fetch book'
    );
    if (result) {
      const bookData = result.data || result;
      if (!bookData.id) {
        console.warn('Invalid book data received:', bookData);
      }
      setBook(bookData);
    }
    return result;
  }, []);

  const listBooks = useCallback(async (filters = {}, page = 1) => {
    const params = new URLSearchParams({ page });
    if (filters.genre?.length) params.append('genre', filters.genre.join(','));
    if (filters.author) params.append('author', filters.author);
    if (filters.title) params.append('title', filters.title);

    const result = await handleApiCall(
      () => api.get(`${API_ENDPOINTS.LIST_BOOKS}?${params.toString()}`),
      setIsLoading,
      setError,
      null,
      'Fetch books'
    );
    if (result) {
      setBooks(result.results || []);
      updatePagination(result, 'books', page);
    }
    return result;
  }, []);

  const searchBooks = useCallback(async (filters = {}, page = 1) => {
    const params = new URLSearchParams({ page });
    if (filters.query) params.append('q', filters.query);
    if (filters.genre?.length) params.append('genre', filters.genre.join(','));
    if (filters.author) params.append('author', filters.author);

    const result = await handleApiCall(
      () => api.get(`${API_ENDPOINTS.SEARCH_BOOKS}?${params.toString()}`),
      setIsLoading,
      setError,
      null,
      'Search books'
    );
    if (result) {
      setSearchResults(result.results || []);
      updatePagination(result, 'search', page);
    }
    return result;
  }, []);

  const addBook = useCallback(async (data) => {
    const result = await handleApiCall(
      () => api.post(API_ENDPOINTS.ADD_BOOK, data),
      setIsLoading,
      setError,
      'Book added!',
      'Add book'
    );
    if (result) {
      setBook(result.data || result);
      await getUserLibrary();
    }
    return result;
  }, [getUserLibrary]);

  const updateAvailability = useCallback(async (bookId, data) => {
    const result = await handleApiCall(
      () => api.patch(API_ENDPOINTS.UPDATE_AVAILABILITY(bookId), data),
      setIsLoading,
      setError,
      'Availability updated!',
      'Update availability'
    );
    if (result) {
      setBook((prev) => (prev?.id === bookId ? { ...prev, ...result } : prev));
      setUserLibrary((prev) =>
        prev.map((b) => (b.id === bookId ? { ...b, ...result } : b))
      );
    }
    return result;
  }, []);

  const removeBook = useCallback(async (bookId) => {
    const result = await handleApiCallWithResult(
      () => api.delete(API_ENDPOINTS.REMOVE_BOOK(bookId)),
      setIsLoading,
      setError,
      'Book removed!',
      'Remove book'
    );
    if (result) {
      setUserLibrary((prev) => prev.filter((b) => b.id !== bookId));
      if (book?.id === bookId) setBook(null);
    }
    return result;
  }, [book]);

  const bookmarkBook = useCallback(async (bookId) => {
    const result = await handleApiCall(
      () => api.post(API_ENDPOINTS.BOOKMARK_BOOK(bookId)),
      setIsLoading,
      setError,
      'Book bookmarked!',
      'Bookmark book'
    );
    if (result) {
      setBook((prev) => (prev?.id === bookId ? { ...prev, is_bookmarked: true } : prev));
      setBookmarks((prev) => [...prev, result]);
    }
    return result;
  }, []);

  const removeBookmark = useCallback(async (bookId) => {
    const result = await handleApiCallWithResult(
      () => api.delete(API_ENDPOINTS.REMOVE_BOOKMARK(bookId)),
      setIsLoading,
      setError,
      'Bookmark removed!',
      'Remove bookmark'
    );
    if (result) {
      setBook((prev) => (prev?.id === bookId ? { ...prev, is_bookmarked: false } : prev));
      setBookmarks((prev) => prev.filter((b) => b.id !== bookId));
    }
    return result;
  }, []);

  const favoriteBook = useCallback(async (bookId) => {
    const result = await handleApiCall(
      () => api.post(API_ENDPOINTS.FAVORITE_BOOK(bookId)),
      setIsLoading,
      setError,
      'Book favorited!',
      'Favorite book'
    );
    if (result) {
      setBook((prev) => (prev?.id === bookId ? { ...prev, is_favorited: true } : prev));
      setFavorites((prev) => [...prev, result]);
    }
    return result;
  }, []);

  const unfavoriteBook = useCallback(async (bookId) => {
    const result = await handleApiCallWithResult(
      () => api.delete(API_ENDPOINTS.UNFAVORITE_BOOK(bookId)),
      setIsLoading,
      setError,
      'Book unfavorited!',
      'Unfavorite book'
    );
    if (result) {
      setBook((prev) => (prev?.id === bookId ? { ...prev, is_favorited: false } : prev));
      setFavorites((prev) => prev.filter((b) => b.id !== bookId));
    }
    return result;
  }, []);

  const getBookmarks = useCallback(async (page = 1) => {
    const result = await handleApiCall(
      () => api.get(`${API_ENDPOINTS.GET_BOOKMARKS}?page=${page}`),
      setIsLoading,
      setError,
      null,
      'Fetch bookmarks'
    );
    if (result) {
      setBookmarks(result.results || []);
      updatePagination(result, 'bookmarks', page);
    }
    return result;
  }, []);

  const getFavorites = useCallback(async (page = 1) => {
    const result = await handleApiCall(
      () => api.get(`${API_ENDPOINTS.GET_FAVORITES}?page=${page}`),
      setIsLoading,
      setError,
      null,
      'Fetch favorites'
    );
    if (result) {
      setFavorites(result.results || []);
      updatePagination(result, 'favorites', page);
    }
    return result;
  }, []);

  const getBookHistory = useCallback(async (filters = {}, page = 1) => {
    const params = new URLSearchParams({ page });
    if (filters.book_id) params.append('book_id', filters.book_id);

    const result = await handleApiCall(
      () => api.get(`${API_ENDPOINTS.GET_BOOK_HISTORY}?${params.toString()}`),
      setIsLoading,
      setError,
      null,
      'Fetch history'
    );
    if (result) {
      setHistory(result.results || []);
      updatePagination(result, 'history', page);
    }
    return result;
  }, []);

  const listRecommendedBooks = useCallback(async (filters = {}, page = 1) => {
    const params = new URLSearchParams({ page });
    if (filters.search) params.append('search', filters.search);
    if (filters.genre?.length) params.append('genre', filters.genre.join(','));

    const result = await handleApiCall(
      () => api.get(`${API_ENDPOINTS.LIST_RECOMMENDED_BOOKS}?${params.toString()}`),
      setIsLoading,
      setError,
      null,
      'Fetch recommended books'
    );
    if (result) {
      setRecommendedBooks(result.results || []);
      updatePagination(result, 'recommended', page);
    }
    return result;
  }, []);

  useEffect(() => {
    if (!isWebSocketConnected || !notifications?.length) return;

    notifications.forEach((notification) => {
      const { type, book } = notification;
      if (type === 'book_available' && book?.book_id) {
        setBook((prev) =>
          prev?.id === book.book_id
            ? {
                ...prev,
                available_for_exchange: book.available_for_exchange,
                available_for_borrow: book.available_for_borrow,
              }
            : prev
        );
        setUserLibrary((prev) =>
          prev.map((b) =>
            b.id === book.book_id
              ? {
                  ...b,
                  available_for_exchange: book.available_for_exchange,
                  available_for_borrow: book.available_for_borrow,
                }
              : b
          )
        );
        toast.info(`Book available: ${book.title}`);
      } else if (type === 'book_added' || type === 'book_removed') {
        getUserLibrary();
        toast.info(`Library updated: ${type === 'book_added' ? 'Book added' : 'Book removed'}`);
      }
    });
  }, [notifications, isWebSocketConnected, getUserLibrary]);

  return {
    getBook,
    listBooks,
    searchBooks,
    addBook,
    getUserLibrary,
    updateAvailability,
    removeBook,
    bookmarkBook,
    removeBookmark,
    favoriteBook,
    unfavoriteBook,
    getBookmarks,
    getFavorites,
    getBookHistory,
    listRecommendedBooks,
    book,
    books,
    searchResults,
    userLibrary,
    bookmarks,
    favorites,
    history,
    recommendedBooks,
    isLoading,
    error,
    pagination,
    isWebSocketConnected,
  };
}