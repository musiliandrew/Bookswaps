import { useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';

export function useSocieties() {
  const [societies, setSocieties] = useState([]);
  const [societyDetails, setSocietyDetails] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ next: null, previous: null });

  const createSociety = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/discussions/societies/create/', data);
      toast.success('Society created!');
      getSocieties();
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to create society';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getSocieties = async (filters = {}, pageUrl = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.focus_type) params.append('focus_type', filters.focus_type);
      if (filters.focus_id) params.append('focus_id', filters.focus_id);
      if (filters.my_societies) params.append('my_societies', filters.my_societies);
      const url = pageUrl || `/chat/societies/?${params.toString()}`;
      const response = await api.get(url);
      setSocieties(response.data.results || response.data);
      setPagination({ next: response.data.next, previous: response.data.previous });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch societies';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getSocietyDetails = async (societyId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/discussions/societies/${societyId}/`);
      setSocietyDetails(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch society details';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const joinSociety = async (societyId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/discussions/societies/${societyId}/join/`);
      toast.success('Joined society!');
      getSocieties();
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to join society';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const leaveSociety = async (societyId) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/discussions/societies/${societyId}/leave/`);
      toast.success('Left society!');
      getSocieties();
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to leave society';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createSocietyEvent = async (societyId, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/discussions/societies/${societyId}/events/create/`, data);
      toast.success('Society event created!');
      getSocietyEvents(societyId);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to create society event';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getSocietyEvents = async (societyId, pageUrl = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = pageUrl || `/discussions/societies/${societyId}/events/`;
      const response = await api.get(url);
      setEvents(response.data.results || response.data);
      setPagination({ next: response.data.next, previous: response.data.previous });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch society events';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createSociety,
    getSocieties,
    getSocietyDetails,
    joinSociety,
    leaveSociety,
    createSocietyEvent,
    getSocietyEvents,
    societies,
    societyDetails,
    events,
    isLoading,
    error,
    pagination,
  };
}