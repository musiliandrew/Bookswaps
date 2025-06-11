import React from 'react';
import { useNavigate } from 'react-router-dom';

const SignupCTA = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate('/register')}
      className={`bookish-button-enhanced text-[var(--secondary)] px-4 py-2 rounded-full font-['Open_Sans'] ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      Sign Up
    </motion.button>
  );
};

export default SignupCTA;