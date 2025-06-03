// frontend/src/hooks/useWebSocket.js
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

export function useWebSocket(id, type = 'society') {
  const [messages, setMessages] = useState([]); // For chat and society messages
  const [discussionData, setDiscussionData] = useState({
    notes: [],
    likes: [],
    upvotes: [],
    reprints: [],
  }); // For discussion-related data
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectWebSocket = useCallback(() => {
    let wsPath, wsGroup;
    if (type === 'direct') {
      wsPath = `chat/${id}/`;
      wsGroup = 'chat';
    } else if (type === 'society') {
      wsPath = `society/${id}/`;
      wsGroup = 'society';
    } else if (type === 'discussion') {
      wsPath = `discussions/${id}/`;
      wsGroup = 'discussion';
    } else {
      toast.error('Invalid WebSocket type');
      return;
    }

    // Use environment variable or fallback to local development URL
    // Use Vite's import.meta.env or fallback to local development URL
    const wsUrl = `${
      import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
    }/ws/${wsPath}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log(`${wsGroup} WebSocket connected`);
      toast.success(`Connected to ${wsGroup} WebSocket`);
      setIsConnected(true);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          toast.error(data.error);
          return;
        }

        if (wsGroup === 'chat' || wsGroup === 'society') {
          if (data.type === 'chat_message' || data.type === 'society_message') {
            setMessages((prev) => {
              if (!prev.find((m) => m.message_id === data.message.message_id)) {
                return [...prev, data.message];
              }
              return prev;
            });
          } else if (data.type === 'reaction_added') {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.message_id === data.reaction.message_id
                  ? { ...msg, reactions: [...(msg.reactions || []), data.reaction] }
                  : msg
              )
            );
          }
        } else if (wsGroup === 'discussion') {
          if (data.type === 'discussion_created') {
            toast.info(`New discussion: ${data.discussion.title}`);
            // Optionally update discussion list if needed
          } else if (data.type === 'note_added') {
            setDiscussionData((prev) => ({
              ...prev,
              notes: [...prev.notes, data.note],
            }));
          } else if (data.type === 'note_liked') {
            setDiscussionData((prev) => ({
              ...prev,
              likes: prev.likes.some((l) => l.note_id === data.note.note_id)
                ? prev.likes.map((l) =>
                    l.note_id === data.note.note_id ? data.note : l
                  )
                : [...prev.likes, data.note],
            }));
          } else if (data.type === 'post_upvoted') {
            setDiscussionData((prev) => ({
              ...prev,
              upvotes: prev.upvotes.some(
                (u) => u.discussion_id === data.discussion.discussion_id
              )
                ? prev.upvotes.map((u) =>
                    u.discussion_id === data.discussion.discussion_id
                      ? data.discussion
                      : u
                  )
                : [...prev.upvotes, data.discussion],
            }));
          } else if (data.type === 'post_reprinted') {
            setDiscussionData((prev) => ({
              ...prev,
              reprints: [...prev.reprints, data.reprint],
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        toast.error('Error processing WebSocket message');
      }
    };

    websocket.onerror = (error) => {
      console.error(`${wsGroup} WebSocket error:`, error);
      toast.error(`${wsGroup} WebSocket connection error`);
      setIsConnected(false);
    };

    websocket.onclose = (event) => {
      console.log(`${wsGroup} WebSocket closed with code:`, event.code);
      toast.warn(`${wsGroup} WebSocket disconnected`);
      setIsConnected(false);
      // Attempt to reconnect after 5 seconds
      setTimeout(() => connectWebSocket(), 5000);
    };

    setWs(websocket);

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close(1000, 'Component unmounted');
      }
    };
  }, [id, type]);

  useEffect(() => {
    const cleanup = connectWebSocket();
    return cleanup;
  }, [connectWebSocket]);

  const sendMessage = (content, bookId = null) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          action: 'send_message',
          content,
          book_id: bookId,
        })
      );
    } else {
      toast.error('WebSocket is not connected');
    }
  };

  const addReaction = (messageId, reactionType) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          action: 'add_reaction',
          message_id: messageId,
          reaction_type: reactionType,
        })
      );
    } else {
      toast.error('WebSocket is not connected');
    }
  };

  const addNote = (content, parentNoteId = null) => {
    if (ws && ws.readyState === WebSocket.OPEN && type === 'discussion') {
      ws.send(
        JSON.stringify({
          action: 'add_note',
          content,
          parent_note_id: parentNoteId,
        })
      );
    } else {
      toast.error('WebSocket is not connected or invalid type');
    }
  };

  const likeNote = (noteId) => {
    if (ws && ws.readyState === WebSocket.OPEN && type === 'discussion') {
      ws.send(
        JSON.stringify({
          action: 'like_note',
          note_id: noteId,
        })
      );
    } else {
      toast.error('WebSocket is not connected or invalid type');
    }
  };

  const upvotePost = () => {
    if (ws && ws.readyState === WebSocket.OPEN && type === 'discussion') {
      ws.send(
        JSON.stringify({
          action: 'upvote_post',
        })
      );
    } else {
      toast.error('WebSocket is not connected or invalid type');
    }
  };

  const reprintPost = (comment = '') => {
    if (ws && ws.readyState === WebSocket.OPEN && type === 'discussion') {
      ws.send(
        JSON.stringify({
          action: 'reprint_post',
          comment,
        })
      );
    } else {
      toast.error('WebSocket is not connected or invalid type');
    }
  };

  return {
    messages,
    discussionData,
    isConnected,
    sendMessage,
    addReaction,
    addNote,
    likeNote,
    upvotePost,
    reprintPost,
  };
}