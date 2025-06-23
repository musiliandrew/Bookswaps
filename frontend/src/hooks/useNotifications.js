import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  
  // Refs to track state and prevent unnecessary calls
  const lastFetchTime = useRef(0);
  const lastFilters = useRef({});
  const lastPage = useRef(1);
  const mountedRef = useRef(true);
  const isInitialLoad = useRef(true);
  
  // Minimum time between API calls (in milliseconds)
  const MIN_FETCH_INTERVAL = 5000; // 5 seconds

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const updatePagination = (data, page) => {
    if (!mountedRef.current) return;
    
    setPagination({
      next: data.next,
      previous: data.previous,
      page,
      totalPages: Math.ceil(data.count / (data.results?.length || 1)),
    });
  };

  const getNotifications = useCallback(async (filters = {}, page = 1, forceRefresh = false) => {
    if (!mountedRef.current || !isAuthenticated) {
      return null;
    }

    const now = Date.now();
    const filtersString = JSON.stringify(filters);
    const hasFiltersChanged = filtersString !== JSON.stringify(lastFilters.current);
    const hasPageChanged = page !== lastPage.current;
    const hasEnoughTimePassed = now - lastFetchTime.current > MIN_FETCH_INTERVAL;

    // Skip if not enough time has passed and no significant changes
    if (!forceRefresh && !hasFiltersChanged && !hasPageChanged && !hasEnoughTimePassed && !isInitialLoad.current) {
      console.log('Skipping notifications fetch - too soon since last call');
      return null;
    }

    const params = new URLSearchParams({ page: page.toString() });
    if (filters.is_read !== undefined) params.append('is_read', filters.is_read.toString());
    if (filters.type) params.append('type', filters.type);

    lastFetchTime.current = now;
    lastFilters.current = filters;
    lastPage.current = page;
    isInitialLoad.current = false;

    const result = await handleApiCallWithResult(
      () => api.get(`${API_ENDPOINTS.GET_NOTIFICATIONS}?${params.toString()}`),
      setIsLoading,
      setError,
      null,
      'Fetch notifications'
    );
    
    if (result && mountedRef.current) {
      setNotifications(result.results || []);
      updatePagination(result, page);
    }
    return result;
  }, [isAuthenticated]);

  // More aggressive debouncing to prevent excessive calls
  const debouncedGetNotifications = useMemo(
    () => debounce(getNotifications, 2000, { 
      leading: false, 
      trailing: true,
      maxWait: 5000 // Maximum wait time before forcing execution
    }),
    [getNotifications]
  );

  const markNotificationRead = useCallback(async (notificationId) => {
    if (!mountedRef.current) return null;

    const result = await handleApiCallWithResult(
      () => api.patch(API_ENDPOINTS.MARK_NOTIFICATION_READ(notificationId)),
      setIsLoading,
      setError,
      'Notification marked as read',
      'Mark notification read'
    );
    
    if (result && mountedRef.current) {
      setNotifications((prev) =>
        prev.map((n) => (n.notification_id === notificationId ? { ...n, is_read: true } : n))
      );
    }
    return result;
  }, []);

  // Load unread notifications when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    // Initial load with a small delay to prevent immediate multiple calls
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        debouncedGetNotifications({ is_read: false }, 1, true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, debouncedGetNotifications]);

  // Fallback polling only when WebSocket is not connected
  useEffect(() => {
    if (!isAuthenticated || isConnected) {
      return;
    }

    console.log('WebSocket not connected, setting up polling fallback');
    const interval = setInterval(() => {
      if (mountedRef.current && !isConnected) {
        debouncedGetNotifications({ is_read: false }, 1);
      }
    }, 30000); // Poll every 30 seconds instead of 60

    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated, isConnected, debouncedGetNotifications]);

  // Handle WebSocket messages
  useEffect(() => {
    if (!messages.length || !mountedRef.current) return;

    const newNotifications = messages
      .filter(msg => msg.notification_id) // Only process valid notifications
      .map((msg) => ({
        notification_id: msg.notification_id,
        type: msg.type,
        message: msg.message,
        content_type: msg.content_type,
        content_id: msg.content_id,
        is_read: false,
        created_at: new Date().toISOString(),
      }));

    if (newNotifications.length > 0) {
      setNotifications((prev) => {
        // Prevent duplicate notifications
        const existingIds = new Set(prev.map(n => n.notification_id));
        const uniqueNew = newNotifications.filter(n => !existingIds.has(n.notification_id));
        
        if (uniqueNew.length > 0) {
          toast.info(`${uniqueNew.length} new notification${uniqueNew.length > 1 ? 's' : ''} received!`);
          return [...uniqueNew, ...prev];
        }
        return prev;
      });
    }
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedGetNotifications.cancel();
    };
  }, [debouncedGetNotifications]);

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