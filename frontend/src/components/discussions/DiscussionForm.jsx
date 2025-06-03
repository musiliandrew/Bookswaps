import { useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input'; 
import Button from '../../components/common/Button';

const DiscussionForm = ({ onSubmit, isLoading, bookOptions = [], societyOptions = [] }) => {
  const { isAuthenticated, profile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    book_id: '',
    society_id: '',
  });
  const [errors, setErrors] = useState({});
  const [showShareCard, setShowShareCard] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length > 2000) {
      newErrors.content = 'Content cannot exceed 2000 characters';
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
      toast.error('Please sign in to create a discussion');
      return;
    }
    if (!validateForm()) {
      return;
    }
    try {
      await onSubmit(formData);
      toast.success('Discussion created!');
      setShowShareCard(true);
      if (profile?.posts_created >= 3) {
        toast.success('🎉 Badge Earned: Thought Leader (3 Posts)!');
      }
      setFormData({ title: '', content: '', book_id: '', society_id: '' });
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Failed to create discussion');
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
      aria-labelledby="discussion-form-title"
    >
      <motion.h2
        id="discussion-form-title"
        className="text-2xl font-['Playfair_Display'] text-[var(--primary)] mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Create a Discussion
      </motion.h2>

      <Input
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="e.g., Thoughts on this book?"
        className="bookish-input"
        required
        error={errors.title}
        aria-required="true"
        aria-describedby={errors.title ? 'title-error' : undefined}
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
        error={errors.content}
        aria-required="true"
        aria-describedby={errors.content ? 'content-error' : undefined}
      />
      <div>
        <label htmlFor="book_id" className="block text-sm font-medium text-[var(--primary)] font-['Lora']">
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
      <div>
        <label htmlFor="society_id" className="block text-sm font-medium text-[var(--primary)] font-['Lora']">
          Related Society (Optional)
        </label>
        <select
          id="society_id"
          name="society_id"
          value={formData.society_id}
          onChange={handleChange}
          className="bookish-input mt-1 block w-full px-4 py-3 rounded-xl font-['Open_Sans'] text-[var(--text)]"
          aria-label="Select related society"
        >
          <option value="">None</option>
          {societyOptions.map((society) => (
            <option key={society.id} value={society.id}>
              {society.name}
            </option>
          ))}
        </select>
      </div>
      <Button
        type="submit"
        text={isLoading ? 'Creating...' : 'Create Discussion'}
        className="bookish-button-enhanced bg-[var(--primary)] hover:bg-[var(--accent)] w-full"
        disabled={isLoading || !formData.title.trim() || !formData.content.trim() || !isAuthenticated}
        aria-disabled={isLoading || !formData.title.trim() || !formData.content.trim() || !isAuthenticated}
      />
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
                  {formData.title || 'New Discussion'}
                </Text>
                <Text position={[0, 0, 0.1]} fontSize={0.15} color="white">
                  BookSwaps.io
                </Text>
              </mesh>
            </Canvas>
            <Button
              text="Share on X"
              onClick={() => console.log('Share to X')}
              className="mt-2 bg-blue-600 hover:bg-blue-700"
              aria-label="Share new discussion on X"
            />
          </div>
        </motion.div>
      )}
    </motion.form>
  );
};

export default DiscussionForm;