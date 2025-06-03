import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useSwaps } from '../../hooks/useSwaps';
import { toast } from 'react-toastify';

const QRCodeDisplay = ({ swapId }) => {
  const { getSwapQR, isLoading, error } = useSwaps();
  const [qrCodeUrl, setQrCodeUrl] = useState(null);

  useEffect(() => {
    const fetchQRCode = async () => {
      const url = await getSwapQR(swapId);
      if (url) {
        setQrCodeUrl(url);
      }
    };
    fetchQRCode();
  }, [swapId, getSwapQR]);

  if (isLoading) return <div className="text-center text-gray-600">Loading QR Code...</div>;
  if (error) {
    toast.error(error);
    return <div className="text-red-500 text-center">Error: {error}</div>;
  }
  if (!qrCodeUrl) return <div className="text-center text-gray-600">No QR Code available</div>;

  return (
    <div className="bookish-shadow p-4 bg-white rounded-lg flex justify-center">
      <QRCodeCanvas
        value={qrCodeUrl}
        size={256}
        bgColor="#FFFFFF"
        fgColor="#2F2F2F"
        level="H"
        includeMargin={true}
        className="rounded-lg"
      />
    </div>
  );
};

export default QRCodeDisplay;