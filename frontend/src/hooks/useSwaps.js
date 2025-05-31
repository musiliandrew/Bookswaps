import { useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';

export function useSwaps() {
  const [swaps, setSwaps] = useState([]);
  const [swapDetails, setSwapDetails] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [qrData, setQrData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const initiateSwap = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/swaps/', data);
      toast.success('Swap requested!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to initiate swap';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getSwaps = async (status = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/swaps/list/?status=${status}`);
      setSwaps(response.data.results);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch swaps';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getSwapDetails = async (swapId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/swaps/${swapId}/`);
      setSwapDetails(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch swap details';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptSwap = async (swapId) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.patch(`/swaps/${swapId}/accept/`);
      toast.success('Swap accepted!');
      getSwaps();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to accept swap';
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
      toast.success('Swap canceled!');
      getSwaps();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to cancel swap';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmSwap = async (swapId) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.patch(`/swaps/${swapId}/confirm/`);
      toast.success('Swap confirmed!');
      getSwaps();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to confirm swap';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const rateSwap = async (swapId, rating) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post(`/swaps/${swapId}/rate/`, { rating });
      toast.success('Swap rated successfully!');
      getSwaps();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to rate swap';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/swaps/notifications/');
      setNotifications(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch notifications';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const markNotificationRead = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.patch(`/notifications/${id}/read/`);
      toast.success('Notification marked as read!');
      getNotifications();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to mark notification read';
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
      const response = await api.post('/swaps/locations/swap/', data);
      toast.success('Location added!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to add location';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getSwapQR = async (swapId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/swaps/${swapId}/qr/`);
      setQrData(response.data.qr_code);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch QR code';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmSwapQR = async (swapId, qrData) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.patch(`/swaps/${swapId}/qr/`, { qr_code: qrData });
      toast.success('Swap confirmed via QR!');
      getSwaps();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to confirm swap with QR';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    initiateSwap,
    getSwaps,
    getSwapDetails,
    acceptSwap,
    cancelSwap,
    confirmSwap,
    rateSwap,
    getNotifications,
    markNotificationRead,
    addLocation,
    getSwapQR,
    confirmSwapQR,
    swaps,
    swapDetails,
    notifications,
    qrData,
    isLoading,
    error,
  };
}