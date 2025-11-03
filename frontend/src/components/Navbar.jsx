import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  BookOpenIcon,
  UserGroupIcon,
  BellIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  BellIcon as BellIconSolid,
  UserCircleIcon as UserCircleIconSolid
} from '@heroicons/react/24/solid';
import NotificationBadge from './Notifications/NotificationBadge';
import UserBadge from './Profile/UserBadge';
import appLogo from '../assets/icons/lightIcon.svg';

const Navbar = ({ isSmallScreen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('/');

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location]);

  const navItems = [
    {
      path: '/profile/me',
      label: 'Profile',
      icon: UserCircleIcon,
      iconSolid: UserCircleIconSolid,
    },
    {
      path: '/library',
      label: 'Library',
      icon: BookOpenIcon,
      iconSolid: BookOpenIconSolid,
    },
    {
      path: '/socials',
      label: 'Socials',
      icon: UserGroupIcon,
      iconSolid: UserGroupIconSolid,
    },
    {
      path: '/notifications',
      label: 'Alerts',
      icon: BellIcon,
      iconSolid: BellIconSolid,
      badge: true,
    },
  ];

  const isActive = (path) => {
    // Handle nested routes
    if (path === '/profile/me') {
      return location.pathname.startsWith('/profile');
    }
    if (path === '/socials') {
      return location.pathname.startsWith('/socials');
    }
    return location.pathname === path;
  };

  return (
    <>
      {/* Desktop Navigation - Top Bar */}
      {!isSmallScreen && (
        <motion.nav
          className="top-nav"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Logo Section */}
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/profile/me')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              <img
                src={appLogo}
                alt="BookSwaps"
                className="w-10 h-10"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(69, 106, 118, 0.2))' }}
              />
            </div>
            <div>
              <h1
                className="text-xl font-semibold tracking-tight"
                style={{
                  color: 'var(--primary-700)',
                  fontFamily: 'var(--font-primary)'
                }}
              >
                BookSwaps
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Connect • Swap • Read
              </p>
            </div>
          </motion.div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {navItems.map((item, index) => {
              const Icon = isActive(item.path) ? item.iconSolid : item.icon;
              const active = isActive(item.path);

              return (
                <motion.button
                  key={item.path}
                  className={`
                    relative flex items-center gap-2 px-4 py-2 rounded-lg
                    transition-all duration-200 font-medium text-sm
                    ${active
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    }
                  `}
                  onClick={() => navigate(item.path)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1">
                        <NotificationBadge />
                      </span>
                    )}
                  </div>
                  <span>{item.label}</span>
                </motion.button>
              );
            })}

            {/* User Profile */}
            <motion.div
              className="ml-2 pl-2 border-l"
              style={{ borderColor: 'var(--border-medium)' }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <UserBadge />
            </motion.div>
          </div>
        </motion.nav>
      )}

      {/* Mobile Navigation - Bottom Bar */}
      {isSmallScreen && (
        <motion.nav
          className="bottom-nav"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {navItems.map((item, index) => {
            const Icon = isActive(item.path) ? item.iconSolid : item.icon;
            const active = isActive(item.path);

            return (
              <motion.button
                key={item.path}
                className={`bottom-nav-item ${active ? 'bottom-nav-item-active' : ''}`}
                onClick={() => navigate(item.path)}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="relative">
                  <Icon className="bottom-nav-icon" />
                  {item.badge && (
                    <span
                      className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--error-500)' }}
                    />
                  )}
                </div>
                <span className="bottom-nav-label">{item.label}</span>

                {/* Active indicator */}
                {active && (
                  <motion.div
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full"
                    style={{ backgroundColor: 'var(--primary-500)' }}
                    layoutId="mobileActiveTab"
                  />
                )}
              </motion.button>
            );
          })}
        </motion.nav>
      )}
    </>
  );
};

export default Navbar;
