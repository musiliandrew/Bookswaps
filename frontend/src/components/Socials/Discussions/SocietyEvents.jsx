import React from 'react';

const SocietyEvents = ({ societyEvents, newSocietyEvent, setNewSocietyEvent, handleCreateSocietyEvent }) => {
  return (
    <div>
      {societyEvents.map(event => (
        <div key={event.id} className="p-2 border-b">
          <h3 className="font-bold">{event.title}</h3>
          <p>{event.description}</p>
          <p className="text-sm text-gray-600">Date: {event.date} | Location: {event.location}</p>
        </div>
      ))}
      <form onSubmit={handleCreateSocietyEvent} className="mt-4">
        <input
          type="text"
          value={newSocietyEvent.title}
          onChange={e => setNewSocietyEvent({ ...newSocietyEvent, title: e.target.value })}
          className="w-full p-2 border rounded mb-2"
          placeholder="Event Title"
        />
        <textarea
          value={newSocietyEvent.description}
          onChange={e => setNewSocietyEvent({ ...newSocietyEvent, description: e.target.value })}
          className="w-full p-2 border rounded mb-2"
          placeholder="Event Description"
        />
        <input
          type="text"
          value={newSocietyEvent.book_id}
          onChange={e => setNewSocietyEvent({ ...newSocietyEvent, book_id: e.target.value })}
          className="w-full p-2 border rounded mb-2"
          placeholder="Book ID"
        />
        <input
          type="datetime-local"
          value={newSocietyEvent.date}
          onChange={e => setNewSocietyEvent({ ...newSocietyEvent, date: e.target.value })}
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          value={newSocietyEvent.location}
          onChange={e => setNewSocietyEvent({ ...newSocietyEvent, location: e.target.value })}
          className="w-full p-2 border rounded mb-2"
          placeholder="Location"
        />
        <button type="submit" className="bg-[var(--accent)] text-white p-2 rounded">
          Create Event
        </button>
      </form>
    </div>
  );
};

export default SocietyEvents;