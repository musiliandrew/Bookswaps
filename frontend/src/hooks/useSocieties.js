import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import { useNotifications } from './useNotifications';
import { useWebSocket } from './useWebSocket';

export function useSocieties() {
  const [societies, setSocieties] = useState([]);
  const [societyMessages, setSocietyMessages] = useState([]);
  const [societyEvents, setSocietyEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    societies: { next: null, previous: null, page: 1, totalPages: 1 },
    messages: { next: null, previous: null, page: 1, totalPages: 1 },
    events: { next: null, previous: null, page: 1, totalPages: 1 },
  });

  const { notifications, isWebSocketConnected: isNotificationsConnected } = useNotifications();
  const { data: wsData, isConnected: isSocietyWsConnected, sendMessage, addReaction } = useWebSocket(null, 'society');

  const createSociety = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/chat/societies/create/', data);
      setSocieties((prev) => [...prev, response.data]);
      toast.success('Society created!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to create society';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const joinSociety = useCallback(async (societyId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/chat/societies/${societyId}/join/`);
      setSocieties((prev) =>
        prev.map((s) => (s.id === societyId ? { ...s, is_member: true } : s))
      );
      toast.success('Joined society!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to join society';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const leaveSociety = useCallback(async (societyId) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/chat/societies/${societyId}/leave/`);
      setSocieties((prev) =>
        prev.map((s) => (s.id === societyId ? { ...s, is_member: false } : s))
      );
      toast.success('Left society!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to leave society';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const listSocieties = useCallback(async (filters = {}, page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page });
      if (filters.focus_type) params.append('focus_type', filters.focus_type);
      if (filters.focus_id) params.append('focus_id', filters.focus_id);
      if (filters.my_societies) params.append('my_societies', 'true');
      const response = await api.get(`/chat/societies/?${params.toString()}`);
      setSocieties(response.data.results || []);
      setPagination((prev) => ({
        ...prev,
        societies: {
          next: response.data.next,
          previous: response.data.previous,
          page,
          totalPages: Math.ceil(response.data.count / (response.data.results?.length || 1)),
        },
      }));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch societies';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSocietyMessages = useCallback(async (societyId, page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/chat/societies/${societyId}/messages/?page=${page}`);
      setSocietyMessages(response.data.results || []);
      setPagination((prev) => ({
        ...prev,
        messages: {
          next: response.data.next,
          previous: response.data.previous,
          page,
          totalPages: Math.ceil(response.data.count / (response.data.results?.length || 1)),
        },
      }));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch society messages';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendSocietyMessage = useCallback(async (societyId, content) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/chat/societies/${societyId}/messages/send/`, { content });
      setSocietyMessages((prev) => [...prev, response.data]);
      toast.success('Message sent!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to send message';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const editSocietyMessage = useCallback(async (societyId, messageId, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/chat/societies/${societyId}/messages/${messageId}/edit/`, data);
      setSocietyMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, ...response.data } : m))
      );
      toast.success('Message edited!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to edit message';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSocietyMessage = useCallback(async (societyId, messageId) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/chat/societies/${societyId}/messages/${messageId}/delete/`);
      setSocietyMessages((prev) => prev.filter((m) => m.id !== messageId));
      toast.success('Message deleted!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to delete message';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pinSocietyMessage = useCallback(async (societyId, messageId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/chat/societies/${societyId}/messages/${messageId}/pin/`);
      setSocietyMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, is_pinned: true } : m))
      );
      toast.success('Message pinned!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to pin message';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addSocietyReaction = useCallback(async (societyId, messageId, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/chat/societies/${societyId}/messages/${messageId}/react/`, data);
      setSocietyMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, reactions: [...(m.reactions || []), response.data] }
            : m
        )
      );
      toast.success('Reaction added!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to add reaction';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const listSocietyReactions = useCallback(async (societyId, messageId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/chat/societies/${societyId}/messages/${messageId}/reactions/`);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch reactions';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSocietyEvent = useCallback(async (societyId, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/chat/societies/${societyId}/events/create/`, data);
      setSocietyEvents((prev) => [...prev, response.data]);
      toast.success('Event created!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to create event';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const listSocietyEvents = useCallback(async (societyId, page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/chat/societies/${societyId}/events/?page=${page}`);
      setSocietyEvents(response.data.results || []);
      setPagination((prev) => ({
        ...prev,
        events: {
          next: response.data.next,
          previous: response.data.previous,
          page,
          totalPages: Math.ceil(response.data.count / (response.data.results?.length || 1)),
        },
      }));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch events';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle WebSocket messages for society
  useEffect(() => {
    if (!isSocietyWsConnected || !wsData) return;

    if (wsData.type === 'society_message') {
      setSocietyMessages((prev) => {
        if (!prev.find((m) => m.id === wsData.message.id)) {
          return [...prev, wsData.message];
        }
        return prev;
      });
    } else if (wsData.type === 'reaction_added') {
      setSocietyMessages((prev) =>
        prev.map((m) =>
          m.id === wsData.reaction.message_id
            ? { ...m, reactions: [...(m.reactions || []), wsData.reaction] }
            : m
        )
      );
    } else if (wsData.type === 'message_pinned') {
      setSocietyMessages((prev) =>
        prev.map((m) =>
          m.id === wsData.message_id ? { ...m, is_pinned: true } : m
        )
      );
    }
  }, [wsData, isSocietyWsConnected]);

  // Handle notifications for society updates
  useEffect(() => {
    if (!isNotificationsConnected || !notifications?.length) return;

    notifications.forEach(({ type, data }) => {
      if (type === 'society_joined' || type === 'society_left') {
        listSocieties();
        toast.info(`Society ${type === 'society_joined' ? 'joined' : 'left'}: ${data.society_name}`);
      } else if (type === 'society_event_created') {
        listSocietyEvents(data.society_id);
        toast.info(`New event in society: ${data.event_title}`);
      }
    });
  }, [notifications, isNotificationsConnected, listSocieties, listSocietyEvents]);

  return {
    createSociety,
    joinSociety,
    leaveSociety,
    listSocieties,
    getSocietyMessages,
    sendSocietyMessage,
    editSocietyMessage,
    deleteSocietyMessage,
    pinSocietyMessage,
    addSocietyReaction,
    listSocietyReactions,
    createSocietyEvent,
    listSocietyEvents,
    societies,
    societyMessages,
    societyEvents,
    isLoading,
    error,
    pagination,
    isSocietyWsConnected,
    sendMessage,
    addReaction,
  };
}
