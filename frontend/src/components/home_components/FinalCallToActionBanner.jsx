import React, { useState, useEffect } from 'react';

export default function FinalCallToActionBanner() {
  const [isVisible, setIsVisible] = useState(false);
  
  // Show banner after user has scrolled a bit
  useEffect(() => {
    const handleScroll = () => {
      // Show banner after scrolling 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Hide banner if user clicks X
  const dismissBanner = () => {
    setIsVisible(false);
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-teal-600 text-white shadow-lg z-50 transition-transform duration-300">
      <div className="container mx-auto px-4 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between">
        <p className="text-center md:text-left font-medium mb-3 md:mb-0">
          Ready to swap your next read? Join BookSwap today!
        </p>
        
        <div className="flex items-center">
          <a 
            href="/signup" 
            className="bg-white text-teal-600 hover:bg-teal-50 font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Sign Up Now
          </a>
          
          <button 
            onClick={dismissBanner}
            className="ml-4 text-white hover:text-teal-100"
            aria-label="Dismiss banner"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}