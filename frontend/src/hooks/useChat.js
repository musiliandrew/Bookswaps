// useChat.js
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import { handleApiCall, handleApiCallWithResult } from '../utils/apiUtils';
import { API_ENDPOINTS } from '../utils/constants';
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
  const { data: wsData, isConnected: isChatWsConnected, sendMessage, addReaction } = useWebSocket(
    null,
    'chat'
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

  const sendDirectMessage = useCallback(
    async (data) => {
      const result = await handleApiCall(
        () => api.post(API_ENDPOINTS.SEND_MESSAGE, data),
        setIsLoading,
        setError,
        'Message sent!',
        'Message send'
      );
      if (result) setMessages((prev) => [...prev, result]);
      return result;
    },
    []
  );

  const editMessage = useCallback(
    async (chatId, data) => {
      const result = await handleApiCall(
        () => api.patch(API_ENDPOINTS.EDIT_MESSAGE(chatId), data),
        setIsLoading,
        setError,
        'Message edited!',
        'Message edit'
      );
      if (result) {
        setMessages((prev) =>
          prev.map((m) => (m.id === chatId ? { ...m, ...result } : m))
        );
      }
      return result;
    },
    []
  );

  const deleteMessage = useCallback(
    async (chatId) => {
      const result = await handleApiCallWithResult(
        () => api.delete(API_ENDPOINTS.DELETE_MESSAGE(chatId)),
        setIsLoading,
        setError,
        'Message deleted!',
        'Message deletion'
      );
      if (result) setMessages((prev) => prev.filter((m) => m.id !== chatId));
      return result;
    },
    []
  );

  const markRead = useCallback(
    async (chatId) => {
      const result = await handleApiCall(
        () => api.patch(API_ENDPOINTS.MARK_READ(chatId)),
        setIsLoading,
        setError,
        'Message marked as read!',
        'Mark message read'
      );
      if (result) {
        setMessages((prev) =>
          prev.map((m) => (m.id === chatId ? { ...m, status: 'READ' } : m))
        );
      }
      return result;
    },
    []
  );

  const addDirectReaction = useCallback(
    async (chatId, data) => {
      const result = await handleApiCall(
        () => api.post(API_ENDPOINTS.ADD_REACTION(chatId), data),
        setIsLoading,
        setError,
        'Reaction added!',
        'Add reaction'
      );
      if (result) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === chatId ? { ...m, reactions: [...(m.reactions || []), result] } : m
          )
        );
      }
      return result;
    },
    []
  );

  const listReactions = useCallback(
    async (chatId) => {
      return await handleApiCall(
        () => api.get(API_ENDPOINTS.LIST_REACTIONS(chatId)),
        setIsLoading,
        setError,
        null,
        'Fetch reactions'
      );
    },
    []
  );

  const listMessages = useCallback(
    async (filters = {}, page = 1) => {
      const params = new URLSearchParams({ page });
      if (filters.recipient_id) params.append('receiver_id', filters.recipient_id);
      if (filters.unread) params.append('unread', 'true');

      const result = await handleApiCall(
        () => api.get(`${API_ENDPOINTS.LIST_MESSAGES}?${params.toString()}`),
        setIsLoading,
        setError,
        null,
        'Fetch messages'
      );

      if (result) {
        setMessages(result.results || []);
        updatePagination(result, 'messages', page);
      }
      return result;
    },
    []
  );

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