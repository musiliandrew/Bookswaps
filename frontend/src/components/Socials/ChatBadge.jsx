import { useState } from 'react';

// Chat icon with the provided SVG
const ChatIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M12 2.25c-2.429 0-4.817.178-7.152.521C2.87 3.061 1.5 4.795 1.5 6.741v6.018c0 1.946 1.37 3.68 3.348 3.97.877.129 1.761.234 2.652.316V21a.75.75 0 0 0 1.28.53l4.184-4.183a.39.39 0 0 1 .266-.112c2.006-.05 3.982-.22 5.922-.506 1.978-.29 3.348-2.023 3.348-3.97V6.741c0-1.947-1.37-3.68-3.348-3.97A49.145 49.145 0 0 0 12 2.25ZM8.25 8.625a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Zm2.625 1.125a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
  </svg>
);

// Mock motion components for demonstration
const motion = {
  div: ({ children, className, ...props }) => (
    <div className={className} {...props}>{children}</div>
  ),
  button: ({ children, className, ...props }) => (
    <button className={className} {...props}>{children}</button>
  )
};

// Mock Tilt component
const Tilt = ({ children }) => (
  <div style={{ transform: 'perspective(1000px)' }}>{children}</div>
);

const ChatBadge = ({ className = '' }) => {
  // Mock navigation and location for demonstration
  const [isActive, setIsActive] = useState(false);
  
  const handleClick = () => {
    // In your actual implementation, this would be:
    // navigate('/socials');
    setIsActive(!isActive);
    console.log('Navigating to /socials');
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
              ? 'bg-blue-500 ring-2 ring-white ring-opacity-60 shadow-lg' 
              : 'bg-blue-400 opacity-70 hover:opacity-100 hover:shadow-md'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={isActive ? "Currently on socials" : "Go to socials"}
        >
          <ChatIcon className="w-6 h-6" />
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

export default ChatBadge;