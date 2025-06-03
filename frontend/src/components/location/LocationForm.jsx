import { useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const LocationForm = ({ onSubmit, isLoading }) => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    coordinates: '',
    city: '',
  });
  const [errors, setErrors] = useState({});
  const [showShareCard, setShowShareCard] = useState(false);

  const validateCoordinates = (coords) => {
    if (!coords) return true;
    const regex = /^-?\d+\.\d+,-?\d+\.\d+$/;
    return regex.test(coords);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error on change
    if (name === 'coordinates' && value && !validateCoordinates(value)) {
      setErrors((prev) => ({ ...prev, coordinates: 'Invalid format (e.g., 40.7128,-74.0060)' }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCoordinates(formData.coordinates)) {
      setErrors((prev) => ({ ...prev, coordinates: 'Invalid format (e.g., 40.7128,-74.0060)' }));
      return;
    }

    try {
      await onSubmit(formData);
      toast.success('Location added!');
      setShowShareCard(true);
      if (profile?.locations_added >= 3) {
        toast.success('🎉 Badge Earned: Location Scout (3 Locations)!');
      }
      setFormData({ name: '', type: '', coordinates: '', city: '' });
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Failed to add location');
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded-lg bookish-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="form"
      aria-labelledby="location-form-title"
    >
      <motion.h2
        id="location-form-title"
        className="text-2xl font-['Playfair_Display'] text-[#FF6F61] mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Add a Swap Location
      </motion.h2>

      <Input
        label="Location Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g., Central Library"
        className="bookish-input"
        required
        aria-required="true"
      />
      <Input
        label="Type"
        name="type"
        value={formData.type}
        onChange={handleChange}
        placeholder="e.g., Library, Cafe"
        className="bookish-input"
        required
        aria-required="true"
      />
      <Input
        label="Coordinates (lat,long)"
        name="coordinates"
        value={formData.coordinates}
        onChange={handleChange}
        placeholder="e.g., 40.7128,-74.0060"
        className="bookish-input"
        error={errors.coordinates}
        aria-describedby={errors.coordinates ? 'coordinates-error' : undefined}
      />
      <Input
        label="City"
        name="city"
        value={formData.city}
        onChange={handleChange}
        placeholder="e.g., Nairobi"
        className="bookish-input"
        required
        aria-required="true"
      />
      <Button
        type="submit"
        text={isLoading ? 'Adding...' : 'Add Location'}
        disabled={isLoading || !formData.name || !formData.type || !formData.city || errors.coordinates}
        className="bookish-button-enhanced bg-[#FF6F61] hover:bg-[#e65a50]"
        aria-disabled={isLoading || !formData.name || !formData.type || !formData.city || errors.coordinates}
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
                <meshStandardMaterial color="#FF6F61" />
                <Text position={[0, 0.5, 0.1]} fontSize={0.2} color="white">
                  {formData.name || 'New Location'}
                </Text>
                <Text position={[0, 0, 0.1]} fontSize={0.15} color="white">
                  {formData.city || 'BookSwaps.io'}
                </Text>
              </mesh>
            </Canvas>
            <Button
              text="Share on X"
              onClick={() => console.log('Share to X')}
              className="mt-2 bg-blue-600 hover:bg-blue-700"
              aria-label="Share new location on X"
            />
          </div>
        </motion.div>
      )}
    </motion.form>
  );
};

export default LocationForm;