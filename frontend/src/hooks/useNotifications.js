import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import { handleApiCallWithResult } from '../utils/apiUtils';
import { API_ENDPOINTS } from '../utils/constants';
import { useWebSocket } from './useWebSocket';
import { useAuth } from './useAuth';
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
  const { isAuthenticated, profile } = useAuth();
  const { isConnected, messages } = useWebSocket(profile?.user_id, 'notification');

  const updatePagination = (data, page) => {
    setPagination({
      next: data.next,
      previous: data.previous,
      page,
      totalPages: Math.ceil(data.count / (data.results?.length || 1)),
    });
  };

  const getNotifications = useCallback(async (filters = {}, page = 1) => {
    const params = new URLSearchParams({ page });
    if (filters.is_read !== undefined) params.append('is_read', filters.is_read);
    if (filters.type) params.append('type', filters.type);

    const result = await handleApiCallWithResult(
      () => api.get(`${API_ENDPOINTS.GET_NOTIFICATIONS}?${params.toString()}`),
      setIsLoading,
      setError,
      null,
      'Fetch notifications'
    );
    if (result) {
      setNotifications(result.results || []);
      updatePagination(result, page);
    }
    return result;
  }, []);

  const debouncedGetNotifications = useMemo(
    () => debounce(getNotifications, 1000, { leading: false, trailing: true }),
    [getNotifications]
  );

  const markNotificationRead = useCallback(async (notificationId) => {
    const result = await handleApiCallWithResult(
      () => api.patch(API_ENDPOINTS.MARK_NOTIFICATION_READ(notificationId)),
      setIsLoading,
      setError,
      'Notification marked as read',
      'Mark notification read'
    );
    if (result) {
      setNotifications((prev) =>
        prev.map((n) => (n.notification_id === notificationId ? { ...n, is_read: true } : n))
      );
    }
    return result;
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    debouncedGetNotifications({ is_read: false });

    let interval;
    if (!isConnected) {
      interval = setInterval(() => {
        debouncedGetNotifications({ is_read: false });
      }, 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
      debouncedGetNotifications.cancel();
    };
  }, [isAuthenticated, isConnected, debouncedGetNotifications]);

  useEffect(() => {
    if (!messages.length) return;

    const newNotifications = messages.map((msg) => ({
      notification_id: msg.notification_id,
      type: msg.type,
      message: msg.message,
      content_type: msg.content_type,
      content_id: msg.content_id,
      is_read: false,
      created_at: new Date().toISOString(),
    }));
    setNotifications((prev) => [...newNotifications, ...prev]);
    toast.info('New notification received!');
  }, [messages]);

  return {
    getNotifications: debouncedGetNotifications,
    markNotificationRead,
    notifications,
    isLoading,
    error,
    pagination,
    isWebSocketConnected: isConnected,
  };
}