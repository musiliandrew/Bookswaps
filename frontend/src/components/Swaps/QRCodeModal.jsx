import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwaps } from '../../hooks/useSwaps';
import { toast } from 'react-toastify';
import {
  QrCodeIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ShareIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

const QRCodeModal = ({ isOpen, onClose, swap, currentUserId }) => {
  const { getSwapQR, verifyQR, isLoading } = useSwaps();
  const [qrData, setQrData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const isInitiator = swap?.initiator?.user_id === currentUserId;
  const canVerify = swap?.status === 'Accepted' || swap?.status === 'Confirmed';

  useEffect(() => {
    if (isOpen && swap?.swap_id) {
      loadQRCode();
    }
  }, [isOpen, swap?.swap_id]);

  const loadQRCode = async () => {
    try {
      const result = await getSwapQR(swap.swap_id);
      if (result) {
        setQrData(result);
      }
    } catch (error) {
      toast.error('Failed to load QR code');
      console.error('QR code loading error:', error);
    }
  };

  const handleVerifyQR = async () => {
    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyQR(swap.swap_id, { qr_code: verificationCode });
      if (result) {
        toast.success('QR code verified successfully!');
        setShowVerification(false);
        setVerificationCode('');
        onClose();
      }
    } catch (error) {
      toast.error('QR code verification failed');
      console.error('QR verification error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyQRData = () => {
    if (qrData?.qr_data) {
      navigator.clipboard.writeText(qrData.qr_data);
      toast.success('QR code data copied to clipboard');
    }
  };

  const handleShareQR = async () => {
    if (navigator.share && qrData?.qr_code_url) {
      try {
        await navigator.share({
          title: 'Book Swap QR Code',
          text: `QR Code for book swap: ${swap.initiator_book?.title}`,
          url: qrData.qr_code_url
        });
      } catch (error) {
        console.log('Share failed:', error);
        handleCopyQRData();
      }
    } else {
      handleCopyQRData();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bookish-glass rounded-2xl border border-white/20 p-6 w-full max-w-md"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl">
                <QrCodeIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-lora font-bold text-primary">
                  Swap QR Code
                </h3>
                <p className="text-sm text-primary/70">
                  {showVerification ? 'Verify your presence' : 'Scan to verify swap'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-primary/70" />
            </button>
          </div>

          {/* Swap Info */}
          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <img
                src={swap?.initiator_book?.cover_image_url || '/placeholder-book.jpg'}
                alt={swap?.initiator_book?.title}
                className="w-12 h-16 object-cover rounded-lg"
              />
              <div>
                <h4 className="font-semibold text-primary">
                  {swap?.initiator_book?.title}
                </h4>
                <p className="text-sm text-primary/70">
                  by {swap?.initiator_book?.author}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${
                    swap?.status === 'Confirmed' ? 'bg-green-500' :
                    swap?.status === 'Accepted' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-xs text-primary/60">{swap?.status}</span>
                </div>
              </div>
            </div>
          </div>

          {!showVerification ? (
            /* QR Code Display */
            <div className="text-center">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                </div>
              ) : qrData?.qr_code_url ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl mx-auto inline-block">
                    <img
                      src={qrData.qr_code_url}
                      alt="Swap QR Code"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  
                  <div className="text-sm text-primary/70">
                    <p>Show this QR code at the meetup location</p>
                    <p className="font-mono text-xs mt-1 bg-white/10 p-2 rounded">
                      {qrData.qr_data}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleShareQR}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <ShareIcon className="w-4 h-4" />
                      Share
                    </button>
                    <button
                      onClick={handleCopyQRData}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4" />
                      Copy
                    </button>
                  </div>

                  {canVerify && (
                    <button
                      onClick={() => setShowVerification(true)}
                      className="w-full mt-4 bookish-button-enhanced text-white py-3 rounded-xl"
                    >
                      <CheckCircleIcon className="w-5 h-5 inline mr-2" />
                      Verify Presence
                    </button>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <QrCodeIcon className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                  <p className="text-primary/70">QR code not available</p>
                </div>
              )}
            </div>
          ) : (
            /* Verification Interface */
            <div className="space-y-4">
              <div className="text-center mb-6">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-primary mb-2">
                  Verify Your Presence
                </h4>
                <p className="text-sm text-primary/70">
                  Enter the verification code from the other person's QR code
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter QR code data"
                  className="w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowVerification(false)}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-primary"
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyQR}
                  disabled={isVerifying || !verificationCode.trim()}
                  className="flex-1 bookish-button-enhanced text-white py-3 rounded-xl disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <ClockIcon className="w-4 h-4 inline mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4 inline mr-2" />
                      Verify
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QRCodeModal;
