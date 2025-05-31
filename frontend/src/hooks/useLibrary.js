import { useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';

export function useLibrary() {
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const favoriteBook = async (bookId, favorite) => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = favorite ? `/library/books/${bookId}/favorite/` : `/library/books/${bookId}/favorite/remove/`;
      await api.post(endpoint);
      setBook((prev) => ({ ...prev, is_favorited: favorite }));
      toast.success(favorite ? 'Book favorited!' : 'Favorite removed!');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to favorite book';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { getBook, favoriteBook, book, isLoading, error };
}