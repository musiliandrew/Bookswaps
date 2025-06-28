import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import { handleApiCall, handleApiCallWithResult } from '../utils/apiUtils';
import { API_ENDPOINTS } from '../utils/constants';
import { useNotifications } from './useNotifications';
import { useWebSocket } from './useWebSocket';

export function useSocieties() {
  const [societies, setSocieties] = useState([]);
  const [society, setSociety] = useState(null);
  const [societyMembers, setSocietyMembers] = useState([]);
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
  const { societyData, isConnected: isSocietyWsConnected, sendMessage, addReaction } = useWebSocket(
    null,
    'society'
  );

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

  const createSociety = useCallback(async (data) => {
    const result = await handleApiCall(
      () => api.post(API_ENDPOINTS.CREATE_SOCIETY, data),
      setIsLoading,
      setError,
      'Society created!',
      'Create society'
    );
    if (result) setSocieties((prev) => [...prev, result]);
    return result;
  }, []);

  const joinSociety = useCallback(async (societyId) => {
    const result = await handleApiCall(
      () => api.post(API_ENDPOINTS.JOIN_SOCIETY(societyId)),
      setIsLoading,
      setError,
      'Joined society!',
      'Join society'
    );
    if (result) {
      setSocieties((prev) =>
        prev.map((s) => (s.id === societyId ? { ...s, is_member: true } : s))
      );
    }
    return result;
  }, []);

  const leaveSociety = useCallback(async (societyId) => {
    const result = await handleApiCallWithResult(
      () => api.delete(API_ENDPOINTS.LEAVE_SOCIETY(societyId)),
      setIsLoading,
      setError,
      'Left society!',
      'Leave society'
    );
    if (result) {
      setSocieties((prev) =>
        prev.map((s) => (s.id === societyId ? { ...s, is_member: false } : s))
      );
    }
    return result;
  }, []);

  const getSociety = useCallback(async (societyId) => {
    const result = await handleApiCall(
      () => api.get(API_ENDPOINTS.GET_SOCIETY(societyId)),
      setIsLoading,
      setError,
      null,
      'Fetch society'
    );
    if (result) setSociety(result);
    return result;
  }, []);

  const getSocietyMembers = useCallback(async (societyId) => {
    const result = await handleApiCall(
      () => api.get(API_ENDPOINTS.GET_SOCIETY_MEMBERS(societyId)),
      setIsLoading,
      setError,
      null,
      'Fetch society members'
    );
    if (result) setSocietyMembers(result.results || []);
    return result;
  }, []);

  const listSocieties = useCallback(async (filters = {}, page = 1) => {
    const params = new URLSearchParams({ page });
    if (filters.search) params.append('search', filters.search);
    if (filters.visibility) params.append('visibility', filters.visibility);
    if (filters.focus_type) params.append('focus_type', filters.focus_type);
    if (filters.focus_id) params.append('focus_id', filters.focus_id);
    if (filters.my_societies) params.append('my_societies', 'true');

    const result = await handleApiCall(
      () => api.get(`${API_ENDPOINTS.LIST_SOCIETIES}?${params.toString()}`),
      setIsLoading,
      setError,
      null,
      'Fetch societies'
    );
    if (result) {
      setSocieties(result.results || []);
      updatePagination(result, 'societies', page);
    }
    return result;
  }, []);

  const getSocietyMessages = useCallback(async (societyId, page = 1) => {
    const result = await handleApiCall(
      () => api.get(`${API_ENDPOINTS.GET_SOCIETY_MESSAGES(societyId)}?page=${page}`),
      setIsLoading,
      setError,
      null,
      'Fetch society messages'
    );
    if (result) {
      setSocietyMessages(result.results || []);
      updatePagination(result, 'messages', page);
    }
    return result;
  }, []);

  const sendSocietyMessage = useCallback(async (societyId, content) => {
    const result = await handleApiCall(
      () => api.post(API_ENDPOINTS.SEND_SOCIETY_MESSAGE(societyId), { content }),
      setIsLoading,
      setError,
      'Message sent!',
      'Send message'
    );
    if (result) {
      setSocietyMessages((prev) => [...prev, result]);
    }
    return result;
  }, []);

  const editSocietyMessage = useCallback(async (societyId, messageId, data) => {
    const result = await handleApiCall(
      () => api.patch(API_ENDPOINTS.EDIT_SOCIETY_MESSAGE(societyId, messageId), data),
      setIsLoading,
      setError,
      'Message edited!',
      'Edit message'
    );
    if (result) {
      setSocietyMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, ...result } : m))
      );
    }
    return result;
  }, []);

  const deleteSocietyMessage = useCallback(async (societyId, messageId) => {
    const result = await handleApiCallWithResult(
      () => api.delete(API_ENDPOINTS.DELETE_SOCIETY_MESSAGE(societyId, messageId)),
      setIsLoading,
      setError,
      'Message deleted!',
      'Delete message'
    );
    if (result) {
      setSocietyMessages((prev) => prev.filter((p) => p.id !== messageId));
    }
    return result;
  }, []);

  const pinSocietyMessage = useCallback(async (societyId, messageId) => {
    const result = await handleApiCall(
      () => api.post(API_ENDPOINTS.PIN_SOCIETY_MESSAGE(societyId, messageId)),
      setIsLoading,
      setError,
      'Message pinned!',
      'Success'
    );
    if (result) {
      setSocietyMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, is_pinned: true } : m))
      );
    }
    return result;
  }, []);

  const addSocietyReaction = useCallback(
    async (societyId, messageId, data) => {
      try {
        setIsLoading(true);
        setError(null);

        // Try WebSocket first, fallback to API
        if (addReaction) {
          await addReaction(messageId, data);
        } else {
          // Fallback to API call
          await handleApiCall(
            () => api.post(API_ENDPOINTS.ADD_SOCIETY_REACTION(societyId, messageId), data),
            setIsLoading,
            setError,
            'Reaction added!',
            'Add reaction'
          );
        }

        toast.success('Reaction added!');
        return true;
      } catch (err) {
        const errorMessage = err.message || 'Failed to add reaction';
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [addReaction]
  );

  const listSocietyReactions = useCallback(
    async (societyId, messageId) => {
      return await handleApiCall(
        () => api.get(API_ENDPOINTS.LIST_SOCIETY_REACTIONS(societyId, messageId)),
        setIsLoading,
        setError,
        null,
        'Fetch reactions'
      );
    },
    []
  );

  const createSocietyEvent = useCallback(async (societyId, data) => {
    const result = await handleApiCall(
      () => api.post(API_ENDPOINTS.CREATE_SOCIETY_EVENT(societyId), data),
      setIsLoading,
      setError,
      'Event created successfully!',
      'Create event'
    );
    if (result) setSocietyEvents((prev) => [...prev, result]);
    return result;
  }, []);

  const listSocietyEvents = useCallback(async (societyId, page = 1) => {
    const result = await handleApiCall(
      () => api.get(`${API_ENDPOINTS.LIST_SOCIETY_EVENTS(societyId)}?page=${page}`),
      setIsLoading,
      setError,
      null,
      'Fetch events'
    );
    if (result) {
      setSocietyEvents(result.results || []);
      updatePagination(result, 'events', page);
    }
    return result;
  }, []);

  useEffect(() => {
  if (!isSocietyWsConnected || !societyData) return;

  if (societyData.type === 'society_message') {
    setSocietyMessages((prev) => {
      if (!prev.find((m) => m.id === societyData.message.id)) {
        return [...prev, societyData.message];
      }
      return prev;
    });
  } else if (societyData.type === 'reaction_added') {
    setSocietyMessages((prev) =>
      prev.map((m) =>
        m.id === societyData.reaction?.message_id
          ? { ...m, reactions: [...(m.reactions || []), societyData.reaction] }
          : m
      )
    );
  } else if (societyData.type === 'message_pinned') {
    setSocietyMessages((prev) =>
      prev.map((m) =>
        m.id === societyData.message_id ? { ...m, is_pinned: true } : m
      )
    );
  }
}, [societyData, isSocietyWsConnected]);

  useEffect(() => {
    if (!isNotificationsConnected || !notifications?.length) return;

    notifications.forEach(({ type, data }) => {
      if (type === 'society_joined' || type === 'society_left') {
        listSocieties();
        toast.info(`Society ${type === 'society_joined' ? 'joined' : 'left'}: ${data?.society_name}`);
      } else if (type === 'society_event_created' && data?.society_id) {
        listSocietyEvents(data.society_id);
        toast.info(`New event in society: ${data?.event_title}`);
      }
    });
  }, [notifications, isNotificationsConnected, listSocieties, listSocietyEvents]);

  return {
    createSociety,
    joinSociety,
    leaveSociety,
    getSociety,
    getSocietyMembers,
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
    society,
    societyMembers,
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