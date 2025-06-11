import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'react-toastify';

export function useWebSocket(userId = null, type = 'notification') {
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState(null);
  const [discussionData, setDiscussionData] = useState({ notes: [], likes: [], upvotes: [], reprints: [] });
  const [chatData, setChatData] = useState({ messages: [], reactions: [] });
  const [societyData, setSocietyData] = useState({ messages: [], reactions: [], pinned: [] });
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = 5000;
  const { auth } = useAuth();

  const connectWebSocket = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      toast.error('Max reconnection attempts reached');
      return;
    }

    // For Vite:
        const wsUrl = `${import.meta.env.VITE_WS_URL}/${type}/${userId || auth?.user?.id || ''}/`;
    
    // If using Create React App, use:
    // const wsUrl = `${process.env.REACT_APP_WS_URL}/${type}/${userId || auth?.user?.id || ''}/`;
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
          setData(message); // For backward compatibility
        } else if (type === 'society') {
          setSocietyData((prev) => ({
            messages: message.type === 'society_message' ? [...prev.messages, message.message] : prev.messages,
            reactions: message.type === 'reaction_added' ? [...prev.reactions, message.reaction] : prev.reactions,
            pinned: message.type === 'message_pinned' ? [...prev.pinned, { message_id: message.message_id }] : prev.pinned,
          }));
          setData(message); // For backward compatibility
        } else {
          setData(message);
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      reconnectAttempts.current += 1;
      setTimeout(connectWebSocket, reconnectInterval);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      wsRef.current?.close();
    };
  }, [userId, auth?.user?.id, type]);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
      reconnectAttempts.current = 0;
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
    if (userId || auth?.user?.id) {
      connectWebSocket();
    }
    return disconnectWebSocket;
  }, [connectWebSocket, disconnectWebSocket, userId, auth?.user?.id]);

  return {
    isConnected,
    data,
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
