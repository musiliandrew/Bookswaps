import React, { useState } from "react";
import HeaderWithSwapsActive from "./comps/header";
import SwapTab from "./comps/swaps_tab";
import QRCodeViewerModal from "./comps/qr_code";
import StartSwap from "./comps/start_swap";
import SwapsPage from "./comps/swaps";
import Footer from "../home_components/Footer";
const SwapPage = () => {
  // State for managing active tab
  const [activeView, setActiveView] = useState("yourSwaps"); // Options: yourSwaps, startSwap, fullSwapsPage
  
  // State for QR code modal
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentQRData, setCurrentQRData] = useState("");

  // Function to open QR code modal
  const openQRCode = (swapData) => {
    setCurrentQRData(swapData);
    setShowQRModal(true);
  };

  // Function to render the appropriate view based on activeView state
  const renderActiveView = () => {
    switch (activeView) {
      case "yourSwaps":
        return <SwapTab onOpenQRCode={openQRCode} />;
      case "startSwap":
        return <StartSwap />;
      case "fullSwapsPage":
        return <SwapsPage />;
      default:
        return <SwapTab onOpenQRCode={openQRCode} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      {/* Header */}
      <HeaderWithSwapsActive 
        onNavigate={(view) => setActiveView(view)} 
        activeView={activeView}
      />
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium ${
              activeView === "yourSwaps" 
                ? "text-teal-600 border-b-2 border-teal-600" 
                : "text-gray-600 hover:text-teal-500"
            }`}
            onClick={() => setActiveView("yourSwaps")}
          >
            Your Swaps
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeView === "startSwap" 
                ? "text-teal-600 border-b-2 border-teal-600" 
                : "text-gray-600 hover:text-teal-500"
            }`}
            onClick={() => setActiveView("startSwap")}
          >
            Start New Swap
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeView === "fullSwapsPage" 
                ? "text-teal-600 border-b-2 border-teal-600" 
                : "text-gray-600 hover:text-teal-500"
            }`}
            onClick={() => setActiveView("fullSwapsPage")}
          >
            Full Swaps View
          </button>
        </div>
        
        {/* Active View Content */}
        <div className="bg-white p-6 rounded-lg shadow">
          {renderActiveView()}
        </div>
      </main>
      
      {/* QR Code Modal */}
      <QRCodeViewerModal 
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        qrData={currentQRData}
      />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SwapPage;