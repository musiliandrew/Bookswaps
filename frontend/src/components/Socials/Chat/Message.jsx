import React from 'react';
import { toast } from 'react-toastify';

const Message = ({ msg, isSociety, isPinned, editingMessageId, setEditingMessageId, editContent, setEditContent, handleEditMessage, handleDeleteMessage, handleAddReaction, markRead, handlePinMessage }) => {
  const onEditMessage = async (id, isSociety) => {
    try {
      const response = await handleEditMessage(id, isSociety);
      if (response) {
        toast.success('Message updated successfully!');
        setEditingMessageId(null);
      } else {
        toast.error('Failed to update message.');
      }
    } catch (error) {
      toast.error('Error updating message: ' + error.message);
    }
  };

  const onDeleteMessage = async (id, isSociety) => {
    try {
      const response = await handleDeleteMessage(id, isSociety);
      if (response) {
        toast.success('Message deleted successfully!');
      } else {
        toast.error('Failed to delete message.');
      }
    } catch (error) {
      toast.error('Error deleting message: ' + error.message);
    }
  };

  const onAddReaction = async (id, emoji, isSociety) => {
    try {
      const response = await handleAddReaction(id, emoji, isSociety);
      if (response) {
        toast.success(`Reaction ${emoji} added!`);
      } else {
        toast.error('Failed to add reaction.');
      }
    } catch (error) {
      toast.error('Error adding reaction: ' + error.message);
    }
  };

  const onMarkRead = async (id) => {
    try {
      const response = await markRead(id);
      if (response) {
        toast.success('Message marked as read!');
      } else {
        toast.error('Failed to mark message as read.');
      }
    } catch (error) {
      toast.error('Error marking message as read: ' + error.message);
    }
  };

  const onPinMessage = async (id) => {
    try {
      const response = await handlePinMessage(id);
      if (response) {
        toast.success('Message pinned successfully!');
      } else {
        toast.error('Failed to pin message.');
      }
    } catch (error) {
      toast.error('Error pinning message: ' + error.message);
    }
  };

  return (
    <div className={`p-2 ${isPinned ? 'border-l-4 border-yellow-500' : ''}`}>
      {editingMessageId === msg.id ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={() => onEditMessage(msg.id, isSociety)}
            className="bg-[var(--accent)] text-white p-2 rounded"
          >
            Save
          </button>
          <button
            onClick={() => setEditingMessageId(null)}
            className="bg-gray-500 text-white p-2 rounded"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <p>{msg.content}</p>
          <p className="text-sm text-gray-600">
            By {msg.sender_name || msg.user} | Status: {msg.status || 'Sent'}
          </p>
          <div className="flex gap-2 text-sm">
            {msg.reactions?.map(r => (
              <span key={r.id}>{r.emoji} ({r.count || 1})</span>
            ))}
            <button onClick={() => onAddReaction(msg.id, '👍', isSociety)}>👍</button>
            <button onClick={() => onAddReaction(msg.id, '❤️', isSociety)}>❤️</button>
            <button onClick={() => onAddReaction(msg.id, '😂', isSociety)}>😂</button>
            {msg.is_owner && (
              <>
                <button
                  onClick={() => {
                    setEditingMessageId(msg.id);
                    setEditContent(msg.content);
                  }}
                  className="text-[var(--accent)]"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteMessage(msg.id, isSociety)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </>
            )}
            {!isSociety && msg.status !== 'READ' && (
              <button
                onClick={() => onMarkRead(msg.id)}
                className="text-green-500"
              >
                Mark Read
              </button>
            )}
            {isSociety && msg.can_pin && (
              <button
                onClick={() => onPinMessage(msg.id)}
                className="text-purple-500"
              >
                Pin
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Message;