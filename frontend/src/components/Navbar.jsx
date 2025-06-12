import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import NotificationBadge from './Notifications/NotificationBadge';

const Navbar = ({ isSmallScreen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('/');

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location]);

  const navItems = [
    { path: '/', icon: '/assets/icons/AppLogo.svg', label: 'Socials', text: 'Socials' },
    { path: '/profile/me', icon: '/assets/icons/user_icon.svg', label: 'User', text: 'User' },
    { path: '/library', icon: '/assets/icons/library_icon.svg', label: 'Library', text: 'Library' },
    { path: '/notifications', icon: '/assets/icons/chat.svg', label: 'Notifications', text: 'Notifications' },
  ];

  return (
    <nav className="navbar">
      {isSmallScreen ? (
        <div className="navbar-small">
          {navItems.map((item) => (
            <motion.div
              key={item.path}
              className={`navbar-item ${activeTab === item.path ? 'navbar-item-active' : ''}`}
              onClick={() => navigate(item.path)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src={item.icon} alt={`${item.label} icon`} className="navbar-icon" />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="navbar-large">
          <div className="flex items-center">
            <img src="/assets/icons/AppLogo.svg" alt="BookSwaps Logo" className="w-10 h-10 mr-2" />
            <h1 className="text-2xl font-['Lora'] text-white">BookSwaps</h1>
          </div>
          <div className="flex space-x-6">
            {navItems.map((item) => (
              <motion.div
                key={item.path}
                className={`navbar-item ${activeTab === item.path ? 'navbar-item-active' : ''}`}
                onClick={() => navigate(item.path)}
                whileHover={{ scale: 1.05 }}
              >
                <span className="navbar-text">{item.text}</span>
                {item.path === '/notifications' && <NotificationBadge className="ml-2" />}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;