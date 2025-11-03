import React from 'react';

const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex flex-col justify-center items-center h-screen bg-bg-gradient">
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--accent-500)', borderTopColor: 'transparent' }}></div>
      <span className="text-lg font-medium text-[var(--text)]">{message}</span>
    </div>
  </div>
);

export default LoadingSpinner;