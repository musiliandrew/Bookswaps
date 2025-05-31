import { useNavigate } from 'react-router-dom';
import { useSwaps } from '../hooks/useSwaps';
import { LocationForm } from '../components/swaps/LocationForm';

const AddLocationPage = () => {
  const navigate = useNavigate();
  const { addLocation, isLoading, error } = useSwaps();

  const handleSubmit = async (formData) => {
    const response = await addLocation(formData);
    if (response) {
      navigate('/swaps'); // Redirect to swaps page
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Add Meetup Location</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <LocationForm onSubmit={handleSubmit} isLoading={isLoading} />
      <div className="mt-4 text-gray-600">
        <p>Note: Coordinates are optional. For precise locations, consider using a map tool (coming soon).</p>
      </div>
    </div>
  );
};

export default AddLocationPage;