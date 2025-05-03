import { useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';

export function useAuth() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/login/', credentials);
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      toast.success('Welcome back!');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Invalid credentials';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { login, error, isLoading };
}