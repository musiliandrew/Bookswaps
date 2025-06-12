import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
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

  // Define getUserLibrary first since other functions depend on it
  const getUserLibrary = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/library/library/?page=${page}`);
      setUserLibrary(response.data.results || []);
      setPagination((prev) => ({
        ...prev,
        library: {
          next: response.data.next,
          previous: response.data.previous,
          page,
          totalPages: Math.ceil(response.data.count / (response.data.results?.length || 1)),
        },
      }));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch user library';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBook = useCallback(async (bookId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/library/books/${bookId}/`);
      setBook(response.data.data || response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch book';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const listBooks = useCallback(async (filters = {}, page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page });
      if (filters.genre?.length) params.append('genre', filters.genre.join(','));
      if (filters.author) params.append('author', filters.author);
      if (filters.title) params.append('title', filters.query);
      const response = await api.get(`/library/books/?${params.toString()}`);
      setBooks(response.data.results || []);
      setPagination((prev) => ({
        ...prev,
        books: {
          next: response.data.next,
          prev: response.data.previous,
          page,
          totalPages: Math.ceil(response.data.count / (response.data.results?.length || 1)),
        },
      }));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch books';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchBooks = useCallback(async (filters = {}, page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page });
      if (filters.query) params.append('q', filters.query);
      if (filters.genre?.length) params.append('genre', filters.genre.join(','));
      if (filters.author) params.append('author', filters.author);
      const response = await api.get(`/library/books/search/?${params.toString()}`);
      setSearchResults(response.data.results || []);
      setPagination((prev) => ({
        ...prev,
        search: {
          next: response.data.results,
          previous: response.data.previous,
          page,
          totalPages: Math.ceil(response.data.count / (response.data.results?.length || 1)),
        },
      }));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.data || err.response?.data?.detail || 'Failed to search books';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addBook = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/library/books/add/', data);
      setBook(response.data.data || response.data);
      toast.success('Book added!');
      getUserLibrary();
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to add book';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getUserLibrary]);

  const updateAvailability = useCallback(async (bookId, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/library/books/${bookId}/availability/`, data);
      setBook((prev) => (prev?.id === bookId ? { ...prev, ...response.data } : prev));
      setUserLibrary((prev) =>
        prev.map((b) => (b.id === bookId ? { ...b, ...response.data } : b))
      );
      toast.success('Availability updated!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to update availability';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeBook = useCallback(async (bookId) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/library/books/${bookId}/remove/`);
      setUserLibrary((prev) => prev.filter((b) => b.id !== bookId));
      if (book?.id === bookId) setBook(null);
      toast.success('Book removed!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to remove book';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [book]);

  const bookmarkBook = useCallback(async (bookId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/library/books/${bookId}/bookmark/`);
      setBook((prev) => (prev?.id === bookId ? { ...prev, is_bookmarked: true } : prev));
      setBookmarks((prev) => [...prev, response.data]);
      toast.success('Book bookmarked!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to bookmark book';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeBookmark = useCallback(async (bookId) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/library/books/${bookId}/bookmark/remove/`);
      setBook((prev) => (prev?.id === bookId ? { ...prev, is_bookmarked: false } : prev));
      setBookmarks((prev) => prev.filter((b) => b.id !== bookId));
      toast.success('Bookmark removed!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to remove bookmark';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const favoriteBook = useCallback(async (bookId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/library/books/${bookId}/favorite/`);
      setBook((prev) => (prev?.id === bookId ? { ...prev, is_favorited: true } : prev));
      setFavorites((prev) => [...prev, response.data]);
      toast.success('Book favorited!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to favorite book';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unfavoriteBook = useCallback(async (bookId) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/library/books/${bookId}/favorite/remove/`);
      setBook((prev) => (prev?.id === bookId ? { ...prev, is_favorited: false } : prev));
      setFavorites((prev) => prev.filter((b) => b.id !== bookId));
      toast.success('Book unfavorited!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to unfavorite book';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBookmarks = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/library/bookmarks/?page=${page}`);
      setBookmarks(response.data.results || []);
      setPagination((prev) => ({
        ...prev,
        bookmarks: {
          next: response.data.next,
          previous: response.data.previous,
          page,
          totalPages: Math.ceil(response.data.count / (response.data.results?.length || 1)),
        },
      }));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch bookmarks';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFavorites = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/library/favorites/?page=${page}`);
      setFavorites(response.data.results || []);
      setPagination((prev) => ({
        ...prev,
        favorites: {
          next: response.data.next,
          previous: response.data.previous,
          page,
          totalPages: Math.ceil(response.data.count / (response.data.results?.length || 1)),
        },
      }));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch favorites';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBookHistory = useCallback(async (filters = {}, page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page });
      if (filters.book_id) params.append('book_id', filters.book_id);
      const response = await api.get(`/library/history/?${params.toString()}`);
      setHistory(response.data.results || []);
      setPagination((prev) => ({
        ...prev,
        history: {
          next: response.data.next,
          previous: response.data.previous,
          page,
          totalPages: Math.ceil(response.data.count / (response.data.results?.length || 1)),
        },
      }));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch history';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const listRecommendedBooks = useCallback(async (filters = {}, page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page });
      if (filters.search) params.append('search', filters.search);
      if (filters.genre?.length) params.append('genre', filters.genre.join(','));
      const response = await api.get(`/library/recommended/?${params.toString()}`);
      setRecommendedBooks(response.data.results || []);
      setPagination((prev) => ({
        ...prev,
        recommended: {
          next: response.data.next,
          previous: response.data.previous,
          page,
          totalPages: Math.ceil(response.data.count / (response.data.results?.length || 1)),
        },
      }));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch recommended books';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle notifications for library updates
  useEffect(() => {
    if (!isWebSocketConnected || !notifications?.length) return;

    notifications.forEach((notification) => {
      const { type, book } = notification;
      if (type === 'book_available' && book?.book_id) {
        setBook((prev) =>
          prev?.id === book.book_id ? { ...prev, available_for_exchange: book.available_for_exchange, available_for_borrow: book.available_for_borrow } : prev
        );
        setUserLibrary((prev) =>
          prev.map((b) =>
            b.id === book.book_id ? { ...b, available_for_exchange: book.available_for_exchange, available_for_borrow: book.available_for_borrow } : b
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