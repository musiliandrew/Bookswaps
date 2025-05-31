import { useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';

export function useUsers() {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchUsers = async (data) => {
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    try {
      const params = new URLSearchParams();
      if (data.username) params.append('q', data.username);
      if (data.genres?.length) params.append('genres', data.genres.join(','));
      const response = await api.get(`/users/search/?${params.toString()}`);
      setSearchResults(response.data.results || response.data);
      toast.success(`Found ${response.data.results?.length || response.data.length} users!`);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to search users';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchUsers,
    searchResults,
    isLoading,
    error,
  };
}