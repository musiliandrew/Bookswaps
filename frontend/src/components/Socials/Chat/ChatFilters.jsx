import React from 'react';

const ChatFilters = ({ chatFilters, setChatFilters }) => {
  return (
    <div className="mb-4 flex gap-2">
      <input
        type="text"
        value={chatFilters.recipient_id}
        onChange={e => setChatFilters({ ...chatFilters, recipient_id: e.target.value })}
        className="p-2 border rounded"
        placeholder="Filter by User ID"
      />
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={chatFilters.unread}
          onChange={e => setChatFilters({ ...chatFilters, unread: e.target.checked })}
          className="mr-2"
        />
        Unread Only
      </label>
    </div>
  );
};

export default ChatFilters;