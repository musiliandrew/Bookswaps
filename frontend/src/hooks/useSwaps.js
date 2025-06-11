import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import { useNotifications } from './useNotifications';

export function useSwaps() {
  const [swaps, setSwaps] = useState([]);
  const [swapHistory, setSwapHistory] = useState([]);
  const [qrData, setQrData] = useState(null);
  const [midpoint, setMidpoint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    swaps: { next: null, previous: null, page: 1, totalPages: 1 },
    history: { next: null, previous: null, page: 1, totalPages: 1 },
  });

  const { notifications, isWebSocketConnected } = useNotifications();

  const initiateSwap = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/swaps/', data);
      setSwaps((prev) => [response.data, ...prev]);
      toast.success('Swap initiated!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to initiate swap';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSwaps = useCallback(async (filters = {}, page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page });
      if (filters.status) params.append('status', filters.status);
      const response = await api.get(`/swaps/list/?${params.toString()}`);
      setSwaps(response.data.results || []);
      setPagination((prev) => ({
        ...prev,
        swaps: {
          next: response.data.next,
          previous: response.data.previous,
          page,
          totalPages: Math.ceil(response.data.count / (response.data.results?.length || 1)),
        },
      }));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch swaps';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const acceptSwap = useCallback(async (swapId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/swaps/${swapId}/accept/`);
      setSwaps((prev) =>
        prev.map((s) => (s.id === swapId ? { ...s, status: 'Accepted' } : s))
      );
      toast.success('Swap accepted!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to accept swap';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const confirmSwap = useCallback(async (swapId, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/swaps/${swapId}/confirm/`, { qr_code_url: data.qr_code });
      setSwaps((prev) =>
        prev.map((s) => (s.id === swapId ? { ...s, status: response.data.status } : s))
      );
      toast.success('Swap confirmed!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to confirm swap';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelSwap = useCallback(async (swapId) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.patch(`/swaps/${swapId}/cancel/`);
      setSwaps((prev) =>
        prev.map((s) => (s.id === swapId ? { ...s, status: 'Cancelled' } : s))
      );
      toast.success('Swap cancelled!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to cancel swap';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSwapHistory = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/swaps/history/?page=${page}`);
      setSwapHistory(response.data.results || []);
      setPagination((prev) => ({
        ...prev,
        history: {
          next: response.data.next,
          previous: response.data.previous,
          page,
          totalPages: Math.ceil(response.data.count / (response.data.results?.length || 1)),
        },
      }));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch swap history';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addLocation = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/swaps/locations/add/', data);
      toast.success('Location added!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to add location';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMidpoint = useCallback(async (coords) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(coords);
      const response = await api.get(`/swaps/midpoint/?${params.toString()}`);
      setMidpoint(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch midpoint';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const shareContent = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/swaps/share/', data);
      toast.success('Content shared!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to share content';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSwapQR = useCallback(async (swapId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/swaps/${swapId}/qr/`);
      setQrData(response.data.qr_code_url || response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch QR code';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle notifications for swaps
  useEffect(() => {
    if (!isWebSocketConnected || !notifications?.length) return;

    notifications.forEach((notification) => {
      const { type, swap } = notification;
      if (type === 'swap_proposed' && swap?.swap_id) {
        setSwaps((prev) => [swap, ...prev.filter((s) => s.id !== swap.swap_id)]);
        toast.info(`New swap proposed: ${swap.initiator.username}`);
      } else if (['swap_accepted', 'swap_confirmed', 'swap_completed', 'swap_cancelled'].includes(type) && swap?.swap_id) {
        setSwaps((prev) =>
          prev.map((s) =>
            s.id === swap.swap_id ? { ...s, status: swap.status } : s
          )
        );
        getSwapHistory();
        toast.info(`Swap ${swap.swap_id} ${type.replace('swap_', '')}`);
      }
    });
  }, [notifications, isWebSocketConnected, getSwapHistory]);

  return {
    initiateSwap,
    getSwaps,
    acceptSwap,
    confirmSwap,
    cancelSwap,
    getSwapHistory,
    addLocation,
    getMidpoint,
    shareContent,
    getSwapQR,
    swaps,
    swapHistory,
    qrData,
    midpoint,
    isLoading,
    error,
    pagination,
    isWebSocketConnected,
  };
}
