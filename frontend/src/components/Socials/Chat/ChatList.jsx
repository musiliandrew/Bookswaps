import React from 'react';
import { Link } from 'react-router-dom';

const ChatList = ({ messages, isChatLoading, listMessages, chatFilters, chatPagination }) => {
  return (
    <div>
      {isChatLoading ? (
        <div>Loading chats...</div>
      ) : (
        <>
          {messages.map(msg => (
            <Link to={`/chat/direct/${msg.sender_id || msg.receiver_id}`} key={msg.id}>
              <div className="bg-white p-4 rounded shadow mb-2 flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-2"></div>
                <div>
                  <p className="font-bold">{msg.sender_name || 'User'}</p>
                  <p className="text-sm text-gray-600">
                    {msg.content.substring(0, 50)}...
                  </p>
                  <p className="text-sm text-gray-600">Status: {msg.status}</p>
                </div>
              </div>
            </Link>
          ))}
          <div className="flex gap-2">
            <button
              onClick={() => listMessages(chatFilters, chatPagination.messages.page - 1)}
              disabled={!chatPagination.messages.previous}
              className="p-2 bg-gray-200 rounded"
            >
              Previous
            </button>
            <button
              onClick={() => listMessages(chatFilters, chatPagination.messages.page + 1)}
              disabled={!chatPagination.messages.next}
              className="p-2 bg-gray-200 rounded"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatList;