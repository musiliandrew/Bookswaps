import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSwaps } from '../hooks/useSwaps';
import { useAuth } from '../hooks/useAuth';
import { QRCodeDisplay } from '../components/swaps/QRCodeDisplay';
import { QRCodeScanner } from '../components/swaps/QRCodeScanner';
import { Button } from '../components/common';

const SwapDetailsPage = () => {
  const { swapId } = useParams();
  const navigate = useNavigate();
  const { getSwapDetails, swapDetails, isLoading, error, confirmSwap, cancelSwap } = useSwaps();
  const { user } = useAuth();

  useEffect(() => {
    if (swapId) {
      getSwapDetails(swapId);
    }
  }, [swapId, getSwapDetails]);

  const handleConfirm = async () => {
    await confirmSwap(swapId);
    navigate('/swaps');
  };

  const handleCancel = async () => {
    await cancelSwap(swapId);
    navigate('/swaps');
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!swapDetails) return <div>Swap not found</div>;

  const isInitiator = user && swapDetails.initiator?.id === user.id;
  const isRecipient = user && swapDetails.recipient?.id === user.id;
  const canConfirm = swapDetails.status === 'accepted' && (isInitiator || isRecipient);
  const canCancel = !['confirmed', 'cancelled'].includes(swapDetails.status) && (isInitiator || isRecipient);

  return (
    <div className="container mx-auto p-4 bookish-gradient">
      <h1 className="text-3xl font-bold mb-4">Swap #{swapDetails.id}</h1>
      <div className="bookish-shadow p-4 bg-white rounded-lg mb-4">
        <p className="text-lg font-semibold">Book: {swapDetails.book_title}</p>
        <p className="text-gray-600">Status: {swapDetails.status}</p>
        <p className="text-gray-600">Initiator: {swapDetails.initiator?.username || 'Unknown'}</p>
        <p className="text-gray-600">Recipient: {swapDetails.recipient?.username || 'N/A'}</p>
        <p className="text-gray-600">Details: {swapDetails.details || 'No additional details'}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold mb-2">Swap Confirmation</h2>
        {isInitiator && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Your QR Code</h3>
            <QRCodeDisplay swapId={swapId} />
          </div>
        )}
        {isRecipient && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
            <QRCodeScanner swapId={swapId} />
          </div>
        )}
        <div className="flex space-x-2">
          <Button
            onClick={handleConfirm}
            className="bookish-button-enhanced"
            disabled={isLoading || !canConfirm}
          >
            Confirm Swap
          </Button>
          <Button
            onClick={handleCancel}
            className="bookish-button bg-danger hover:bg-red-600"
            disabled={isLoading || !canCancel}
          >
            Cancel Swap
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SwapDetailsPage;