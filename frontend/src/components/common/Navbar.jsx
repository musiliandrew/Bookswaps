import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.nav
      className="bg-[var(--primary)] text-[var(--secondary)] p-4 frosted-glass bookish-border"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Link to="/" className="text-2xl font-['Lora'] flex items-center text-shadow">
            <img
              src="/src/assets/book.svg"
              alt="BookSwap Logo"
              className="w-6 h-6 mr-2"
            />
            BookSwap
          </Link>
        </motion.div>
        <motion.div
          className="flex space-x-4 font-['Caveat'] text-sm items-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Link
            to="/"
            className="text-[var(--secondary)] hover:text-[var(--accent)] transition-colors"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-[var(--secondary)] hover:text-[var(--accent)] transition-colors"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-[var(--secondary)] hover:text-[var(--accent)] transition-colors"
          >
            Contact
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/me/profile"
                className="text-[var(--secondary)] hover:text-[var(--accent)] transition-colors"
              >
                Profile
              </Link>
              <Link
                to="/users/search"
                className="text-[var(--secondary)] hover:text-[var(--accent)] transition-colors"
              >
                Search Users
              </Link>
              <motion.button
                onClick={handleLogout}
                className="bookish-button bookish-button--secondary text-sm px-3 py-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                Sign Out
              </motion.button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[var(--secondary)] hover:text-[var(--accent)] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="text-[var(--secondary)] hover:text-[var(--accent)] transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </motion.nav>
  );
}

export default Navbar;