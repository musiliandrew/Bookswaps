import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLink from '../components/auth/AuthLink';
import { useAuth } from '../hooks/useAuth';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { to: '/', text: 'Home' },
    { to: '/books', text: 'Books' },
    { to: '/swaps', text: 'Swaps' },
    { to: '/swaps/history', text: 'Swap History' },
    { to: '/societies', text: 'Societies' }, // Replaced /chat
    { to: '/discussions', text: 'Discussions' },
  ];

  const authLinks = isAuthenticated
    ? [
        { to: '/profile', text: 'Profile' },
        { to: '/notifications', text: 'Notifications' },
      ]
    : [
        { to: '/login', text: 'Sign In' },
        { to: '/signup', text: 'Sign Up' },
      ];

  return (
    <nav className="bookish-glass bookish-shadow fixed top-0 left-0 right-0 z-50 py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Left: BookSwaps Logo & Text */}
        <div className="flex items-center space-x-3">
          <img src="/book.svg" alt="BookSwaps Logo" className="w-12 h-12" />
          <span className="text-4xl font-bold text-[#456A76] font-sans not-italic">BookSwaps</span>
        </div>

        {/* Center: Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-10">
          {navLinks.map((link) => (
            <AuthLink
              key={link.text}
              to={link.to}
              text={link.text}
              className="text-xl font-semibold text-[#2F2F2F] hover:text-[#D4A017] transition-colors duration-200 font-sans not-italic"
            />
          ))}
        </div>

        {/* Right: Auth Links */}
        <div className="hidden lg:flex items-center space-x-6">
          {authLinks.map((link) => (
            <AuthLink
              key={link.text}
              to={link.to}
              text={link.text}
              className={
                link.text === 'Sign Up'
                  ? 'bg-[#D4A017] text-[#2F2F2F] text-xl font-semibold px-8 py-3 rounded-full hover:bg-[#B8900F] transition-colors duration-200 font-sans not-italic'
                  : 'text-xl font-semibold text-[#2F2F2F] hover:text-[#D4A017] transition-colors duration-200 font-sans not-italic'
              }
            />
          ))}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="text-xl font-semibold text-[#2F2F2F] hover:text-[#D4A017] transition-colors duration-200 font-sans not-italic"
            >
              Sign Out
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <img src="/book.svg" alt="Menu" className="w-8 h-8" />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden absolute top-full left-0 right-0 mt-2 mx-4 bookish-glass bookish-shadow rounded-xl p-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4">
              {navLinks.map((link) => (
                <div key={link.text}>
                  <AuthLink
                    to={link.to}
                    text={link.text}
                    className="block text-lg font-semibold text-[#2F2F2F] hover:text-[#D4A017] py-2 font-sans not-italic"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                </div>
              ))}
              
              <div className="border-t border-white/20 pt-4 space-y-4">
                {authLinks.map((link) => (
                  <div key={link.text}>
                    <AuthLink
                      to={link.to}
                      text={link.text}
                      className={
                        link.text === 'Sign Up'
                          ? 'block bg-[#456A76] text-white text-xl font-semibold px-6 py-3 rounded-full text-center hover:bg-[#3a5862] transition-colors duration-200 font-sans not-italic'
                          : 'block text-xl font-semibold text-[#2F2F2F] hover:text-[#D4A017] py-2 font-sans not-italic'
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                    />
                  </div>
                ))}
                {isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-lg font-semibold text-[#2F2F2F] hover:text-[#D4A017] py-2 font-sans not-italic"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;