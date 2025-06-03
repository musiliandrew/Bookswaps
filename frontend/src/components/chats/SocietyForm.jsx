import { useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { useDiscussions } from '../../hooks/useDiscussions';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const SocietyForm = ({ onSubmit, isLoading, bookOptions = [] }) => {
  const { isAuthenticated, profile } = useAuth();
  const { createPost } = useDiscussions();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'public',
    focus: '',
    book_id: '',
  });
  const [errors, setErrors] = useState({});
  const [showShareCard, setShowShareCard] = useState(false);
  const [createdSocietyId, setCreatedSocietyId] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Society name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to create a society');
      return;
    }
    if (!validateForm()) {
      return;
    }
    try {
      const response = await onSubmit(formData);
      toast.success('Society created!');
      setShowShareCard(true);
      setCreatedSocietyId(response?.id || null);
      if (profile?.societies_created >= 1) {
        toast.success('🎉 Badge Earned: Society Founder!');
      }
      setFormData({ name: '', description: '', visibility: 'public', focus: '', book_id: '' });
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Failed to create society');
    }
  };

  const handleDiscuss = async () => {
    if (!isAuthenticated) {
      toast.warning('Please sign in to discuss');
      return;
    }
    if (!formData.focus && !formData.book_id) {
      toast.info('Please specify a focus or select a book to start a discussion');
      return;
    }
    try {
      const bookTitle = bookOptions.find((book) => book.id === formData.book_id)?.title || '';
      await createPost({
        content: `Just created ${formData.name}${formData.focus ? `, focused on ${formData.focus}` : ''}${
          bookTitle ? `, discussing ${bookTitle}` : ''
        }! What books should we explore?`,
        society_id: createdSocietyId || null,
        book_id: formData.book_id || null,
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
      aria-labelledby="society-form-title"
    >
      <motion.h2
        id="society-form-title"
        className="text-2xl font-['Playfair_Display'] text-[var(--primary)] mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Create a Book Society
      </motion.h2>

      <Input
        label="Society Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g., Mystery Book Club"
        className="bookish-input"
        required
        error={errors.name}
        aria-required="true"
        aria-describedby={errors.name ? 'name-error' : undefined}
      />
      <Input
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Describe your society"
        className="bookish-input"
        type="textarea"
        rows={5}
        required
        error={errors.description}
        aria-required="true"
        aria-describedby={errors.description ? 'description-error' : undefined}
      />
      <div>
        <label
          htmlFor="visibility"
          className="block text-sm font-medium text-[var(--primary)] font-['Lora']"
        >
          Visibility
        </label>
        <select
          id="visibility"
          name="visibility"
          value={formData.visibility}
          onChange={handleChange}
          className="bookish-input mt-1 block w-full px-4 py-3 rounded-xl font-['Open_Sans'] text-[var(--text)]"
          aria-label="Select society visibility"
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
        error={errors.focus}
        aria-describedby={errors.focus ? 'focus-error' : undefined}
      />
      <div>
        <label
          htmlFor="book_id"
          className="block text-sm font-medium text-[var(--primary)] font-['Lora']"
        >
          Related Book (Optional)
        </label>
        <select
          id="book_id"
          name="book_id"
          value={formData.book_id}
          onChange={handleChange}
          className="bookish-input mt-1 block w-full px-4 py-3 rounded-xl font-['Open_Sans'] text-[var(--text)]"
          aria-label="Select related book"
        >
          <option value="">None</option>
          {bookOptions.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          text={isLoading ? 'Creating...' : 'Create Society'}
          className="bookish-button-enhanced bg-[var(--primary)] hover:bg-[var(--accent)] flex-1"
          disabled={isLoading || !formData.name.trim() || !formData.description.trim() || !isAuthenticated}
          aria-disabled={isLoading || !formData.name.trim() || !formData.description.trim() || !isAuthenticated}
        />
        <Button
          text="Start Discussion"
          onClick={handleDiscuss}
          className="bookish-button-enhanced bg-orange-600 hover:bg-orange-700 flex-1"
          disabled={!formData.focus && !formData.book_id || !isAuthenticated}
          aria-label="Start a discussion for the new society"
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
                <meshStandardMaterial color="var(--primary)" />
                <Text position={[0, 0.5, 0.1]} fontSize={0.2} color="white">
                  {formData.name || 'New Society'}
                </Text>
                <Text position={[0, 0, 0.1]} fontSize={0.15} color="white">
                  {formData.focus || bookOptions.find((book) => book.id === formData.book_id)?.title || 'BookSwaps.io'}
                </Text>
              </mesh>
            </Canvas>
            <Button
              text="Share on X"
              onClick={() => console.log('Share to X')}
              className="mt-2 bg-blue-600 hover:bg-blue-700"
              aria-label="Share new society on X"
            />
          </div>
        </motion.div>
      )}
    </motion.form>
  );
};

export default SocietyForm;