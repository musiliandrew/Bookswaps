import React, { useState, useRef, useEffect } from 'react';

/**
 * SortDropdown component - Minimal dropdown for sorting between Recent and Popular
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Current sort value ('recent' or 'popular')
 * @param {Function} props.onChange - Callback function when sort option changes
 */
const SortDropdown = ({ value = 'recent', onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle option selection
  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  // Display label based on current value
  const displayLabel = value === 'popular' ? 'Popular' : 'Recent';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        className="inline-flex justify-center items-center w-full px-4 py-2 text-sm font-medium text-brown-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="mr-2">Sort: {displayLabel}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <div className="py-1">
            <button
              className={`block w-full text-left px-4 py-2 text-sm ${
                value === 'recent'
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => handleSelect('recent')}
            >
              Recent
            </button>
            <button
              className={`block w-full text-left px-4 py-2 text-sm ${
                value === 'popular'
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => handleSelect('popular')}
            >
              Popular
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;