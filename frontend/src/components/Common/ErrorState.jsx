import { motion } from 'framer-motion';

/**
 * ErrorState - Reusable error state component
 * Features animated error display with retry functionality
 */
const ErrorState = ({ 
  message = "Something went wrong",
  onRetry,
  retryText = "Try Again",
  fullScreen = false,
  className = ""
}) => {
  const containerClasses = fullScreen 
    ? "text-center p-8 text-[var(--text)] bg-bookish-gradient h-screen flex items-center justify-center"
    : `text-center p-8 text-[var(--text)] ${className}`;

  return (
    <div className={containerClasses}>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bookish-glass p-8 rounded-xl max-w-md mx-auto"
      >
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-['Lora'] mb-4">Oops! Something went wrong</h2>
        <p className="mb-6 text-[var(--secondary)]">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bookish-button-enhanced px-6 py-3 rounded-xl text-[var(--secondary)] hover:scale-105 transition-transform"
          >
            {retryText}
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default ErrorState;
