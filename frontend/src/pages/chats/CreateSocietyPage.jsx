import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useChat } from '../../hooks/useChat';
import { useDiscussions } from '../../hooks/useDiscussions';
import { useAuth } from '../../hooks/useAuth';
import SocietyForm from '../../components/chats/SocietyForm'; // Fixed import

const CreateSocietyPage = () => {
  const navigate = useNavigate();
  const { createSociety, isLoading, error } = useChat();
  const { getBooks } = useDiscussions();
  const { profile } = useAuth();
  const [bookOptions, setBookOptions] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const books = await getBooks();
        setBookOptions(books || []);
      } catch (err) {
        console.error('Fetch books error:', err);
        toast.error('Failed to load books');
      }
    };
    fetchBooks();
  }, [getBooks]);

  useEffect(() => {
    if (error) {
      toast.error(error || 'Error creating society');
    }
  }, [error]);

  const handleSubmit = async (formData) => {
    try {
      const response = await createSociety(formData);
      if (response) {
        navigate(`/societies/${response.id}`);
        toast.success('Society created successfully!');
        if (profile?.societies_created >= 3) {
          toast.success('🎉 Badge Earned: Community Builder (3 Societies Created)!');
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Failed to create society');
    }
  };

  return (
    <motion.div
      className="container mx-auto p-4 bookish-gradient min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      role="main"
      aria-labelledby="create-society-title"
    >
      <motion.h1
        id="create-society-title"
        className="text-3xl font-bold font-['Playfair_Display'] text-[var(--primary)] mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Create a Society
      </motion.h1>
      <SocietyForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        bookOptions={bookOptions}
      />
    </motion.div>
  );
};

export default CreateSocietyPage;