import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useDiscussions } from '../../hooks/useDiscussions';
import DiscussionForm from '../../components/discussions/DiscussionForm';

const CreateDiscussionPage = () => {
  const navigate = useNavigate();
  const { createPost, getBooks, getSocieties, isLoading, error } = useDiscussions();
  const [bookOptions, setBookOptions] = useState([]);
  const [societyOptions, setSocietyOptions] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const books = await getBooks();
        const societies = await getSocieties();
        setBookOptions(books || []);
        setSocietyOptions(societies || []);
      } catch (err) {
        console.error('Fetch options error:', err);
        toast.error('Failed to load books or societies');
      }
    };
    fetchOptions();
  }, [getBooks, getSocieties]);

  useEffect(() => {
    if (error) {
      toast.error(error || 'Error creating discussion');
    }
  }, [error]);

  const handleSubmit = async (formData) => {
    try {
      const response = await createPost(formData);
      if (response) {
        navigate(`/discussions/${response.id}`);
        toast.success('Discussion created successfully!');
      }
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Failed to create discussion');
    }
  };

  return (
    <motion.div
      className="container mx-auto p-4 bookish-gradient min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      role="main"
      aria-labelledby="create-discussion-title"
    >
      <motion.h1
        id="create-discussion-title"
        className="text-3xl font-bold font-['Playfair_Display'] text-[var(--primary)] mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Start a Discussion
      </motion.h1>
      <DiscussionForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        bookOptions={bookOptions}
        societyOptions={societyOptions}
      />
    </motion.div>
  );
};

export default CreateDiscussionPage;