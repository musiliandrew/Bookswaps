import { motion } from 'framer-motion';

function Button({ type = 'button', text, disabled, className = '', onClick, isLoading = false }) {
  return (
    <motion.button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`bookish-button bookish-button--primary font-['Open_Sans'] font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.05 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin h-5 w-5 mr-2 text-[var(--secondary)]"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          {text}
        </span>
      ) : (
        text
      )}
    </motion.button>
  );
}

export default Button;