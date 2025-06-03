import { useState } from 'react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const DiscussionForm = ({ onSubmit, isLoading }) => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to create a discussion');
      return;
    }
    if (formData.title.trim() && formData.content.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
      <Input
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="e.g., Thoughts on this book?"
        className="bookish-input"
        required
      />
      <Input
        label="Content"
        name="content"
        value={formData.content}
        onChange={handleChange}
        placeholder="Share your thoughts..."
        className="bookish-input"
        type="textarea"
        rows={5}
        required
      />
      <Button
        type="submit"
        className="bookish-button-enhanced w-full"
        disabled={isLoading || !formData.title.trim() || !formData.content.trim() || !isAuthenticated}
      >
        {isLoading ? 'Creating...' : 'Create Discussion'}
      </Button>
    </form>
  );
};

export default DiscussionForm;