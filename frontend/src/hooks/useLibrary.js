import { useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';

export function useLibrary() {
  const [book, setBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [userLibrary, setUserLibrary] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ next: null, previous: null });

  const getBook = async (bookId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/library/books/${bookId}/`);
      setBook(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch book';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const listBooks = async (filters = {}, pageUrl = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = pageUrl || `/library/books/?${new URLSearchParams(filters).toString()}`;
      const response = await api.get(url);
      setBooks(response.data.results || response.data);
      setPagination({ next: response.data.next, previous: response.data.previous });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch books';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const searchBooks = async (query) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/library/books/search/?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data.results || response.data);
      toast.success(`Found ${response.data.results?.length || response.data.length} books!`);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to search books';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const addBook = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/library/books/add/', data);
      setBook(response.data);
      toast.success('Book added to library!');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to add book';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserLibrary = async (pageUrl = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = pageUrl || '/library/library/';
      const response = await api.get(url);
      setUserLibrary(response.data.results || response.data);
      setPagination({ next: response.data.next, previous: response.data.previous });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch user library';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAvailability = async (bookId, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/library/books/${bookId}/availability/`, data);
      setBook((prev) => ({ ...prev, ...response.data }));
      toast.success('Book availability updated!');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to update availability';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const removeBook = async (bookId) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/library/books/${bookId}/remove/`);
      setBook(null);
      toast.success('Book removed from library!');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to remove book';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const bookmarkBook = async (bookId, bookmark) => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = bookmark ? `/library/books/${bookId}/bookmark/` : `/library/books/${bookId}/bookmark/remove/`;
      await api.post(endpoint);
      setBook((prev) => ({ ...prev, is_bookmarked: bookmark }));
      toast.success(bookmark ? 'Book bookmarked!' : 'Bookmark removed!');
      getBookmarks(); // Refresh bookmarks
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to bookmark book';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const favoriteBook = async (bookId, favorite) => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = favorite ? `/library/books/${bookId}/favorite/` : `/library/books/${bookId}/favorite/remove/`;
      await api.post(endpoint);
      setBook((prev) => ({ ...prev, is_favorited: favorite }));
      toast.success(favorite ? 'Book favorited!' : 'Favorite removed!');
      getFavorites(); // Refresh favorites
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to favorite book';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getBookmarks = async (pageUrl = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = pageUrl || '/library/bookmarks/';
      const response = await api.get(url);
      setBookmarks(response.data.results || response.data);
      setPagination({ next: response.data.next, previous: response.data.previous });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch bookmarks';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getFavorites = async (pageUrl = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = pageUrl || '/library/favorites/';
      const response = await api.get(url);
      setFavorites(response.data.results || response.data);
      setPagination({ next: response.data.next, previous: response.data.previous });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch favorites';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getBookHistory = async (bookId = null, pageUrl = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = pageUrl || (bookId ? `/library/history/?book_id=${bookId}` : '/library/history/');
      const response = await api.get(url);
      setHistory(response.data.results || response.data);
      setPagination({ next: response.data.next, previous: response.data.previous });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch book history';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getBook,
    listBooks,
    searchBooks,
    addBook,
    getUserLibrary,
    updateAvailability,
    removeBook,
    bookmarkBook,
    favoriteBook,
    getBookmarks,
    getFavorites,
    getBookHistory,
    book,
    books,
    searchResults,
    userLibrary,
    bookmarks,
    favorites,
    history,
    isLoading,
    error,
    pagination,
  };
}