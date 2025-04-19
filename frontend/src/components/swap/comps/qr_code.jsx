import { useState } from 'react';

const QRCodeViewerModal = ({ isOpen, onClose, title = "QR Code" }) => {
  const [mode, setMode] = useState('view'); // 'view' or 'scan'
  
  if (!isOpen) return null;

  // Generate a QR code display URL
  // In a real app, you would use a QR code generation library or API
  // Here we're using a placeholder to demonstrate the structure
  const qrCodeUrl = `/api/placeholder/200/200`;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-brown-800">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex border-b">
            <button
              className={`px-4 py-2 ${mode === 'view' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500'}`}
              onClick={() => setMode('view')}
            >
              View QR Code
            </button>
            <button
              className={`px-4 py-2 ${mode === 'scan' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500'}`}
              onClick={() => setMode('scan')}
            >
              Scan QR Code
            </button>
          </div>
        </div>
        
        {mode === 'view' ? (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-48 h-48"
              />
            </div>
            <p className="text-sm text-gray-600 mt-4 text-center">
              Show this QR code to the other person to confirm the swap.
            </p>
            <button 
              className="mt-4 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
              onClick={() => {
                // In a real app, this would trigger a download or share function
                alert("Download QR code functionality would be implemented here.");
              }}
            >
              Download QR Code
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="bg-gray-100 w-48 h-48 rounded flex items-center justify-center border border-dashed border-gray-300">
              <div className="text-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-12 w-12 mx-auto text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">QR Code Scanner</p>
                <p className="text-xs text-gray-500">Coming Soon</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 text-center">
              Scan the other person's QR code to confirm the swap.
            </p>
            <button 
              className="mt-4 bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
              disabled
            >
              Scanner Coming Soon
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeViewerModal;