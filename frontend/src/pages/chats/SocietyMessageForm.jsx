import { useState } from 'react';
import { Input, Button } from '../components/common';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

const SocietyMessageForm = ({ onSubmit, isLoading }) => {
  const [content, setContent] = useState('');
  const { isAuthenticated } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to send messages');
      return;
    }
    if (content.trim()) {
      onSubmit(content); // Use WebSocket sendMessage
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex space-x-2">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your message..."
        className="bookish-input flex-grow"
        disabled={isLoading || !isAuthenticated}
      />
      <Button
        type="submit"
        className="bookish-button-enhanced"
        disabled={isLoading || !content.trim() || !isAuthenticated}
      >
        Send
      </Button>
    </form>
  );
};

export default SocietyMessageForm;