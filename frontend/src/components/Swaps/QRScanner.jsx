import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCodeIcon, 
  CameraIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'react-toastify';

const QRScanner = ({ 
  isOpen, 
  onClose, 
  onScanSuccess, 
  swapId, 
  title = "Scan QR Code to Confirm Swap",
  requireLocation = true 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeScannerRef = useRef(null);

  useEffect(() => {
    if (isOpen && requireLocation) {
      getCurrentLocation();
    }
  }, [isOpen, requireLocation]);

  useEffect(() => {
    if (isOpen && (!requireLocation || currentLocation)) {
      initializeScanner();
    }

    return () => {
      if (html5QrCodeScannerRef.current) {
        html5QrCodeScannerRef.current.clear().catch(console.error);
      }
    };
  }, [isOpen, currentLocation, requireLocation]);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const initializeScanner = () => {
    if (!scannerRef.current) return;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      disableFlip: false,
    };

    html5QrCodeScannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      config,
      false
    );

    html5QrCodeScannerRef.current.render(onScanSuccess, onScanFailure);
    setIsScanning(true);
  };

  const onScanSuccess = (decodedText, decodedResult) => {
    setIsScanning(false);
    setScanResult(decodedText);
    
    // Clear the scanner
    if (html5QrCodeScannerRef.current) {
      html5QrCodeScannerRef.current.clear().catch(console.error);
    }

    // Process the scan result
    handleScanResult(decodedText);
  };

  const onScanFailure = (error) => {
    // Handle scan failure, usually ignore
    console.log(`QR scan error: ${error}`);
  };

  const handleScanResult = async (qrData) => {
    try {
      const result = await onScanSuccess({
        qr_data: qrData,
        current_location: currentLocation,
        swap_id: swapId
      });

      if (result.success) {
        toast.success(result.message || 'QR code verified successfully!');
        onClose();
      } else {
        setError(result.error || 'QR code verification failed');
      }
    } catch (error) {
      console.error('Scan processing error:', error);
      setError('Failed to process QR code');
    }
  };

  const handleManualInput = () => {
    const manualCode = prompt('Enter QR code manually:');
    if (manualCode) {
      handleScanResult(manualCode);
    }
  };

  const retryLocation = () => {
    setLocationError(null);
    getCurrentLocation();
  };

  const skipLocation = () => {
    setCurrentLocation({ latitude: 0, longitude: 0 });
    setLocationError(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <QrCodeIcon className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Location Status */}
            {requireLocation && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPinIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Location Verification</span>
                </div>
                
                {isGettingLocation && (
                  <div className="flex items-center gap-2 text-blue-700">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Getting your location...</span>
                  </div>
                )}
                
                {locationError && (
                  <div className="space-y-2">
                    <p className="text-sm text-red-600">{locationError}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={retryLocation}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Retry
                      </button>
                      <button
                        onClick={skipLocation}
                        className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                      >
                        Skip Location
                      </button>
                    </div>
                  </div>
                )}
                
                {currentLocation && !locationError && (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span className="text-sm">Location verified</span>
                  </div>
                )}
              </div>
            )}

            {/* Scanner */}
            {(!requireLocation || currentLocation) && !scanResult && !error && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Point your camera at the QR code shown by the other person
                  </p>
                </div>
                
                <div 
                  id="qr-reader" 
                  ref={scannerRef}
                  className="w-full"
                ></div>
                
                <div className="text-center">
                  <button
                    onClick={handleManualInput}
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Enter code manually
                  </button>
                </div>
              </div>
            )}

            {/* Success Result */}
            {scanResult && !error && (
              <div className="text-center space-y-4">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                <div>
                  <h4 className="text-lg font-semibold text-green-900 mb-2">
                    QR Code Scanned Successfully!
                  </h4>
                  <p className="text-gray-600">
                    Processing verification...
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center space-y-4">
                <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto" />
                <div>
                  <h4 className="text-lg font-semibold text-red-900 mb-2">
                    Verification Failed
                  </h4>
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      setScanResult(null);
                      if (!requireLocation || currentLocation) {
                        initializeScanner();
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QRScanner;
