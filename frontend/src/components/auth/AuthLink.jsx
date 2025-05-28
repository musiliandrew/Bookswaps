import { motion } from 'framer-motion';

const AuthLink = ({ to, text, className = '' }) => {
  return (
    <motion.p
      className={`text-sm font-['Caveat'] font-semibold ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.a
        href={to}
        className="text-[var(--primary)] hover:text-[var(--accent)] transition-all duration-300 relative"
        whileHover={{ scale: 1.05 }}
        onHoverStart={() => {}}
      >
        <motion.span
          className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"
          whileHover={{ width: '100%' }}
          transition={{ duration: 0.3 }}
        />
        {text}
      </motion.a>
    </motion.p>
  );
};

export default AuthLink;