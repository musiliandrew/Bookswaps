import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export function useWebSocket(societyId) {
  const [messages, setMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const isDirectMessage = societyId.startsWith('dm-');
    const wsPath = isDirectMessage
      ? `dm/${societyId.replace(/^dm-/, '')}/`
      : `societies/${societyId}/`;
    const websocket = new WebSocket(`ws://api.example.com/chats/${wsPath}`);

    websocket.onopen = () => {
      console.log('WebSocket connected');
      toast.success('Connected to WebSocket');
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message' && data?.data?.id && data?.data?.content) {
          setMessages((prev) => [...prev, data.data]);
        } else if (data.type === 'event' && data?.event_id) {
          if (data.action === 'delete') {
            setEvents((prev) => prev.filter((e) => e.id !== data.event_id));
          } else if (data.action === 'update') {
            setEvents((prev) =>
              prev.map((e) =>
                e.id === data.event_id ? { ...e, ...data.data } : e
              )
            );
          } else {
            setEvents((prev) => {
              const exists = prev.find((e) => e.id === data.event_id);
              if (exists) {
                return prev.map((e) =>
                  e.id === data.event_id ? { ...e, ...data.data } : e
                );
              }
              return [...prev, { id: data.event_id, ...data.data }];
            });
          }
        }
      } catch {
        toast.error('Error parsing WebSocket message');
      }
    };

    websocket.onerror = () => {
      toast.error('WebSocket connection error');
    };

    websocket.onclose = () => {
      console.log('WebSocket closed');
    };

    setWs(websocket);

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, [societyId]);

  const sendMessage = (content) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = { type: 'message', content };
      ws.send(JSON.stringify(message));
    } else {
      toast.error('WebSocket is not connected');
    }
  };

  const sendEventRSVP = (eventId) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const rsvp = { type: 'event', action: 'rsvp', event_id: eventId };
      ws.send(JSON.stringify(rsvp));
    } else {
      toast.error('WebSocket is not connected');
    }
  };

  const sendEventCreation = (eventData) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const event = { type: 'event', action: 'create', event_id: eventData.id, data: eventData };
      ws.send(JSON.stringify(event));
    } else {
      toast.error('WebSocket is not connected');
    }
  };

  const sendEventDeletion = (eventId) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const event = { type: 'event', action: 'delete', event_id: eventId };
      ws.send(JSON.stringify(event));
    } else {
      toast.error('WebSocket is not connected');
    }
  };

  const sendEventUpdate = (eventId, eventData) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const event = { type: 'event', action: 'update', event_id: eventId, data: eventData };
      ws.send(JSON.stringify(event));
    } else {
      toast.error('WebSocket is not connected');
    }
  };

  return { messages, events, sendMessage, sendEventRSVP, sendEventCreation, sendEventDeletion, sendEventUpdate };
}