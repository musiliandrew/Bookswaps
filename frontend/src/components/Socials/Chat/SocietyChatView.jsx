import React from 'react';
import { motion } from 'framer-motion';
import MessagesList from './MessagesList';

const SocietyChatView = ({ societyId, societies, societyMessages, isSocietiesLoading, newSocietyMessage, setNewSocietyMessage, sendSocietyMessage, handleEditMessage, handleDeleteMessage, handleAddReaction, handlePinMessage, editingMessageId, setEditingMessageId, editContent, setEditContent }) => {
  const society = societies.find(s => s.id === societyId);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-4 rounded shadow"
    >
      <h2 className="text-2xl font-bold mb-2">{society?.name} Chat</h2>
      {isSocietiesLoading ? (
        <div>Loading messages...</div>
      ) : (
        <>
          <div className="h-96 overflow-y-auto border p-2 mb-4">
            <MessagesList
              messages={societyMessages}
              isSociety={true}
              editingMessageId={editingMessageId}
              setEditingMessageId={setEditingMessageId}
              editContent={editContent}
              setEditContent={setEditContent}
              handleEditMessage={handleEditMessage}
              handleDeleteMessage={handleDeleteMessage}
              handleAddReaction={handleAddReaction}
              handlePinMessage={handlePinMessage}
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSocietyMessage}
              onChange={e => setNewSocietyMessage(e.target.value)}
              className="flex-1 p-2 border rounded"
              placeholder="Type a message..."
            />
            <button onClick={() => sendSocietyMessage(societyId, newSocietyMessage).then(() => setNewSocietyMessage(''))} className="bg-[var(--accent)] text-white p-2 rounded">
              Send
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default SocietyChatView;