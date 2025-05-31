import { useState } from 'react';
import { Input, Button } from '../components/common';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

const SocietyForm = ({ onSubmit, isLoading }) => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'public',
    focus: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to create a society');
      return;
    }
    if (formData.name.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
      <Input
        label="Society Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g., Mystery Book Club"
        className="bookish-input"
        required
      />
      <Input
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Describe your society"
        className="bookish-input"
        type="textarea"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700">Visibility</label>
        <select
          name="visibility"
          value={formData.visibility}
          onChange={handleChange}
          className="bookish-input mt-1 block w-full"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>
      <Input
        label="Focus"
        name="focus"
        value={formData.focus}
        onChange={handleChange}
        placeholder="e.g., Science Fiction, Non-Fiction"
        className="bookish-input"
      />
      <Button
        type="submit"
        className="bookish-button-enhanced w-full"
        disabled={isLoading || !formData.name.trim() || !isAuthenticated}
      >
        {isLoading ? 'Creating...' : 'Create Society'}
      </Button>
    </form>
  );
};

export default SocietyForm;