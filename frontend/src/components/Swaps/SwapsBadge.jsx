import { useState } from 'react';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

// Swap icon using the existing swap.svg design
const SwapIcon = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 48 48" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="currentColor"
  >
    <path d="M24,2A22,22,0,1,0,46,24,21.9,21.9,0,0,0,24,2Zm.3,29.5-4.9,4.9a1.9,1.9,0,0,1-2.8,0l-4.9-4.9a2.2,2.2,0,0,1-.4-2.7,2,2,0,0,1,3.1-.2L16,30.2V15a2,2,0,0,1,4,0V30.2l1.6-1.6a2,2,0,0,1,3.1.2A2.2,2.2,0,0,1,24.3,31.5ZM36.7,19.2a2,2,0,0,1-3.1.2L32,17.8V33a2,2,0,0,1-4,0V17.8l-1.6,1.6a2,2,0,0,1-3.1-.2,2.1,2.1,0,0,1,.4-2.7l4.9-4.9a1.9,1.9,0,0,1,2.8,0l4.9,4.9A2.1,2.1,0,0,1,36.7,19.2Z"/>
  </svg>
);

const SwapsBadge = ({ className = '' }) => {
  const [isActive, setIsActive] = useState(false);
  
  const handleClick = () => {
    setIsActive(!isActive);
    console.log('Navigating to /swaps');
  };

  return (
    <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10}>
      <motion.div
        className={`relative ${className}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.button
          onClick={handleClick}
          className={`bookish-button-enhanced p-2 rounded-full text-white transition-all duration-200 ${
            isActive 
              ? 'bg-green-500 ring-2 ring-white ring-opacity-60 shadow-lg' 
              : 'bg-green-400 opacity-70 hover:opacity-100 hover:shadow-md'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={isActive ? "Currently viewing swaps" : "Go to swaps"}
        >
          <SwapIcon className="w-6 h-6" />
        </motion.button>
        
        {/* Active indicator dot */}
        {isActive && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
        )}
      </motion.div>
    </Tilt>
  );
};

export default SwapsBadge;
