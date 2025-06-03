import { useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';

export function useSwaps() {
  const [swaps, setSwaps] = useState([]);
  const [swapHistory, setSwapHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [qrData, setQrData] = useState(null);
  const [midpoint, setMidpoint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ next: null, previous: null });

  const initiateSwap = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/swaps/', data);
      toast.success('Swap requested!');
      getSwaps(); // Refresh swaps
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to initiate swap';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getSwaps = async (status = '', pageUrl = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = pageUrl || `/swaps/list/?status=${encodeURIComponent(status)}`;
      const response = await api.get(url);
      setSwaps(response.data.results || response.data);
      setPagination({ next: response.data.next, previous: response.data.previous });
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch swaps';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptSwap = async (swapId, data) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.patch(`/swaps/${swapId}/accept/`, data);
      toast.success('Swap accepted!');
      getSwaps();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to accept swap';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmSwap = async (swapId, qrCodeUrl) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.patch(`/swaps/${swapId}/confirm/`, { qr_code_url: qrCodeUrl });
      toast.success('Swap confirmed!');
      getSwaps();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to confirm swap';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSwap = async (swapId) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.patch(`/swaps/${swapId}/cancel/`);
      toast.success('Swap cancelled!');
      getSwaps();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to cancel swap';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getSwapHistory = async (pageUrl = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = pageUrl || '/swaps/history/';
      const response = await api.get(url);
      setSwapHistory(response.data.results || response.data);
      setPagination({ next: response.data.next, previous: response.data.previous });
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch swap history';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const addLocation = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/swaps/locations/add/', data);
      toast.success('Location added!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to add location';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getMidpoint = async (coords) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        user_lat: coords.user_lat,
        user_lon: coords.user_lon,
        other_lat: coords.other_lat,
        other_lon: coords.other_lon,
      });
      const response = await api.get(`/swaps/midpoint/?${params.toString()}`);
      setMidpoint(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch midpoint';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const shareContent = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/swaps/share/', data);
      toast.success('Content shared!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to share content';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getNotifications = async (filters = {}, pageUrl = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.is_read !== undefined) params.append('is_read', filters.is_read);
      if (filters.type) params.append('type', filters.type);
      const url = pageUrl || `/swaps/notifications/?${params.toString()}`;
      const response = await api.get(url);
      setNotifications(response.data.results || response.data);
      setPagination({ next: response.data.next, previous: response.data.previous });
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch notifications';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const markNotificationRead = async (notificationId) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.patch(`/swaps/notifications/${notificationId}/read/`);
      toast.success('Notification marked as read!');
      getNotifications();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to mark notification read';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getSwapQR = async (swapId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/swaps/${swapId}/qr/`);
      setQrData(response.data.qr_code_url);
      return response.data.qr_code_url;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch QR code';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

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
    getNotifications,
    markNotificationRead,
    getSwapQR,
    swaps,
    swapHistory,
    notifications,
    qrData,
    midpoint,
    isLoading,
    error,
    pagination,
  };
}