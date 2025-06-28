import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import NotificationBadge from './Notifications/NotificationBadge';
import UserBadge from './Profile/UserBadge';
import ChatBadge from './Socials/ChatBadge';
import LibraryBadge from './Library/LibraryBadge';
import SwapsBadge from './Swaps/SwapsBadge';
import appLogo from '../assets/icons/lightIcon.svg';

const Navbar = ({ isSmallScreen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('/');

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location]);

  const navItems = [
    { path: '/profile/me', label: 'User', component: <UserBadge /> },
    { path: '/library', label: 'Library', component: <LibraryBadge /> },
    { path: '/swaps', label: 'Swaps', component: <SwapsBadge /> },
    { path: '/socials', label: 'Socials', component: <ChatBadge /> },
    { path: '/notifications', label: 'Notifications', component: <NotificationBadge /> },
  ];

  return (
    <nav className="navbar">
      {isSmallScreen ? (
        <div className="navbar-small flex justify-around items-center">
          {navItems.map((item) => (
            <motion.div
              key={item.path}
              className={`navbar-item ${activeTab === item.path ? 'navbar-item-active' : ''}`}
              onClick={() => navigate(item.path)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.component}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="navbar-large flex justify-between items-center">
          <div className="flex items-center">
            <img src={appLogo} alt="BookSwaps Logo" className="w-12 h-12 mr-3" />
            <h1 className="text-4xl font-['Lora'] text-[hsl(49,52%,88%)]">BookSwaps</h1>
          </div>
          <div className="flex items-center space-x-8">
            {/* Library Link */}
            <motion.div
              className={`navbar-item ${activeTab === '/library' ? 'navbar-item-active' : ''}`}
              onClick={() => navigate('/library')}
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-xl font-['Lora'] text-[hsl(49,52%,88%)] cursor-pointer hover:text-[var(--accent)] transition-colors">
                Library
              </span>
            </motion.div>

            {/* Swaps Link */}
            <motion.div
              className={`navbar-item ${activeTab === '/swaps' ? 'navbar-item-active' : ''}`}
              onClick={() => navigate('/swaps')}
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-xl font-['Lora'] text-[hsl(49,52%,88%)] cursor-pointer hover:text-[var(--accent)] transition-colors">
                Swaps
              </span>
            </motion.div>

            {/* Socials Link - FIXED: Now navigates to /socials instead of / */}
            <motion.div
              className={`navbar-item ${activeTab === '/socials' ? 'navbar-item-active' : ''}`}
              onClick={() => navigate('/socials')}
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-xl font-['Lora'] text-[hsl(49,52%,88%)] cursor-pointer hover:text-[var(--accent)] transition-colors">
                Socials
              </span>
            </motion.div>

            {/* Notifications Icon */}
            <motion.div
              className={`navbar-item ${activeTab === '/notifications' ? 'navbar-item-active' : ''}`}
              onClick={() => navigate('/notifications')}
              whileHover={{ scale: 1.1 }}
            >
              <div className="relative">
                <NotificationBadge />
              </div>
            </motion.div>

            {/* User Badge */}
            <motion.div
              className={`navbar-item ${activeTab === '/profile/me' ? 'navbar-item-active' : ''}`}
              onClick={() => navigate('/profile/me')}
              whileHover={{ scale: 1.1 }}
            >
              <UserBadge />
            </motion.div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;