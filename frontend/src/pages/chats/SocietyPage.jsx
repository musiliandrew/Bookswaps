import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import { useWebSocket } from '../../hooks/useWebSocket';
import { SocietyMessageForm } from '../../components/chats/SocietyMessageForm';
import { SocietyEventCard } from '../../components/chats/SocietyEventCard';
import { EventForm } from '../../components/chats/EventForm';
import { api } from '../../utils/api';
import { toast } from 'react-toastify';

const SocietyPage = () => {
  const { societyId } = useParams();
  const { getMessages, getEvents, createEvent, updateEvent, deleteEvent, messages: initialMessages, events: initialEvents, isLoading, error } = useChat();
  const { messages: wsMessages, events: wsEvents, sendMessage, sendEventRSVP, sendEventCreation, sendEventDeletion, sendEventUpdate } = useWebSocket(societyId);
  const [society, setSociety] = useState(null);
  const [combinedMessages, setCombinedMessages] = useState([]);
  const [combinedEvents, setCombinedEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);

  useEffect(() => {
    const fetchSociety = async () => {
      try {
        const response = await api.get(`/chats/societies/${societyId}/`);
        setSociety(response.data);
      } catch {
        toast.error('Failed to fetch society details');
      }
    };

    fetchSociety();
    getMessages(societyId);
    getEvents(societyId);
  }, [societyId, getMessages, getEvents]);

  useEffect(() => {
    const allMessages = [
      ...initialMessages,
      ...wsMessages
    ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    const uniqueMessages = Array.from(
      new Map(allMessages.map(msg => [msg.id, msg])).values()
    );
    
    setCombinedMessages(uniqueMessages);
  }, [initialMessages, wsMessages]);

  useEffect(() => {
    const allEvents = [...initialEvents];
    wsEvents.forEach((wsEvent) => {
      const index = allEvents.findIndex((e) => e.id === wsEvent.id);
      if (index !== -1) {
        allEvents[index] = { ...allEvents[index], ...wsEvent };
      } else {
        allEvents.push(wsEvent);
      }
    });
    
    setCombinedEvents(allEvents.sort((a, b) => new Date(a.date) - new Date(b.date)));
  }, [initialEvents, wsEvents]);

  const handleRSVP = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/rsvp/`);
      sendEventRSVP(eventId);
      toast.success('RSVP successful');
    } catch {
      toast.error('Failed to RSVP');
    }
  };

  const handleCreateEvent = async (formData) => {
    try {
      const newEvent = await createEvent(societyId, formData);
      sendEventCreation({ id: newEvent.id, ...formData, rsvp_count: 0 });
      setShowEventForm(false);
    } catch {
      toast.error('Failed to create event');
    }
  };

  const handleUpdateEvent = async (eventId, formData) => {
    try {
      await updateEvent(societyId, eventId, formData);
      sendEventUpdate(eventId, { id: eventId, ...formData });
    } catch {
      toast.error('Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(societyId, eventId);
      sendEventDeletion(eventId);
    } catch {
      toast.error('Failed to delete event');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!society) return <div>Society not found</div>;

  return (
    <div className="container mx-auto p-4 bookish-gradient">
      <h1 className="text-3xl font-bold mb-4">{society.name}</h1>
      <p className="text-gray-600 mb-4">{society.description || 'No description'}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold mb-2">Messages</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {combinedMessages.length ? (
              combinedMessages.map((msg) => (
                <div key={msg.id} className="bookish-shadow p-2 bg-white rounded-lg">
                  <p className="text-sm text-gray-500">{msg.sender?.username} • {new Date(msg.timestamp).toLocaleString()}</p>
                  <p>{msg.content}</p>
                </div>
              ))
            ) : (
              <p>No messages yet. Start the conversation!</p>
            )}
          </div>
          <SocietyMessageForm
            onSubmit={sendMessage}
            societyId={societyId}
            isLoading={isLoading}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-semibold">Events</h2>
            <button
              onClick={() => setShowEventForm(!showEventForm)}
              className="bookish-button-enhanced px-4 py-2 rounded text-sm"
            >
              {showEventForm ? 'Cancel' : 'Create Event'}
            </button>
          </div>
          {showEventForm && (
            <div className="bookish-shadow p-4 bg-white rounded-lg mb-4">
              <EventForm onSubmit={handleCreateEvent} isLoading={isLoading} />
            </div>
          )}
          <div className="space-y-4">
            {combinedEvents.length ? (
              combinedEvents.map((event) => (
                <SocietyEventCard
                  key={event.id}
                  event={event}
                  onRSVP={handleRSVP}
                  onDelete={handleDeleteEvent}
                  onEdit={handleUpdateEvent}
                />
              ))
            ) : (
              <p>No events scheduled.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocietyPage;