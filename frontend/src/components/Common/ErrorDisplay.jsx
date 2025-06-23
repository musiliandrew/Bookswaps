import React from 'react';

const ErrorDisplay = ({ message, onRetry }) => (
  <div className="flex flex-col justify-center items-center h-screen bg-bookish-gradient text-center p-4">
    <div className="max-w-md">
      <div className="mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <p className="text-[var(--text)] text-lg font-medium mb-2">Something went wrong</p>
        <p className="text-[var(--text)] text-sm opacity-75">{message}</p>
      </div>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="bookish-button-enhanced px-6 py-3 rounded-xl text-[var(--secondary)] font-medium hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

export default ErrorDisplay;