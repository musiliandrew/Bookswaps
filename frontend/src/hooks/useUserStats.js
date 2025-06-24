import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../utils/constants';
import { handleApiCall } from '../utils/apiUtils';
import { api } from '../utils/api';

export const useUserStats = (userId = null) => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async (targetUserId = null) => {
    setIsLoading(true);
    setError(null);
    
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
    fetchStats(userId);
  }, [fetchStats, userId]);

  useEffect(() => {
    fetchStats(userId);
  }, [fetchStats, userId]);

  return {
    stats,
    isLoading,
    error,
    refreshStats,
    fetchStats
  };
};

export default useUserStats;
