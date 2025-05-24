import { motion } from 'framer-motion';

function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <motion.div
      className="text-[var(--error)] text-sm font-['Open_Sans']"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      {message}
    </motion.div>
  );
}

export default ErrorMessage;