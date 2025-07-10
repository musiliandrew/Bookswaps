import { motion } from 'framer-motion';

/**
 * LoadingState - Reusable loading state component
 * Features animated spinner and customizable message
 */
const LoadingState = ({ 
  message = "Loading...",
  size = "large", // "small", "medium", "large"
  fullScreen = false,
  className = ""
}) => {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12", 
    large: "w-16 h-16"
  };

  const containerClasses = fullScreen 
    ? "flex justify-center items-center h-screen bg-bookish-gradient"
    : `flex justify-center items-center ${className}`;

  return (
    <div className={containerClasses}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <div className={`bookish-spinner ${sizeClasses[size]} border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4`}></div>
        <p className="text-[var(--text)] font-['Open_Sans']">{message}</p>
      </motion.div>
    </div>
  );
};

export default LoadingState;
