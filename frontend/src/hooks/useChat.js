import { useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../../utils/api';

export function useChat() {
  const [societies, setSocieties] = useState([]);
  const [messages, setMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [recipientProfile, setRecipientProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getSocieties = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/chats/societies/');
      setSocieties(response.data.results || response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch societies';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const joinSociety = async (societyId) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post(`/societies/${societyId}/join/`);
      toast.success('Joined society!');
      getSocieties();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to join society';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getMessages = async (id, isSociety = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = isSociety ? `/chats/societies/${id}/messages/` : `/chats/dm/${id}/messages/`;
      const response = await api.get(endpoint);
      setMessages(response.data.results || response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch messages';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (id, content, isSociety = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = isSociety ? `/chats/societies/${id}/messages/` : `/dm/${id}/messages/`;
      const response = await api.post(endpoint, { content: content });
      toast.success('Message sent!');
      getMessages(id, isSociety);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.data?.detail || 'Failed to send message';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getEvents = async (societyId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/chats/societies/${societyId}/events/`);
      setEvents(response.data.results || response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch events';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createEvent = async (societyId, eventData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/chats/societies/${societyId}/events/create/`, eventData);
      toast.success('Event created!');
      getEvents(societyId);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.data?.detail || 'Failed to create event';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateEvent = async (societyId, eventId, eventData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/events/${eventId}/`, eventData);
      toast.success('Event updated!');
      getEvents(societyId);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.data?.detail || 'Failed to update event';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (societyId, eventId) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/events/${eventId}/`);
      toast.success('Event deleted!');
      getEvents(societyId);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete event';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createSociety = async (data) => {
      try {
        setIsLoading(true);
      const response = await api.post('/chats/societies/', data);
      toast.success('Society created!');
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

  const getRecipientProfile = async (userId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/users/${userId}/`);
      setRecipientProfile(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch user profile';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getSocieties,
    joinSociety,
    getMessages,
    sendMessage,
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    createSociety,
    getRecipientProfile,
    societies,
    messages,
    events,
    recipientProfile,
    isLoading,
    error
  };
};