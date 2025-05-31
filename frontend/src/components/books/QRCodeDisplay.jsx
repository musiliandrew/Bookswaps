import { useEffect } from 'react';
import QRCode from 'qrcode.react';
import { useSwaps } from '../hooks/useSwaps';

const QRCodeDisplay = ({ swapId }) => {
  const { getSwapQR, qrData, isLoading, error } = useSwaps();

  useEffect(() => {
    if (swapId) {
      getSwapQR(swapId);
    }
  }, [swapId, getSwapQR]);

  if (isLoading) return <div>Loading QR code...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!qrData) return <div>No QR code available</div>;

  return (
    <div className="bookish-shadow p-4 bg-white rounded-lg text-center">
      <QRCode value={qrData} size={200} />
      <p className="mt-2 text-gray-600">Scan this QR code to confirm the swap</p>
    </div>
  );
};

export default QRCodeDisplay;