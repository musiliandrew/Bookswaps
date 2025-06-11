import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import { useNotifications } from './useNotifications';
import { useWebSocket } from './useWebSocket';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    messages: { next: null, previous: null, page: 1, totalPages: 1 },
  });

  const { notifications, isWebSocketConnected: isNotificationsConnected } = useNotifications();
  const { data: wsData, isConnected: isChatWsConnected, sendMessage, addReaction } = useWebSocket(null, 'chat');

  const sendDirectMessage = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/chat/messages/send/', data);
      setMessages((prev) => [...prev, response.data]);
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

  const editMessage = useCallback(async (chatId, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/chat/messages/${chatId}/edit/`, data);
      setMessages((prev) =>
        prev.map((m) => (m.id === chatId ? { ...m, ...response.data } : m))
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

  const deleteMessage = useCallback(async (chatId) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/chat/messages/${chatId}/delete/`);
      setMessages((prev) => prev.filter((m) => m.id !== chatId));
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

  const markRead = useCallback(async (chatId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/chat/messages/${chatId}/read/`);
      setMessages((prev) =>
        prev.map((m) => (m.id === chatId ? { ...m, status: 'READ' } : m))
      );
      toast.success('Message marked as read!');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to mark message read';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addDirectReaction = useCallback(async (chatId, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/chat/messages/${chatId}/react/`, data);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === chatId
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

  const listReactions = useCallback(async (chatId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/chat/messages/${chatId}/reactions/`);
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

  const listMessages = useCallback(async (filters = {}, page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page });
      if (filters.recipient_id) params.append('receiver_id', filters.recipient_id);
      if (filters.unread) params.append('unread', 'true');
      const response = await api.get(`/chat/messages/?${params.toString()}`);
      setMessages(response.data.results || []);
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
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch messages';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle WebSocket messages for chat
  useEffect(() => {
    if (!isChatWsConnected || !wsData) return;

    if (wsData.type === 'chat_message') {
      setMessages((prev) => {
        if (!prev.find((m) => m.id === wsData.message.id)) {
          return [...prev, wsData.message];
        }
        return prev;
      });
    } else if (wsData.type === 'reaction_added') {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === wsData.reaction.message_id
            ? { ...m, reactions: [...(m.reactions || []), wsData.reaction] }
            : m
        )
      );
    }
  }, [wsData, isChatWsConnected]);

  // Handle notifications for chat updates
  useEffect(() => {
    if (!isNotificationsConnected || !notifications?.length) return;

    notifications.forEach(({ type, data }) => {
      if (type === 'message_received') {
        listMessages();
        toast.info(`New message from ${data.sender_name}`);
      }
    });
  }, [notifications, isNotificationsConnected, listMessages]);

  return {
    sendDirectMessage,
    editMessage,
    deleteMessage,
    markRead,
    addDirectReaction,
    listReactions,
    listMessages,
    messages,
    isLoading,
    error,
    pagination,
    isChatWsConnected,
    sendMessage,
    addReaction,
  };
}
