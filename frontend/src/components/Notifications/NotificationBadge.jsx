import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNotifications } from '../../hooks/useNotifications';
import { BellIcon } from '@heroicons/react/24/solid';
import Tilt from 'react-parallax-tilt';

const NotificationBadge = ({ className = '' }) => {
  const { notifications, getNotifications } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    getNotifications({ is_read: false });
  }, [getNotifications]);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
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
          onClick={toggleDropdown}
          className={`bookish-button-enhanced p-2 rounded-full bg-[var(--accent)] text-white ${
            unreadCount > 0 ? 'animate-pulse-glow' : ''
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={`Notifications, ${unreadCount} unread`}
        >
          <BellIcon className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </motion.button>
        {showDropdown && (
          <motion.div
            className="absolute right-0 mt-2 w-64 bookish-glass p-4 rounded-xl shadow-lg z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-sm font-['Lora'] text-[var(--primary)] mb-2">Recent Notifications</h3>
            {notifications.length === 0 ? (
              <p className="text-sm text-[var(--text)] font-['Open_Sans']">No notifications</p>
            ) : (
              notifications.slice(0, 3).map((notification) => (
                <motion.div
                  key={notification.id}
                  className="mb-2 text-sm text-[var(--text)] font-['Open_Sans']"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <p className={notification.is_read ? 'text-gray-500' : 'text-[var(--text)]'}>
                    {notification.message.slice(0, 30)}...
                  </p>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </motion.div>
    </Tilt>
  );
};

export default NotificationBadge;