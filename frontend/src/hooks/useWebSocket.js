import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './useAuth';
import { WS_ENDPOINTS } from '../utils/constants';

export function useWebSocket(userId = null, type = 'notification') {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [discussionData, setDiscussionData] = useState({ notes: [], likes: [], upvotes: [], reprints: [] });
  const [chatData, setChatData] = useState({ messages: [], reactions: [] });
  const [societyData, setSocietyData] = useState({ messages: [], reactions: [], pinned: [] });
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = 5000;
  const { isAuthenticated, profile, refreshToken } = useAuth();
  const messageBuffer = useRef([]);
  const bufferTimeout = useRef(null);

  const flushBuffer = useCallback(() => {
    if (messageBuffer.current.length > 0) {
      setMessages((prev) => [...prev, ...messageBuffer.current]);
      messageBuffer.current = [];
    }
  }, []);

  const handleMessage = useCallback((message) => {
    if (!message || !message.type) {
      console.warn('Invalid WebSocket message:', message);
      return;
    }
    if (type === 'discussion') {
      setDiscussionData((prev) => {
        if (message.type === 'note_added' && message.note?.id) {
          return { ...prev, notes: [...prev.notes, message.note] };
        } else if (message.type === 'note_liked' && message.note?.note_id) {
          return { ...prev, likes: [...prev.likes, message.note] };
        } else if (message.type === 'post_upvoted' && message.discussion?.discussion_id) {
          return { ...prev, upvotes: [...prev.upvotes, message.discussion] };
        } else if (message.type === 'post_reprinted' && message.reprint?.discussion_id) {
          return { ...prev, reprints: [...prev.reprints, message.reprint] };
        }
        return prev;
      });
    } else if (type === 'chat') {
      setChatData((prev) => ({
        messages: message.type === 'chat_message' && message.message ? [...prev.messages, message.message] : prev.messages,
        reactions: message.type === 'reaction_added' && message.reaction ? [...prev.reactions, message.reaction] : prev.reactions,
      }));
      messageBuffer.current.push(message);
    } else if (type === 'society') {
      setSocietyData((prev) => ({
        messages: message.type === 'society_message' && message.message ? [...prev.messages, message.message] : prev.messages,
        reactions: message.type === 'reaction_added' && message.reaction ? [...prev.reactions, message.reaction] : prev.reactions,
        pinned: message.type === 'message_pinned' && message.message_id ? [...prev.pinned, { message_id: message.message_id }] : prev.pinned,
      }));
      messageBuffer.current.push(message);
    } else {
      messageBuffer.current.push(message);
    }

    if (!bufferTimeout.current) {
      bufferTimeout.current = setTimeout(() => {
        flushBuffer();
        bufferTimeout.current = null;
      }, 500);
    }
  }, [type, flushBuffer]);

  const connectWebSocket = useCallback(async () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    if (reconnectAttempts.current >= maxReconnectAttempts) {
      toast.error('Max WebSocket reconnection attempts reached');
      return;
    }

    if (!isAuthenticated || (!userId && !profile?.user_id)) {
      console.log('WebSocket: Not authenticated or no user ID', { isAuthenticated, profile, userId });
      return;
    }

    let token = localStorage.getItem('access_token');
    if (!token) {
      token = await refreshToken();
      if (!token) {
        toast.error('Authentication required for WebSocket');
        return;
      }
    }

    const wsBaseUrl = import.meta.env.VITE_WS_URL || 'ws://backend:8000';
    const wsUrl = `${wsBaseUrl}${WS_ENDPOINTS.NOTIFICATIONS(token)}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
      console.log(`WebSocket connected for ${type} at ${wsUrl}`);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleMessage(message);
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    };

    wsRef.current.onclose = async (event) => {
      setIsConnected(false);
      console.log(`WebSocket closed with code ${event.code}, reason: ${event.reason || 'No reason provided'}`);
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = reconnectInterval * Math.pow(2, reconnectAttempts.current);
        console.log(`Attempting reconnect ${reconnectAttempts.current + 1}/${maxReconnectAttempts} in ${delay}ms`);
        if (event.code === 4001) {
          console.log('Unauthorized, attempting token refresh');
          const newToken = await refreshToken();
          if (newToken) reconnectAttempts.current = 0;
        }
        setTimeout(connectWebSocket, delay);
        reconnectAttempts.current += 1;
      } else {
        toast.error('WebSocket connection failed after max retries');
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
      toast.error('WebSocket connection error');
    };
  }, [isAuthenticated, profile, userId, type, handleMessage, refreshToken]);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
      reconnectAttempts.current = 0;
    }
    if (bufferTimeout.current) {
      clearTimeout(bufferTimeout.current);
      bufferTimeout.current = null;
    }
  }, []);

  const sendMessage = useCallback((content, bookId = null) => {
    if (isConnected && wsRef.current) {
      wsRef.current.send(JSON.stringify({ action: 'send_message', content, book_id: bookId }));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }, [isConnected]);

  const addReaction = useCallback((messageId, reactionType) => {
    if (isConnected && wsRef.current) {
      wsRef.current.send(JSON.stringify({ action: 'add_reaction', message_id: messageId, reaction_type: reactionType }));
    } else {
      console.warn('WebSocket not connected, cannot add reaction');
    }
  }, [isConnected]);

  const addNote = useCallback((discussionId, content, parentNoteId = null) => {
    if (isConnected && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        action: 'add_note',
        discussion_id: discussionId,
        content,
        parent_note_id: parentNoteId,
      }));
    } else {
      console.warn('WebSocket not connected, cannot add note');
    }
  }, [isConnected]);

  const likeNote = useCallback((noteId) => {
    if (isConnected && wsRef.current) {
      wsRef.current.send(JSON.stringify({ action: 'like_note', note_id: noteId }));
    } else {
      console.warn('WebSocket not connected, cannot like note');
    }
  }, [isConnected]);

  const upvotePost = useCallback((discussionId) => {
    if (isConnected && wsRef.current) {
      wsRef.current.send(JSON.stringify({ action: 'upvote_post', discussion_id: discussionId }));
    } else {
      console.warn('WebSocket not connected, cannot upvote post');
    }
  }, [isConnected]);

  const reprintPost = useCallback((discussionId, comment = '') => {
    if (isConnected && wsRef.current) {
      wsRef.current.send(JSON.stringify({ action: 'reprint_post', content: comment, discussion_id: discussionId }));
    } else {
      console.warn('WebSocket not connected, cannot reprint post');
    }
  }, [isConnected]);

  useEffect(() => {
    if (isAuthenticated && (userId || profile?.user_id)) {
      connectWebSocket();
    }
    return disconnectWebSocket;
  }, [connectWebSocket, disconnectWebSocket, isAuthenticated, userId, profile?.user_id]);

  return {
    connectWebSocket,
    isConnected,
    messages,
    discussionData,
    chatData,
    societyData,
    sendMessage,
    addReaction,
    addNote,
    likeNote,
    upvotePost,
    reprintPost,
  };
}