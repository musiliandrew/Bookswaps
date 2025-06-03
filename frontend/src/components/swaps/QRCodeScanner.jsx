import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useSwaps } from '../../hooks/useSwaps';
import { toast } from 'react-toastify';
import { useCallback } from 'react';

const QRCodeScanner = ({ swapId }) => {
  const { confirmSwap, isLoading } = useSwaps();
  const [scanError, setScanError] = useState(null);

  const handleScan = useCallback(
    async (data) => {
      if (data) {
        try {
          await confirmSwap(swapId, data);
          toast.success('Swap confirmed successfully!');
        } catch {
          setScanError('Failed to confirm swap with scanned QR code');
          toast.error('Failed to confirm swap with scanned QR code');
        }
      }
    },
    [confirmSwap, swapId]
  );

  const handleScanRef = useRef(handleScan);

  useEffect(() => {
    handleScanRef.current = handleScan;
  }, [handleScan]);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(
      (decodedText) => {
        handleScanRef.current(decodedText);
        scanner.clear(); // stop scanning after first valid scan
      },
      (errorMessage) => {
        console.warn('QR scan error:', errorMessage);
      }
    );

    // Clean up on unmount
    return () => {
      scanner.clear().catch((err) => {
        console.error('Failed to clear QR scanner', err);
      });
    };
  }, []);

  return (
    <div className="bookish-shadow p-4 bg-white rounded-lg">
      <div id="qr-reader" className="w-full max-w-md mx-auto"></div>
      {scanError && (
        <div className="text-red-500 text-center mt-2">{scanError}</div>
      )}
      {isLoading && (
        <div className="text-center text-gray-600 mt-2">Processing...</div>
      )}
    </div>
  );
};

export default QRCodeScanner;
