import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const ErrorMessage = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={clsx(
          'relative p-4 rounded-xl overflow-hidden',
          'bg-[var(--background)]/80 backdrop-blur-sm',
          className
        )}
        initial={{ opacity: 0, x: -20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        role="alert"
        aria-live="assertive"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-red-200 to-transparent"
          animate={{ x: [-100, 100] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
          }}
          style={{ opacity: 0.1 }}
        />
        <div className="relative flex items-center">
          <svg
            className="w-5 h-5 text-red-500 mr-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm font-semibold text-red-700 font-['Lora']">{message}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string,
};

export default ErrorMessage;