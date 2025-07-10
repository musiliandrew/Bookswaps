import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

const MessageStatus = ({ status, className = "" }) => {
  const getStatusDisplay = () => {
    switch (status) {
      case 'SENT':
        return {
          icon: (
            <div className="flex items-center">
              <CheckIcon className="w-3 h-3 text-gray-400" />
            </div>
          ),
          tooltip: 'Sent'
        };
      
      case 'DELIVERED':
        return {
          icon: (
            <div className="flex items-center relative">
              <CheckIcon className="w-3 h-3 text-gray-400" />
              <CheckIcon className="w-3 h-3 text-gray-400 -ml-1.5" />
            </div>
          ),
          tooltip: 'Delivered'
        };
      
      case 'READ':
        return {
          icon: (
            <div className="flex items-center relative">
              <CheckIcon className="w-3 h-3 text-[var(--primary)]" />
              <CheckIcon className="w-3 h-3 text-[var(--primary)] -ml-1.5" />
            </div>
          ),
          tooltip: 'Read'
        };
      
      default:
        return {
          icon: null,
          tooltip: ''
        };
    }
  };

  const { icon, tooltip } = getStatusDisplay();

  if (!icon) return null;

  return (
    <div 
      className={`inline-flex items-center ${className}`}
      title={tooltip}
    >
      {icon}
    </div>
  );
};

export default MessageStatus;
