import { useState, useEffect, useCallback } from 'react';
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
  const [isFetching, setIsFetching] = useState(false);

  const { messages: wsNotifications, isConnected } = useWebSocket('notification');

  const getNotifications = useCallback(async (filters = {}, page = 1) => {
    if (isFetching) {
      console.log('getNotifications: Already fetching, skipping');
      return null;
    }
    setIsFetching(true);
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page });
      if (filters.is_read !== undefined) params.append('is_read', filters.is_read);
      if (filters.type) params.append('type', filters.type);
      console.log('Fetching notifications:', params.toString());
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
      setIsFetching(false);
    }
  }, [isFetching]);

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

  const handleWsNotifications = debounce((notifications) => {
    notifications.forEach(({ type, message, follow_id }) => {
      if (type === 'notification' && follow_id) {
        setNotifications((prev) => {
          if (prev.some((n) => n.id === follow_id)) return prev;
          toast.info(`New notification: ${message}`);
          return [{ id: follow_id, message, is_read: false }, ...prev];
        });
      }
    });
  }, 1000);

  useEffect(() => {
    if (!isConnected || !wsNotifications?.length) return;
    console.log('Processing WebSocket notifications:', wsNotifications.length);
    handleWsNotifications(wsNotifications);
  }, [wsNotifications, isConnected, handleWsNotifications]);

  // Explicit polling
  useEffect(() => {
    getNotifications({ is_read: false }); // Initial fetch
    const interval = setInterval(() => {
      console.log('Polling notifications');
      getNotifications({ is_read: false });
    }, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [getNotifications]);

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