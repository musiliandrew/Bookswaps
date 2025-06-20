import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'react-toastify';

export function useWebSocket(userId = null, type = 'notification') {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [discussionData, setDiscussionData] = useState({ notes: [], likes: [], upvotes: [], reprints: [] });
  const [chatData, setChatData] = useState({ messages: [], reactions: [] });
  const [societyData, setSocietyData] = useState({ messages: [], reactions: [], pinned: [] });
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = 3000; // Reduced for faster retries
  const { isAuthenticated, profile, refreshToken } = useAuth();
  const messageBuffer = useRef([]);
  const bufferTimeout = useRef(null);

  const flushBuffer = useCallback(() => {
    if (messageBuffer.current.length > 0) {
      setMessages((prev) => [...prev, ...messageBuffer.current]);
      messageBuffer.current = [];
    }
  }, []);

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

    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('No access token, attempting refresh');
      const newToken = await refreshToken();
      if (!newToken) {
        toast.error('Authentication required for WebSocket');
        return;
      }
    }

    const effectiveUserId = userId || profile.user_id;
    const wsBaseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    const wsUrl = `${wsBaseUrl}/ws/${type}/${effectiveUserId}/?token=${token}`;
    console.log('Attempting WebSocket connection to:', wsUrl);

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
      console.log(`WebSocket connected for ${type} at ${wsUrl}`);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (type === 'discussion') {
          setDiscussionData((prev) => ({
            notes: message.type === 'note_added' ? [...prev.notes, message.note] : prev.notes,
            likes: message.type === 'note_liked' ? [...prev.likes, message.note] : prev.likes,
            upvotes: message.type === 'post_upvoted' ? [...prev.upvotes, message.discussion] : prev.upvotes,
            reprints: message.type === 'post_reprinted' ? [...prev.reprints, message.reprint] : prev.reprints,
          }));
        } else if (type === 'chat') {
          setChatData((prev) => ({
            messages: message.type === 'chat_message' ? [...prev.messages, message.message] : prev.messages,
            reactions: message.type === 'reaction_added' ? [...prev.reactions, message.reaction] : prev.reactions,
          }));
          messageBuffer.current.push(message);
        } else if (type === 'society') {
          setSocietyData((prev) => ({
            messages: message.type === 'society_message' ? [...prev.messages, message.message] : prev.messages,
            reactions: message.type === 'reaction_added' ? [...prev.reactions, message.reaction] : prev.reactions,
            pinned: message.type === 'message_pinned' ? [...prev.pinned, { message_id: message.message_id }] : prev.pinned,
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
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    };

    wsRef.current.onclose = async (event) => {
      setIsConnected(false);
      console.log(`WebSocket closed with code ${event.code}`);
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = reconnectInterval * Math.pow(2, reconnectAttempts.current);
        console.log(`Attempting reconnect ${reconnectAttempts.current + 1}/${maxReconnectAttempts} in ${delay}ms`);
        if (event.code === 4001) { // Unauthorized
          const newToken = await refreshToken();
          if (newToken) {
            reconnectAttempts.current = 0; // Reset attempts on token refresh
          }
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
      let errorMessage = 'WebSocket connection error';
      if (error.code === '4001') {
        errorMessage = 'Authentication failed for WebSocket';
      } else if (error.code === '4003') {
        errorMessage = 'Access forbidden for WebSocket';
      }
      toast.error(errorMessage);
    };
  }, [isAuthenticated, profile, userId, type, flushBuffer, refreshToken]);

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
    }
  }, [isConnected]);

  const addReaction = useCallback((messageId, reactionType) => {
    if (isConnected && wsRef.current) {
      wsRef.current.send(JSON.stringify({ action: 'add_reaction', message_id: messageId, reaction_type: reactionType }));
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
    }
  }, [isConnected]);

  const likeNote = useCallback((noteId) => {
    if (isConnected && wsRef.current) {
      wsRef.current.send(JSON.stringify({ action: 'like_note', note_id: noteId }));
    }
  }, [isConnected]);

  const upvotePost = useCallback((discussionId) => {
    if (isConnected && wsRef.current) {
      wsRef.current.send(JSON.stringify({ action: 'upvote_post', discussion_id: discussionId }));
    }
  }, [isConnected]);

  const reprintPost = useCallback((discussionId, comment = '') => {
    if (isConnected && wsRef.current) {
      wsRef.current.send(JSON.stringify({ action: 'reprint_post', content: comment, discussion_id: discussionId }));
    }
  }, [isConnected]);

  useEffect(() => {
    if (isAuthenticated && (userId || profile?.user_id)) {
      connectWebSocket();
    }
    return disconnectWebSocket;
  }, [connectWebSocket, disconnectWebSocket, isAuthenticated, userId, profile]);

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