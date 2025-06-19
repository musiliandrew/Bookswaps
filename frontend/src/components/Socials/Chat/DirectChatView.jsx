import React from 'react';
import { motion } from 'framer-motion';
import MessagesList from './MessagesList';

const DirectChatView = ({ chatId, messages, isChatLoading, newDirectMessage, setNewDirectMessage, handleSendDirectMessage, handleEditMessage, handleDeleteMessage, handleAddReaction, editingMessageId, setEditingMessageId, editContent, setEditContent, markRead }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-4 rounded shadow"
    >
      <h2 className="text-2xl font-bold mb-2">Chat with User {chatId}</h2>
      {isChatLoading ? (
        <div>Loading messages...</div>
      ) : (
        <>
          <div className="h-96 overflow-y-auto border p-2 mb-4">
            <MessagesList
              messages={messages}
              isSociety={false}
              editingMessageId={editingMessageId}
              setEditingMessageId={setEditingMessageId}
              editContent={editContent}
              setEditContent={setEditContent}
              handleEditMessage={handleEditMessage}
              handleDeleteMessage={handleDeleteMessage}
              handleAddReaction={handleAddReaction}
              markRead={markRead}
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newDirectMessage}
              onChange={e => setNewDirectMessage(e.target.value)}
              className="flex-1 p-2 border rounded"
              placeholder="Type a message..."
            />
            <button onClick={handleSendDirectMessage} className="bg-[var(--accent)] text-white p-2 rounded">
              Send
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default DirectChatView;