import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useSwaps } from '../../hooks/useSwaps';
import { useAuth } from '../../hooks/useAuth';
import LocationForm from '../../components/location/LocationForm';
import Button from '../../components/common/Button';

const AddLocationPage = () => {
  const navigate = useNavigate();
  const { addLocation, isLoading, error } = useSwaps();
  const { user } = useAuth();

  const handleSubmit = async (formData) => {
    try {
      const response = await addLocation(formData);
      if (response) {
        toast.success('Location added successfully!');
        navigate('/swaps');
      }
    } catch (err) {
      console.error('Add location error:', err);
      toast.error('Failed to add location');
    }
  };

  const suggestSwap = () => {
    if (!user) {
      toast.warning('Please sign in to start a swap');
      navigate('/login');
      return;
    }
    navigate('/swaps/new');
  };

  return (
    <motion.div
      className="container mx-auto p-4 bookish-gradient min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      role="main"
      aria-labelledby="add-location-title"
    >
      <motion.h1
        id="add-location-title"
        className="text-3xl font-bold mb-6 font-['Playfair_Display'] text-[#FF6F61]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Add Meetup Location
      </motion.h1>

      {error && (
        <motion.div
          className="text-red-500 mb-4 bookish-shadow p-2 rounded"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          role="alert"
        >
          {error}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <LocationForm onSubmit={handleSubmit} isLoading={isLoading} />
      </motion.div>

      <motion.div
        className="mt-4 text-gray-600 font-['Poppins']"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <p>Note: Coordinates are optional. For precise locations, consider using a map tool (coming soon).</p>
      </motion.div>

      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Button
          text="Start a Swap at This Location"
          onClick={suggestSwap}
          className="bookish-button-enhanced bg-[#FF6F61] hover:bg-[#e65a50]"
          aria-label="Start a book swap using this location"
        />
      </motion.div>
    </motion.div>
  );
};

export default AddLocationPage;