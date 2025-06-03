import { useState } from 'react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const NoteForm = ({ onSubmit, isLoading }) => {
  const [content, setContent] = useState('');
  const { isAuthenticated } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to comment');
      return;
    }
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        className="bookish-input w-full"
        type="textarea"
        rows={3}
        disabled={isLoading || !isAuthenticated}
      />
      <Button
        type="submit"
        className="bookish-button-enhanced mt-2"
        disabled={isLoading || !content.trim() || !isAuthenticated}
      >
        Post Comment
      </Button>
    </form>
  );
};

export default NoteForm;