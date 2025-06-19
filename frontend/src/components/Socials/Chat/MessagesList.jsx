import React from 'react';
import Message from './Message';

const MessagesList = ({ messages, isSociety, editingMessageId, setEditingMessageId, editContent, setEditContent, handleEditMessage, handleDeleteMessage, handleAddReaction, markRead, handlePinMessage }) => {
  const pinned = messages.filter(m => m.is_pinned);
  const regular = messages.filter(m => !m.is_pinned);

  return (
    <>
      {pinned.length > 0 && (
        <div className="bg-yellow-100 p-2 mb-2 rounded">
          <h4 className="font-bold">Pinned Messages</h4>
          {pinned.map(msg => (
            <Message
              key={msg.id}
              msg={msg}
              isSociety={isSociety}
              isPinned={true}
              editingMessageId={editingMessageId}
              setEditingMessageId={setEditingMessageId}
              editContent={editContent}
              setEditContent={setEditContent}
              handleEditMessage={handleEditMessage}
              handleDeleteMessage={handleDeleteMessage}
              handleAddReaction={handleAddReaction}
              markRead={markRead}
              handlePinMessage={handlePinMessage}
            />
          ))}
        </div>
      )}
      {regular.map(msg => (
        <Message
          key={msg.id}
          msg={msg}
          isSociety={isSociety}
          isPinned={false}
          editingMessageId={editingMessageId}
          setEditingMessageId={setEditingMessageId}
          editContent={editContent}
          setEditContent={setEditContent}
          handleEditMessage={handleEditMessage}
          handleDeleteMessage={handleDeleteMessage}
          handleAddReaction={handleAddReaction}
          markRead={markRead}
          handlePinMessage={handlePinMessage}
        />
      ))}
    </>
  );
};

export default MessagesList;