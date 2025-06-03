import { useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [societyMessages, setSocietyMessages] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ next: null, previous: null });

  const sendMessage = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/chat/messages/send/', data);
      toast.success('Message sent!');
      getMessages(); // Refresh messages
      // WebSocket placeholder: Notify receiver in real-time
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to send message';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const editMessage = async (chatId, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/chat/messages/${chatId}/edit/`, data);
      toast.success('Message edited!');
      getMessages();
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to edit message';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMessage = async (chatId) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/chat/messages/${chatId}/delete/`);
      toast.success('Message deleted!');
      getMessages();
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete message';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getMessages = async (filters = {}, pageUrl = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.receiver_id) params.append('receiver_id', filters.receiver_id);
      if (filters.unread) params.append('unread', filters.unread);
      const url = pageUrl || `/chat/messages/?${params.toString()}`;
      const response = await api.get(url);
      setMessages(response.data.results || response.data);
      setPagination({ next: response.data.next, previous: response.data.previous });
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch messages';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const markRead = async (chatId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/chat/messages/${chatId}/read/`);
      toast.success('Message marked as read!');
      getMessages();
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to mark message read';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const addReaction = async (id, data, isSociety = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = isSociety
        ? `/chat/societies/${data.society_id}/messages/${id}/react/`
        : `/chat/messages/${id}/react/`;
      const response = await api.post(endpoint, data);
      toast.success('Reaction added!');
      getReactions(id, isSociety, data.society_id);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to add reaction';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getReactions = async (id, isSociety = false, societyId = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = isSociety
        ? `/chat/societies/${societyId}/messages/${id}/reactions/`
        : `/chat/messages/${id}/reactions/`;
      const response = await api.get(endpoint);
      setReactions(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch reactions';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const sendSocietyMessage = async (societyId, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/chat/societies/${societyId}/messages/send/`, data);
      toast.success('Society message sent!');
      getSocietyMessages(societyId);
      // WebSocket placeholder: Notify society members in real-time
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to send society message';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const editSocietyMessage = async (societyId, messageId, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/chat/societies/${societyId}/messages/${messageId}/edit/`, data);
      toast.success('Society message edited!');
      getSocietyMessages(societyId);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to edit society message';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSocietyMessage = async (societyId, messageId) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/chat/societies/${societyId}/messages/${messageId}/delete/`);
      toast.success('Society message deleted!');
      getSocietyMessages(societyId);
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete society message';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getSocietyMessages = async (societyId, pageUrl = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = pageUrl || `/chat/societies/${societyId}/messages/`;
      const response = await api.get(url);
      setSocietyMessages(response.data.results || response.data);
      setPagination({ next: response.data.next, previous: response.data.previous });
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch society messages';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const pinMessage = async (societyId, messageId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/chat/societies/${societyId}/messages/${messageId}/pin/`);
      toast.success('Message pinned!');
      getSocietyMessages(societyId);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to pin message';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    editMessage,
    deleteMessage,
    getMessages,
    markRead,
    addReaction,
    getReactions,
    sendSocietyMessage,
    editSocietyMessage,
    deleteSocietyMessage,
    getSocietyMessages,
    pinMessage,
    messages,
    societyMessages,
    reactions,
    isLoading,
    error,
    pagination,
  };
}