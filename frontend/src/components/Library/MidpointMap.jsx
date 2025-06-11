import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useSwaps } from '../../hooks/useSwaps';
import ErrorMessage from '../Common/ErrorMessage';
import 'leaflet/dist/leaflet.css';

const MidpointMap = ({ swapId, className = '' }) => {
  const { getMidpoint, midpoint, isLoading, error } = useSwaps();
  const [position, setPosition] = useState([0, 0]);

  useEffect(() => {
    if (swapId) {
      getMidpoint({ swap_id: swapId });
    }
  }, [swapId, getMidpoint]);

  useEffect(() => {
    if (midpoint?.coordinates) {
      const [lat, lng] = midpoint.coordinates.split(',').map(Number);
      setPosition([lat, lng]);
    }
  }, [midpoint]);

  if (isLoading) {
    return (
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bookish-spinner mx-auto w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[var(--text)] font-['Open_Sans'] mt-2">Loading map...</p>
      </motion.div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!midpoint?.coordinates) {
    return (
      <motion.p
        className="text-[var(--text)] font-['Open_Sans'] text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        No midpoint available.
      </motion.p>
    );
  }

  return (
    <motion.div
      className={`bookish-glass p-4 rounded-xl ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <MapContainer center={position} zoom={13} style={{ height: '300px', width: '100%' }} className="rounded-xl">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position}>
          <Popup>Swap Midpoint: {midpoint.city || 'Unknown'}</Popup>
        </Marker>
      </MapContainer>
    </motion.div>
  );
};

export default MidpointMap;