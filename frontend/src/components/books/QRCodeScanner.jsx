import { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { useSwaps } from '../hooks/useSwaps';
import { Button } from '../components/common';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const QRCodeScanner = ({ swapId }) => {
  const { confirmSwapQR, isLoading, error } = useSwaps();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);

  const handleScan = async (data) => {
    if (data && isAuthenticated && !scanResult) {
      setScanResult(data);
      await confirmSwapQR(swapId, data);
      if (!error) {
        toast.success('Swap confirmed! Redirecting...');
        setTimeout(() => navigate('/swaps'), 2000);
      }
      setScanResult(null);
    }
  };

  const handleError = (err) => {
    toast.error('Error accessing camera');
    console.error(err);
  };

  if (!isAuthenticated) {
    return <div className="text-red-500">Please sign in to scan QR codes</div>;
  }

  return (
    <div className="bookish-shadow p-4 bg-white rounded-lg text-center">
      <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <QrReader
        onResult={(result, error) => {
          if (result) {
            handleScan(result.text);
          }
          if (error) {
            handleError(error);
          }
        }}
        style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}
        constraints={{ facingMode: 'environment' }}
      />
      {scanResult && <p className="mt-2 text-gray-600">Scanned: {scanResult}</p>}
      <Button
        onClick={() => setScanResult(null)}
        className="bookish-button-enhanced mt-4"
        disabled={isLoading}
      >
        Scan Again
      </Button>
    </div>
  );
};

export default QRCodeScanner;