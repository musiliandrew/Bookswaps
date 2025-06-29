import { useState, useEffect, useCallback, useRef } from 'react';
import { API_ENDPOINTS } from '../utils/constants';
import { handleApiCall } from '../utils/apiUtils';
import { api } from '../utils/api';

export const useUserStats = (userId = null) => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastUserIdRef = useRef(null);
  const lastFetchTimeRef = useRef(0);

  const fetchStats = useCallback(async (targetUserId = null) => {
    // Prevent excessive API calls - cache for 30 seconds
    const now = Date.now();
    const cacheKey = targetUserId || 'current_user';
    if (now - lastFetchTimeRef.current < 30000 && lastUserIdRef.current === cacheKey) {
      return;
    }

    setIsLoading(true);
    setError(null);
    lastUserIdRef.current = cacheKey;
    lastFetchTimeRef.current = now;

    try {
      const endpoint = targetUserId
        ? API_ENDPOINTS.GET_USER_STATS(targetUserId)
        : API_ENDPOINTS.GET_MY_STATS;

      const result = await handleApiCall(
        () => api.get(endpoint),
        setIsLoading,
        setError,
        null,
        'Fetch user statistics'
      );

      if (result) {
        setStats(result);
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
      setError(err.message || 'Failed to fetch user statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshStats = useCallback(() => {
    // Force refresh by resetting cache
    lastFetchTimeRef.current = 0;
    fetchStats(userId);
  }, [fetchStats, userId]);

  // Only fetch when userId actually changes, not on every render
  useEffect(() => {
    const currentUserId = userId || 'current_user';
    if (currentUserId !== lastUserIdRef.current) {
      fetchStats(userId);
    }
  }, [userId, fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refreshStats,
    fetchStats
  };
};

export default useUserStats;
