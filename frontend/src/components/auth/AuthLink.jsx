import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AuthLink = ({ to, text, className = '', onClick }) => {
  return (
    <motion.p
      className={`text-sm font-['Caveat'] font-semibold ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        whileHover={{ scale: 1.05 }}
        className="inline-block"
      >
        <Link
          to={to}
          className="text-[var(--primary)] hover:text-[var(--accent)] transition-all duration-300 relative"
          onClick={onClick}
        >
          <span
            className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-300"
            // Animation for underline can be handled with CSS or framer-motion if needed
          />
          {text}
        </Link>
      </motion.span>
    </motion.p>
  );
};

export default AuthLink;