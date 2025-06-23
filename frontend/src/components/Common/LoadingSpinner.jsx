import React from 'react';

const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex flex-col justify-center items-center h-screen bg-bookish-gradient">
    <div className="flex items-center space-x-3">
      <div className="bookish-spinner w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      <span className="text-lg font-medium text-[var(--text)]">{message}</span>
    </div>
  </div>
);

export default LoadingSpinner;