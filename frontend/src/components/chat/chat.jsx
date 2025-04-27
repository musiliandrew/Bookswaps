import { useState, useEffect } from 'react';
import axios from 'axios';

const Chat = ({ userId, societyId }) => {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [reaction, setReaction] = useState('');

  const fetchMessages = async () => {
    const token = localStorage.getItem('token');
    if (userId) {
      const response = await axios.get(`/api/chat/messages/?receiver_id=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.results);
    } else if (societyId) {
      const response = await axios.get(`/api/chat/societies/${societyId}/messages/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.results);
    }
  };

  const sendMessage = async () => {
    const token = localStorage.getItem('token');
    if (userId) {
      await axios.post('/api/chat/messages/', { receiver_id: userId, content }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } else if (societyId) {
      await axios.post(`/api/chat/societies/${societyId}/messages/send/`, { content }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    setContent('');
    fetchMessages();
  };

  const editMessage = async (messageId, isSociety) => {
    const token = localStorage.getItem('token');
    const url = isSociety
      ? `/api/chat/societies/${societyId}/messages/${messageId}/edit/`
      : `/api/chat/messages/${messageId}/edit/`;
    await axios.patch(url, { content }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setContent('');
    fetchMessages();
  };

  const deleteMessage = async (messageId, isSociety) => {
    const token = localStorage.getItem('token');
    const url = isSociety
      ? `/api/chat/societies/${societyId}/messages/${messageId}/delete/`
      : `/api/chat/messages/${messageId}/delete/`;
    await axios.delete(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchMessages();
  };

  const addReaction = async (messageId, isSociety) => {
    const token = localStorage.getItem('token');
    const url = isSociety
      ? `/api/chat/societies/${societyId}/messages/${messageId}/react/`
      : `/api/chat/messages/${messageId}/react/`;
    await axios.post(url, { reaction_type: reaction }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
  }, [userId, societyId]);

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.message_id || msg.chat_id}>
          <p>{msg.content} by {msg.user?.username || msg.sender.username}</p>
          {msg.can_note && (
            <button onClick={() => setContent(`Replying to ${msg.content}...`)}>
              Note
            </button>
          )}
          <button onClick={() => editMessage(msg.message_id || msg.chat_id, !!societyId)}>
            Edit
          </button>
          <button onClick={() => deleteMessage(msg.message_id || msg.chat_id, !!societyId)}>
            Delete
          </button>
          <select value={reaction} onChange={(e) => setReaction(e.target.value)}>
            <option value="">Select Reaction</option>
            <option value="LIKE">Like</option>
            <option value="LOVE">Love</option>
            <option value="HAHA">Haha</option>
            <option value="WOW">Wow</option>
            <option value="SAD">Sad</option>
          </select>
          <button onClick={() => addReaction(msg.message_id || msg.chat_id, !!societyId)}>
            React
          </button>
          <div>
            Reactions: {msg.reactions.map((r) => `${r.user.username}: ${r.reaction_type}`).join(', ')}
          </div>
        </div>
      ))}
      <input value={content} onChange={(e) => setContent(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;