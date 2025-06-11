import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import { useWebSocket } from './useWebSocket';

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

  const { messages: wsNotifications, isConnected } = useWebSocket('notification');

  const getNotifications = useCallback(async (filters = {}, page = 1) => {
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
  }, []);

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

  useEffect(() => {
    if (!isConnected || !wsNotifications?.length) return;

    wsNotifications.forEach(({ type, message, follow_id }) => {
      if (type === 'notification' && follow_id) {
        setNotifications((prev) => {
          if (prev.some((n) => n.id === follow_id)) return prev;
          toast.info(`New notification: ${message}`);
          return [{ id: follow_id, message, is_read: false }, ...prev];
        });
      }
    });
  }, [wsNotifications, isConnected]);

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