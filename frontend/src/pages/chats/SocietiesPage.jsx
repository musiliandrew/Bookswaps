import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { toast } from 'react-toastify';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import SocietyCard from '../../components/chats/SocietyCard'; // Fixed import
import Button from '../../components/common/Button';

const SocietiesPage = () => {
  const { getSocieties, joinSociety, societies, isLoading, error } = useChat();
  const { profile } = useAuth();
  const [showShareCard, setShowShareCard] = useState(false);

  useEffect(() => {
    getSocieties().catch(() => toast.error('Failed to load societies'));
  }, [getSocieties]);

  useEffect(() => {
    if (error) {
      toast.error(error || 'Error loading societies');
    }
    if (profile?.societies_created >= 1) {
      toast.success('🎉 Badge Earned: Society Founder!');
    }
  }, [error, profile]);

  const handleShare = () => {
    setShowShareCard(true);
  };

  if (isLoading && !societies.length) {
    return (
      <motion.div
        className="text-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Loading...
      </motion.div>
    );
  }

  return (
    <motion.div
      className="container mx-auto p-4 bookish-gradient min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      role="main"
      aria-labelledby="societies-title"
    >
      <div className="flex justify-between items-center mb-6">
        <motion.h1
          id="societies-title"
          className="text-3xl font-bold font-['Playfair_Display'] text-[#FF6F61]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Book Societies
        </motion.h1>
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Link to="/societies/new">
            <Button
              text="Create Society"
              className="bookish-button-enhanced bg-[#FF6F61] hover:bg-[#e65a50]"
              aria-label="Create a new society"
            />
          </Link>
          <Button
            text="Share Societies"
            onClick={handleShare}
            className="bookish-button-enhanced bg-teal-600 hover:bg-teal-700"
            disabled={!societies.length}
            aria-label="Share all societies"
          />
        </motion.div>
      </div>

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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        role="list"
      >
        <AnimatePresence>
          {societies.length ? (
            societies.map((society, index) => (
              <motion.div
                key={society.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                role="listitem"
              >
                <SocietyCard society={society} onJoin={joinSociety} />
              </motion.div>
            ))
          ) : (
            <motion.div
              className="text-center font-['Poppins'] text-[#333]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              No societies found.{' '}
              <Link to="/societies/new" className="text-[#FF6F61] hover:underline">
                Create one!
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {showShareCard && (
        <motion.div
          className="mt-8"
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
                  Book Societies
                </Text>
                <Text position={[0, 0, 0.1]} fontSize={0.15} color="white">
                  {societies.length} Communities
                </Text>
              </mesh>
            </Canvas>
            <Button
              text="Share on X"
              onClick={() => console.log('Share to X')}
              className="mt-2 bg-blue-600 hover:bg-blue-700"
              aria-label="Share all societies on X"
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SocietiesPage;