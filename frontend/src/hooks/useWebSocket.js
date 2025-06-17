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
  const reconnectInterval = 30000; // Increased to 15s
  const { isAuthenticated, profile } = useAuth();
  const messageBuffer = useRef([]); // Buffer messages to batch updates
  const bufferTimeout = useRef(null);

  const flushBuffer = useCallback(() => {
    if (messageBuffer.current.length > 0) {
      setMessages((prev) => [...prev, ...messageBuffer.current]);
      messageBuffer.current = [];
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected, skipping');
      return;
    }
    
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      toast.error('Max WebSocket reconnection attempts reached');
      return;
    }
    
    if (!isAuthenticated || !profile?.user?.id) {
      console.log('WebSocket: Skipping connection, not authenticated or no user ID');
      return;
    }
    
    const wsUrl = `${import.meta.env.VITE_WS_URL}/${type}/${userId || profile?.user?.id}/`;
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
      console.log(`WebSocket connected for ${type}`);
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
        
        // Batch updates every 500ms
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
    
    wsRef.current.onclose = () => {
      setIsConnected(false);
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = reconnectInterval * Math.pow(2, reconnectAttempts.current);
        console.log(`WebSocket closed, attempting reconnect ${reconnectAttempts.current + 1}/${maxReconnectAttempts} in ${delay}ms`);
        setTimeout(connectWebSocket, delay);
        reconnectAttempts.current += 1;
      } else {
        toast.error('WebSocket connection failed after max retries');
      }
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
      toast.error('WebSocket connection error, attempting to reconnect...');
      if (wsRef.current.readyState !== WebSocket.OPEN) {
        wsRef.current?.close();
      }
    };
  }, [
    userId, 
    isAuthenticated, 
    profile?.user?.id, 
    type, 
    flushBuffer,
    maxReconnectAttempts,        // Added: used in condition check
    setIsConnected,              // Added: used in onopen and onclose
    setDiscussionData,           // Added: used in onmessage for discussion type
    setChatData,                 // Added: used in onmessage for chat type
    setSocietyData,              // Added: used in onmessage for society type
  reconnectInterval            // Added: used in exponential backoff calculation
]);

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
      wsRef.current.send(JSON.stringify({ action: 'reprint_post', discussion_id: discussionId, comment }));
    }
  }, [isConnected]);

  useEffect(() => {
    if (isAuthenticated && (userId || profile?.user?.id)) {
      connectWebSocket();
    }
    return disconnectWebSocket;
  }, [connectWebSocket, disconnectWebSocket, userId, isAuthenticated, profile?.user?.id]);

  return {
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