import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import { handleApiCall, handleApiCallWithResult } from '../utils/apiUtils';
import { API_ENDPOINTS } from '../utils/constants';
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

  const updatePagination = (data, key, page) => {
    setPagination((prev) => ({
      ...prev,
      [key]: {
        next: data.next,
        previous: data.previous,
        page,
        totalPages: Math.ceil(data.count / (data.results?.length || 1)),
      },
    }));
  };

  const initiateSwap = useCallback(async (data) => {
    const result = await handleApiCall(
      () => api.post(API_ENDPOINTS.INITIATE_SWAP, data),
      setIsLoading,
      setError,
      'Swap initiated!',
      'Initiate swap'
    );
    if (result) {
      setSwaps((prev) => [result, ...prev]);
    }
    return result;
  }, []);

  const getSwaps = useCallback(async (filters = {}, page = 1) => {
    const params = new URLSearchParams({ page });
    if (filters.status) params.append('status', filters.status);

    const result = await handleApiCall(
      () => api.get(`${API_ENDPOINTS.LIST_SWAPS}?${params.toString()}`),
      setIsLoading,
      setError,
      null,
      'Fetch swaps'
    );
    if (result) {
      setSwaps(result.results || []);
      updatePagination(result, 'swaps', page);
    }
    return result;
  }, []);

  const acceptSwap = useCallback(async (swapId, acceptData = {}) => {
    // Backend requires status field and optionally meetup details
    const data = {
      status: 'Accepted',
      ...acceptData  // Allow optional meetup_location_id and meetup_time
    };

    const result = await handleApiCall(
      () => api.patch(API_ENDPOINTS.ACCEPT_SWAP(swapId), data),
      setIsLoading,
      setError,
      'Swap accepted!',
      'Accept swap'
    );
    if (result) {
      setSwaps((prev) =>
        prev.map((s) => (s.swap_id === swapId ? { ...s, status: 'Accepted' } : s))
      );
    }
    return result;
  }, []);

  const confirmSwap = useCallback(async (swapId, data) => {
    const result = await handleApiCall(
      () => api.patch(API_ENDPOINTS.CONFIRM_SWAP(swapId), { qr_code_url: data.qr_code }),
      setIsLoading,
      setError,
      'Swap confirmed!',
      'Confirm swap'
    );
    if (result) {
      setSwaps((prev) =>
        prev.map((s) => (s.swap_id === swapId ? { ...s, status: result.status } : s))
      );
    }
    return result;
  }, []);

  const cancelSwap = useCallback(async (swapId) => {
    const result = await handleApiCallWithResult(
      () => api.patch(API_ENDPOINTS.CANCEL_SWAP(swapId)),
      setIsLoading,
      setError,
      'Swap cancelled!',
      'Cancel swap'
    );
    if (result) {
      setSwaps((prev) =>
        prev.map((s) => (s.swap_id === swapId ? { ...s, status: 'Cancelled' } : s))
      );
    }
    return result;
  }, []);

  const getSwapHistory = useCallback(async (page = 1) => {
    const result = await handleApiCall(
      () => api.get(`${API_ENDPOINTS.SWAP_HISTORY}?page=${page}`),
      setIsLoading,
      setError,
      null,
      'Fetch swap history'
    );
    if (result) {
      setSwapHistory(result.results || []);
      updatePagination(result, 'history', page);
    }
    return result;
  }, []);

  const addLocation = useCallback(async (data) => {
    const result = await handleApiCall(
      () => api.post(API_ENDPOINTS.ADD_LOCATION, data),
      setIsLoading,
      setError,
      'Location added!',
      'Add location'
    );
    return result;
  }, []);

  const getMidpoint = useCallback(async (coords) => {
    const params = new URLSearchParams(coords);
    const result = await handleApiCall(
      () => api.get(`${API_ENDPOINTS.GET_MIDPOINT}?${params.toString()}`),
      setIsLoading,
      setError,
      null,
      'Fetch midpoint'
    );
    if (result) {
      setMidpoint(result);
    }
    return result;
  }, []);

  const shareContent = useCallback(async (data) => {
    const result = await handleApiCall(
      () => api.post(API_ENDPOINTS.SHARE_CONTENT, data),
      setIsLoading,
      setError,
      'Content shared!',
      'Share content'
    );
    return result;
  }, []);

  const getSwapQR = useCallback(async (swapId) => {
    const result = await handleApiCall(
      () => api.get(API_ENDPOINTS.GET_SWAP_QR(swapId)),
      setIsLoading,
      setError,
      null,
      'Fetch QR code'
    );
    if (result) {
      setQrData(result.qr_code_url || result);
    }
    return result;
  }, []);

  useEffect(() => {
    if (!isWebSocketConnected || !notifications?.length) return;

    notifications.forEach((notification) => {
      const { type, swap } = notification;
      if (type === 'swap_proposed' && swap?.swap_id) {
        setSwaps((prev) => [swap, ...prev.filter((s) => s.swap_id !== swap.swap_id)]);
        toast.info(`New swap proposed: ${swap.initiator?.username || 'Unknown'}`);
      } else if (['swap_accepted', 'swap_confirmed', 'swap_completed', 'swap_cancelled'].includes(type) && swap?.swap_id) {
        setSwaps((prev) =>
          prev.map((s) =>
            s.swap_id === swap.swap_id ? { ...s, status: swap.status } : s
          )
        );
        getSwapHistory();
        toast.info(`Swap ${swap.swap_id} ${type.replace('swap_', '')}`);
      }
    });
  }, [notifications, isWebSocketConnected, getSwapHistory]);

  // Extension request functions
  const requestExtension = useCallback(async (swapId, extensionData) => {
    const result = await handleApiCall(
      () => api.post(`${API_ENDPOINTS.REQUEST_EXTENSION(swapId)}`, extensionData),
      setIsLoading,
      setError,
      null,
      'Request extension'
    );
    return result;
  }, []);

  const respondToExtension = useCallback(async (extensionId, responseData) => {
    const result = await handleApiCall(
      () => api.patch(`${API_ENDPOINTS.RESPOND_TO_EXTENSION(extensionId)}`, responseData),
      setIsLoading,
      setError,
      null,
      'Respond to extension'
    );
    return result;
  }, []);

  // QR verification function
  const verifyQR = useCallback(async (swapId, qrData) => {
    const result = await handleApiCall(
      () => api.post(`${API_ENDPOINTS.VERIFY_QR(swapId)}`, qrData),
      setIsLoading,
      setError,
      null,
      'Verify QR code'
    );
    return result;
  }, []);

  // Enhanced getMidpoint with preferences
  const getMidpointWithPreferences = useCallback(async (params) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (Array.isArray(params[key])) {
        params[key].forEach(value => queryParams.append(key, value));
      } else {
        queryParams.append(key, params[key]);
      }
    });

    const result = await handleApiCall(
      () => api.get(`${API_ENDPOINTS.GET_MIDPOINT}?${queryParams.toString()}`),
      setIsLoading,
      setError,
      null,
      'Get optimal midpoint'
    );
    if (result) {
      setMidpoint(result);
    }
    return result;
  }, []);

  return {
    initiateSwap,
    getSwaps,
    acceptSwap,
    confirmSwap,
    cancelSwap,
    getSwapHistory,
    addLocation,
    getMidpoint,
    getMidpointWithPreferences,
    shareContent,
    getSwapQR,
    requestExtension,
    respondToExtension,
    verifyQR,
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