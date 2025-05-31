import { useState } from 'react';
import { Input, Button } from '../components/common';

const LocationForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    coordinates: '',
    city: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Location Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g., Central Library"
        className="bookish-input"
        required
      />
      <Input
        label="Type"
        name="type"
        value={formData.type}
        onChange={handleChange}
        placeholder="e.g., Library, Cafe"
        className="bookish-input"
        required
      />
      <Input
        label="Coordinates (lat,long)"
        name="coordinates"
        value={formData.coordinates}
        onChange={handleChange}
        placeholder="e.g., 40.7128,-74.0060"
        className="bookish-input"
      />
      <Input
        label="City"
        name="city"
        value={formData.city}
        onChange={handleChange}
        placeholder="e.g., Nairobi"
        className="bookish-input"
        required
      />
      <Button
        type="submit"
        disabled={isLoading || !formData.name || !formData.type || !formData.city}
        className="bookish-button-enhanced"
      >
        {isLoading ? 'Adding...' : 'Add Location'}
      </Button>
    </form>
  );
};

export default LocationForm;