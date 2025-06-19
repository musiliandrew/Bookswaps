import React from 'react';

const ChatCreationForm = ({ newChat, setNewChat, handleStartChat }) => {
  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="text-xl font-bold mb-2">Start a New Chat</h3>
      <input
        type="text"
        value={newChat.recipient_id}
        onChange={e => setNewChat({ ...newChat, recipient_id: e.target.value })}
        className="w-full p-2 border rounded mb-2"
        placeholder="Recipient User ID"
      />
      <input
        type="text"
        value={newChat.book_id}
        onChange={e => setNewChat({ ...newChat, book_id: e.target.value })}
        className="w-full p-2 border rounded mb-2"
        placeholder="Book ID (optional)"
      />
      <button onClick={handleStartChat} className="bg-[var(--accent)] text-white p-2 rounded">
        Start Chat
      </button>
    </div>
  );
};

export default ChatCreationForm;