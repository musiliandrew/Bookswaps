import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function AuthLink({ to, text, className = '' }) {
  return (
    <motion.p
      className={`text-sm font-['Caveat'] ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        to={to}
        className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors duration-200"
      >
        {text}
      </Link>
    </motion.p>
  );
}

export default AuthLink;