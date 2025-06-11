import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { useSwaps } from '../../hooks/useSwaps';
import ErrorMessage from '../Common/ErrorMessage';

const QRCodeDisplay = ({ swapId, className = '' }) => {
  const { getSwapQR, qrData, isLoading, error } = useSwaps();

  useEffect(() => {
    if (swapId) {
      getSwapQR(swapId);
    }
  }, [swapId, getSwapQR]);

  if (isLoading) {
    return (
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bookish-spinner mx-auto w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[var(--text)] font-['Open_Sans'] mt-2">Loading QR code...</p>
      </motion.div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!qrData) {
    return (
      <motion.p
        className="text-[var(--text)] font-['Open_Sans'] text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        No QR code available.
      </motion.p>
    );
  }

  return (
    <motion.div
      className={`bookish-glass p-4 rounded-xl flex justify-center ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <QRCodeCanvas
        value={qrData}
        size={200}
        bgColor="#FFFFFF"
        fgColor="#2F2F2F"
        level="H"
        includeMargin={true}
        className="rounded-lg"
      />
    </motion.div>
  );
};

export default QRCodeDisplay;