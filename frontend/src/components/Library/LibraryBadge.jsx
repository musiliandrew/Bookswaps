import { useState } from 'react';

// Library icon with the provided SVG
const LibraryIcon = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 16 16" 
    version="1.1" 
    xmlns="http://www.w3.org/2000/svg" 
    xmlnsXlink="http://www.w3.org/1999/xlink" 
    fill="currentColor"
  >
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g fill="currentColor">
        <rect x="0" y="0" width="2" height="16" className="si-glyph-fill"></rect>
        <path d="M11,6 L11,9 L11.885,9 L12,6 L11,6 Z" className="si-glyph-fill"></path>
        <path d="M3,0 L3,16 L13.8208442,16 C14.4713435,16 15,15.5473033 15,14.9895162 L15,1.01048377 C15,0.451686245 14.4723504,0 13.8208442,0 L3,0 Z M13.051,9.053 L12.08,9.053 L12.062,10.063 L7.906,10.063 L7.924,9.042 L6.957,9.042 L6.957,6.99 L7.915,6.99 L7.915,5.948 L10.957,5.938 L10.957,5.051 L7.026,5.051 L7.026,6.048 L6.029,6.048 L6.029,9.958 L7.041,9.958 L7.041,10.975 L11.047,10.975 L11.047,12.014 L6.961,12.014 L6.961,11.063 L5.958,11.063 L5.958,10.032 L4.953,10.032 L4.953,5.991 L5.973,5.991 L5.973,4.973 L6.938,4.973 L6.938,3.938 L11.032,3.938 L11.032,4.959 L12.011,4.959 L12.011,5.949 L13.052,5.949 L13.052,9.053 L13.051,9.053 Z" className="si-glyph-fill"></path>
        <rect x="8" y="7" width="2" height="2" className="si-glyph-fill"></rect>
      </g>
    </g>
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

const LibraryBadge = ({ className = '' }) => {
  const [isActive, setIsActive] = useState(false);
  
  const handleClick = () => {
    setIsActive(!isActive);
    console.log('Navigating to /library');
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
          aria-label={isActive ? "Currently in library" : "Go to library"}
        >
          <LibraryIcon className="w-6 h-6" />
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

export default LibraryBadge;