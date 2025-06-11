import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const AuthLink = ({
  to,
  text,
  className = '',
  onClick,
}) => {
  return (
    <motion.p
      className={clsx(
        'text-sm font-["Lora"] font-semibold text-[var(--primary)]',
        className
      )}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative inline-block"
      >
        <Link
          to={to}
          onClick={onClick}
          className="relative text-[var(--primary)] hover:text-[var(--accent)] transition-all duration-300"
          aria-label={text}
        >
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
            animate={{ x: [-100, 100] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'linear',
            }}
            style={{ opacity: 0.1 }}
          />
          <span className="relative">
            {text}
            <span
              className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-300 group-hover:w-full"
            />
          </span>
        </Link>
      </motion.span>
    </motion.p>
  );
};

AuthLink.propTypes = {
  to: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default AuthLink;