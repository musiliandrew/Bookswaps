import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useDiscussions } from '../../hooks/useDiscussions';
import { useAuth } from '../../hooks/useAuth';
import Input from '../Common/Input';
import Button from '../Common/Button';

const PostForm = ({ bookOptions = [], societyOptions = [], className = '' }) => {
  const { createDiscussion, isLoading } = useDiscussions();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    book_id: '',
    society_id: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
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
    if (!validateForm()) return;
    try {
      await createDiscussion(formData);
      toast.success('Discussion created!');
      setFormData({ title: '', content: '', book_id: '', society_id: '' });
    } catch {
      toast.error('Failed to create discussion');
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`bookish-glass p-6 rounded-xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-['Lora'] text-gradient mb-4">Create a Discussion</h2>
      <Input
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="e.g., Thoughts on this book?"
        className="bookish-input"
        error={errors.title}
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
        error={errors.content}
      />
      <div>
        <label className="block text-sm font-['Lora'] text-[var(--primary)]">Related Book</label>
        <select
          name="book_id"
          value={formData.book_id}
          onChange={handleChange}
          className="bookish-input w-full"
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
        <label className="block text-sm font-['Lora'] text-[var(--primary)]">Related Society</label>
        <select
          name="society_id"
          value={formData.society_id}
          onChange={handleChange}
          className="bookish-input w-full"
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
        className="bookish-button-enhanced bg-[var(--accent)] text-white w-full"
        disabled={isLoading || !formData.title.trim() || !formData.content.trim()}
      />
    </motion.form>
  );
};

export default PostForm;
