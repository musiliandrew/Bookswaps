import { useState } from 'react';
import { Input, Button } from '../components/common';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

const EventForm = ({ onSubmit, isLoading }) => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to create an event');
      return;
    }
    if (formData.title.trim() && formData.date) {
      onSubmit(formData);
      setFormData({ title: '', description: '', date: '', location: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <Input
        label="Event Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="e.g., Book Club Meeting"
        className="bookish-input"
        required
      />
      <Input
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Event details..."
        className="bookish-input"
        type="textarea"
        rows={4}
      />
      <Input
        label="Date and Time"
        name="date"
        value={formData.date}
        onChange={handleChange}
        type="datetime-local"
        className="bookish-input"
        required
      />
      <Input
        label="Location"
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="e.g., Library Room 101"
        className="bookish-input"
      />
      <Button
        type="submit"
        className="bookish-button-enhanced w-full"
        disabled={isLoading || !formData.title.trim() || !formData.date || !isAuthenticated}
      >
        {isLoading ? 'Creating...' : 'Create Event'}
      </Button>
    </form>
  );
};

export default EventForm;

