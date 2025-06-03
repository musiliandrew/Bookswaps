import { useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { useDiscussions } from '../../hooks/useDiscussions';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button'; 

const EventForm = ({ onSubmit, isLoading }) => {
  const { isAuthenticated, profile } = useAuth();
  const { createPost } = useDiscussions();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
  });
  const [errors, setErrors] = useState({});
  const [showShareCard, setShowShareCard] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }
    if (formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }
    if (!formData.date) {
      newErrors.date = 'Date and time are required';
    } else if (new Date(formData.date) < new Date()) {
      newErrors.date = 'Event must be in the future';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear errors on change
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to create an event');
      return;
    }
    if (!validateForm()) {
      return;
    }
    try {
      await onSubmit(formData);
      toast.success('Event created!');
      setShowShareCard(true);
      if (profile?.events_added >= 3) {
        toast.success('🎉 Badge Earned: Event Organizer (3 Events)!');
      }
      setFormData({ title: '', description: '', date: '', location: '' });
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Failed to create event');
    }
  };

  const handleDiscuss = async () => {
    if (!isAuthenticated) {
      toast.warning('Please sign in to discuss');
      return;
    }
    try {
      await createPost({
        content: `Excited for ${formData.title} on ${new Date(formData.date).toLocaleString()}! What books or topics should we cover?`,
        event_id: 'new', // Placeholder; actual ID set by backend
      });
      toast.success('Discussion posted!');
    } catch (err) {
      console.error('Discuss error:', err);
      toast.error('Failed to post discussion');
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-lg mx-auto bg-white p-6 rounded-lg bookish-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="form"
      aria-labelledby="event-form-title"
    >
      <motion.h2
        id="event-form-title"
        className="text-2xl font-['Playfair_Display'] text-[#FF6F61] mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Create a Book Event
      </motion.h2>

      <Input
        label="Event Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="e.g., Book Club Meeting"
        className="bookish-input"
        required
        error={errors.title}
        aria-required="true"
        aria-describedby={errors.title ? 'title-error' : undefined}
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
        error={errors.description}
        aria-describedby={errors.description ? 'description-error' : undefined}
      />
      <Input
        label="Date and Time"
        name="date"
        value={formData.date}
        onChange={handleChange}
        type="datetime-local"
        className="bookish-input"
        required
        error={errors.date}
        aria-required="true"
        aria-describedby={errors.date ? 'date-error' : undefined}
      />
      <Input
        label="Location"
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="e.g., Library Room 101"
        className="bookish-input"
      />
      <div className="flex gap-2">
        <Button
          type="submit"
          text={isLoading ? 'Creating...' : 'Create Event'}
          className="bookish-button-enhanced bg-[#FF6F61] hover:bg-[#e65a50] flex-1"
          disabled={isLoading || !formData.title.trim() || !formData.date || !isAuthenticated}
          aria-disabled={isLoading || !formData.title.trim() || !formData.date || !isAuthenticated}
        />
        <Button
          text="Start Discussion"
          onClick={handleDiscuss}
          className="bookish-button-enhanced bg-orange-600 hover:bg-orange-700 flex-1"
          disabled={!formData.title || !isAuthenticated}
          aria-label="Start a discussion for the new event"
        />
      </div>

      {showShareCard && (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-64 w-full bookish-shadow">
            <Canvas>
              <ambientLight />
              <OrbitControls />
              <mesh>
                <boxGeometry args={[3, 2, 0.1]} />
                <meshStandardMaterial color="#FF6F61" />
                <Text position={[0, 0.5, 0.1]} fontSize={0.2} color="white">
                  {formData.title || 'New Event'}
                </Text>
                <Text position={[0, 0, 0.1]} fontSize={0.15} color="white">
                  {formData.date ? new Date(formData.date).toLocaleDateString() : 'BookSwaps.io'}
                </Text>
              </mesh>
            </Canvas>
            <Button
              text="Share on X"
              onClick={() => console.log('Share to X')}
              className="mt-2 bg-blue-600 hover:bg-blue-700"
              aria-label="Share new event on X"
            />
          </div>
        </motion.div>
      )}
    </motion.form>
  );
};

export default EventForm;