import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import { useWebSocket } from './useWebSocket';
import debounce from 'lodash/debounce';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    page: 1,
    totalPages: 1,
  });
  const { isConnected } = useWebSocket('notification');

  // Use useRef to store the debounced function
  const debouncedGetNotificationsRef = useRef(
    debounce(
      async (filters = {}, page = 1, { setIsLoading, setError, setNotifications, setPagination }) => {
        console.log('Fetching notifications:', filters, page);
        setIsLoading(true);
        setError(null);
        try {
          const params = new URLSearchParams({ page });
          if (filters.is_read !== undefined) params.append('is_read', filters.is_read);
          if (filters.type) params.append('type', filters.type);
          const response = await api.get(`/swaps/notifications/?${params.toString()}`);
          setNotifications(response.data.results || []);
          setPagination({
            next: response.data.next,
            previous: response.data.previous,
            page,
            totalPages: Math.ceil(response.data.count / (response.data.results?.length || 1)),
          });
          return response.data;
        } catch (err) {
          const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch notifications';
          setError(errorMessage);
          toast.error(errorMessage);
          return null;
        } finally {
          setIsLoading(false);
        }
      },
      1000, // Increase debounce to 1000ms
      { leading: false, trailing: true }
    )
  );

  // Memoized getNotifications function
  const getNotifications = useCallback(
    (filters = {}, page = 1) => {
      return debouncedGetNotificationsRef.current(filters, page, {
        setIsLoading,
        setError,
        setNotifications,
        setPagination,
      });
    },
    []
  );

  const markNotificationRead = useCallback(async (notificationId) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.patch(`/swaps/notifications/${notificationId}/read/`);
      toast.success('Notification marked as read');
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to mark notification read';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Memoized WebSocket notification handler
  // (Removed unused handleWsNotifications)

  useEffect(() => {
    const debouncedFn = debouncedGetNotificationsRef.current;
    
    if (isConnected) {
      console.log('WebSocket connected, skipping polling');
      getNotifications({ is_read: false }); // Initial fetch
      return;
    }

    getNotifications({ is_read: false }); // Initial fetch
    const interval = setInterval(() => {
      console.log('Polling notifications');
      getNotifications({ is_read: false });
    }, 60000); // Increase to 60 seconds

    return () => {
      clearInterval(interval);
      if (debouncedFn) {
        debouncedFn.cancel();
      }
    };
  }, [getNotifications, isConnected]);

  // Clean up debounced function on unmount
  useEffect(() => {
    // Capture the ref value at the beginning of the effect
    const debouncedFn = debouncedGetNotificationsRef.current;
    
    return () => {
      if (debouncedFn) {
        debouncedFn.cancel();
      }
    };
  }, []);

  return {
    getNotifications,
    markNotificationRead,
    notifications,
    isLoading,
    error,
    pagination,
    isWebSocketConnected: isConnected,
  };
}