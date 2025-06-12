import { motion } from 'framer-motion';
import { UserIcon } from '@heroicons/react/24/solid';
import Tilt from 'react-parallax-tilt';
import { useNavigate } from 'react-router-dom';

const UserBadge = ({ className = '' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/profile/me');
  };

  return (
    <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10}>
      <motion.div
        className={`relative ${className}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.button
          onClick={handleClick}
          className="bookish-button-enhanced p-2 rounded-full bg-[var(--accent)] text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Go to profile"
        >
          <UserIcon className="w-6 h-6" />
        </motion.button>
      </motion.div>
    </Tilt>
  );
};

export default UserBadge;