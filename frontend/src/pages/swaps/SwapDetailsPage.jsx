import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { toast } from 'react-toastify';
import { useSwaps } from '../../hooks/useSwaps';
import { useAuth } from '../../hooks/useAuth';
import { useDiscussions } from '../../hooks/useDiscussions';
import QRCodeDisplay from '../../components/swaps/QRCodeDisplay';
import QRCodeScanner from '../../components/swaps/QRCodeScanner';
import Button from '../../components/common/Button'; 

const SwapDetailsPage = () => {
  const { swapId } = useParams();
  const navigate = useNavigate();
  const { getSwapDetails, swapDetails, isLoading, error, confirmSwap, cancelSwap } = useSwaps();
  const { user, profile } = useAuth();
  const { createPost } = useDiscussions();
  const [showShareCard, setShowShareCard] = useState(false);

  useEffect(() => {
    if (swapId) {
      getSwapDetails(swapId).catch(() => toast.error('Failed to load swap details'));
    }
  }, [swapId, getSwapDetails]);

  useEffect(() => {
    if (error) {
      toast.error(error || 'Error loading swap details');
    }
    if (swapDetails?.status === 'confirmed' && profile?.swaps_count >= 3) {
      toast.success('🎉 Badge Earned: Swapper (3 Swaps)!');
    }
  }, [error, swapDetails, profile]);

  const handleConfirm = async () => {
    try {
      await confirmSwap(swapId);
      toast.success('Swap confirmed!');
      navigate('/swaps');
    } catch (err) {
      console.error('Confirm error:', err);
      toast.error('Failed to confirm swap');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSwap(swapId);
      toast.success('Swap cancelled');
      navigate('/swaps');
    } catch (err) {
      console.error('Cancel error:', err);
      toast.error('Failed to cancel swap');
    }
  };

  const handleDiscuss = async () => {
    if (!user) {
      toast.error('Please sign in to discuss');
      navigate('/login');
      return;
    }
    try {
      await createPost({
        content: `Just swapped ${swapDetails.book_title}! What did you think about it?`,
        book_id: swapDetails.book_id,
      });
      toast.success('Discussion posted!');
      navigate('/discussions');
    } catch (err) {
      console.error('Discuss error:', err);
      toast.error('Failed to create discussion');
    }
  };

  const handleShare = () => {
    setShowShareCard(true);
  };

  if (isLoading) return <div className="text-center p-4">Loading...</div>;
  if (!swapDetails) return <div className="text-center p-4 text-red-500">Swap not found</div>;

  const isInitiator = user && swapDetails.initiator?.id === user.id;
  const isRecipient = user && swapDetails.recipient?.id === user.id;
  const canConfirm = swapDetails.status === 'accepted' && (isInitiator || isRecipient);
  const canCancel = !['confirmed', 'cancelled'].includes(swapDetails.status) && (isInitiator || isRecipient);

  return (
    <motion.div
      className="container mx-auto p-4 bookish-gradient"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-4 font-['Playfair-display']">Swap #{swapDetails.id}</h1>
      <motion.div
        className="bookish-shadow p-4 bg-white rounded-lg shadow-lg mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={swapDetails.book_image || '/assets/book.svg'}
            alt={swapDetails.book_title}
            className="w-48 h-64 object-cover rounded-lg shadow-md"
          />
          <div>
            <p className="text-lg font-semibold">{swapDetails.book_title}</p>
            <p className="text-gray-600">Status: {swapDetails.status}</p>
            <p className="text-gray-600">Initiator: {swapDetails.initiator?.username || 'Unknown'}</p>
            <p className="text-gray-600">Recipient: {swapDetails.recipient?.username || 'N/A'}</p>
            <p className="text-gray-600">Details: {swapDetails?.details || 'No additional details'}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold mb-2">Swap Confirmation</h2>
        {isInitiator && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Your QR Code</h3>
            <QRCodeDisplay swapDisplay swapId={swapId} aria-label="QR code for swap confirmation" />
          </div>
        )}
        {isRecipient && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
            <QRCodeScanner swapId={swapId} aria-label="Scan QR code for swap confirmation" />
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            text="Confirm Swap"
            onClick={handleConfirm}
            className="bookish-button-enhanced bg-green-600 hover:bg-green-700"
            disabled={isLoading || !canConfirm}
            aria-disabled={isLoading || !canConfirm}
          />
          <Button
            text="Cancel Swap"
            onClick={handleCancel}
            className="bookish-button-enhanced bg-red-600 hover:bg-red-700"
            disabled={isLoading || !canCancel}
            aria-disabled={isLoading || !canCancel}
          />
          <Button
            text="Discuss Book"
            onClick={handleDiscuss}
            className="bookish-button-enhanced bg-orange-600 hover:bg-orange-700"
            disabled={isLoading}
            aria-disabled={isLoading}
          />
          <Button
            text="Share Swap"
            onClick={handleShare}
            className="bookish-button-enhanced bg-teal-600 hover:bg-teal-700"
            disabled={isLoading}
            aria-disabled={isLoading}
          />
        </div>
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
                  Swap: {swapDetails.book_title}
                </Text>
                <Text position={[0, 0, 0.1]} fontSize={0.15} color="white">
                  With {swapDetails.recipient?.username || 'User'}
                </Text>
              </mesh>
            </Canvas>
            <Button
              text="Share on X"
              onClick={() => console.log('Share to X')}
              className="mt-2 bg-blue-600 hover:bg-blue-700"
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SwapDetailsPage;