import React from 'react';

const SocietyMessages = ({ societyMessages, newSocietyMessage, setNewSocietyMessage, handleSendSocietyMessage }) => {
  return (
    <div>
      {societyMessages.map(msg => (
        <div key={msg.id} className="p-2 border-b">
          <p>{msg.content}</p>
          <p className="text-sm text-gray-600">By {msg.user}</p>
        </div>
      ))}
      <form onSubmit={handleSendSocietyMessage} className="mt-4">
        <textarea
          value={newSocietyMessage}
          onChange={e => setNewSocietyMessage(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Write a message..."
        />
        <button type="submit" className="mt-2 bg-[var(--accent)] text-white p-2 rounded">
          Send
        </button>
      </form>
    </div>
  );
};

export default SocietyMessages;