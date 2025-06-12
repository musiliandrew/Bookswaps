import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNotifications } from '../../hooks/useNotifications';
import { useDiscussions } from '../../hooks/useDiscussions';
import { useAuth } from '../../hooks/useAuth';
import Button from '../Common/Button';
import ErrorMessage from '../Common/ErrorMessage';
import { Link } from 'react-router-dom';
import Particles from '@tsparticles/react';
import { tsParticles } from '@tsparticles/engine';
import Tilt from 'react-parallax-tilt';
import { toast } from 'react-toastify';

const NotificationList = ({ className = '' }) => {
  const { notifications, getNotifications, markNotificationRead, isLoading, error, pagination } = useNotifications();
  const { createDiscussion } = useDiscussions();
  const { profile } = useAuth();
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState({} );
  const observerRef = useRef();
  const lastNotificationRef = useRef();

  const particlesInit = async () => {
    await tsParticles.init();
  };

  useEffect(() => {
    getNotifications({ is_read: filter === 'unread' ? false : undefined });
  }, [filter, getNotifications]);

  useEffect(() => {
    if (isLoading || !pagination.next) return;

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        getNotifications({}, pagination.page + 1);
      }
    });

    const lastRef = lastNotificationRef.current;
    if (lastRef) {
      observerRef.current.observe(lastRef);
    }

    return () => {
      if (observerRef.current && lastRef) {
        observerRef.current.unobserve(lastRef);
      }
    };
  }, [isLoading, pagination, getNotifications]);

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
  };

  const handleDiscuss = async (notification) => {
    if (!profile?.user?.id) {
      toast.warning('Please sign in to discuss');
      return;
    }
    try {
      await createDiscussion({
        content: `Received a notification about ${notification.info?.book_title || 'a book'}: "${notification.message}". Thoughts?`,
        book_id: notification.info?.book_id,
      });
      toast.success('Discussion posted!');
    } catch {
      toast.error('Failed to post discussion');
    }
  };

  const handleShare = (notification) => {
    // Placeholder for X share; implement with html2canvas or server-side API
    toast.info(`Sharing: ${notification.message}`);
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getLink = (info) => {
    if (info?.type === 'swap') return `/swaps/${info.related_id}`;
    if (info?.type === 'discussion') return `/discussions/${info.related_id}`;
    return null;
  };

  if (error) return <ErrorMessage message={error} />;

  return (
    <motion.div
      className={`bookish-glass p-6 rounded-xl relative ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: false },
          particles: {
            number: { value: 50, density: { enable: true, area: 800 } },
            color: { value: '#FFD700' },
            shape: { type: 'circle' },
            opacity: { value: { min: 0.1, max: 0.5 }, random: true },
            size: { value: { min: 1, max: 3 }, random: true },
            links: { enable: false },
            move: { enable: true, speed: { min: 1, max: 2 }, direction: 'none', random: true, straight: false },
          },
          interactivity: { events: { onHover: { enable: false }, onClick: { enable: false } } },
        }}
        className="absolute inset-0 z-0 opacity-20"
        style={{ pointerEvents: 'none' }}
      />
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-['Lora'] text-gradient">Notifications</h2>
          <div className="flex space-x-2">
            <Button
              text="All"
              onClick={() => setFilter('all')}
              className={`bookish-button-enhanced ${filter === 'all' ? 'bg-[var(--accent)]' : 'bg-gray-600'}`}
            />
            <Button
              text="Unread"
              onClick={() => setFilter('unread')}
              className={`bookish-button-enhanced ${filter === 'unread' ? 'bg-[var(--accent)]' : 'bg-gray-600'}`}
            />
          </div>
        </div>
        {notifications.length === 0 ? (
          <p className="text-[var(--text)] font-['Open_Sans'] text-center">No notifications found.</p>
        ) : (
          notifications.map((notification, index) => (
            <Tilt key={notification.id} tiltMaxAngleX={5} tiltMaxAngleY={5}>
              <motion.div
                ref={index === notifications.length - 1 ? lastNotificationRef : null}
                className="mb-4 p-4 bookish-glass rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-4">
                  {notification.info?.book_image && (
                    <img
                      src={notification.info.book_image}
                      alt={notification.info.book_title || 'Book'}
                      className="w-12 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-[var(--text)] font-['Open_Sans']">
                      {new Date(notification.timestamp || Date.now()).toLocaleString()}
                    </p>
                    <p
                      className={`text-sm font-['Open_Sans'] ${
                        notification.is_read ? 'text-gray-500' : 'text-[var(--text)]'
                      }`}
                    >
                      {notification.message}
                    </p>
                    {expanded[notification.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {getLink(notification.info) && (
                          <Link
                            to={getLink(notification.info)}
                            className="text-[var(--accent)] text-sm font-['Open_Sans'] hover:underline"
                          >
                            View Details
                          </Link>
                        )}
                      </motion.div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!notification.is_read && (
                      <Button
                        text="Mark Read"
                        onClick={() => handleMarkRead(notification.id)}
                        className="bookish-button-enhanced bg-blue-600 text-white text-xs"
                        isLoading={isLoading}
                      />
                    )}
                    {notification.info?.book_id && (
                      <Button
                        text="Discuss"
                        onClick={() => handleDiscuss(notification)}
                        className="bookish-button-enhanced bg-orange-600 text-white text-xs"
                      />
                    )}
                    <Button
                      text="Share"
                      onClick={() => handleShare(notification)}
                      className="bookish-button-enhanced bg-teal-600 text-white text-xs"
                    />
                    <Button
                      text={expanded[notification.id] ? 'Collapse' : 'Expand'}
                      onClick={() => toggleExpand(notification.id)}
                      className="bookish-button-enhanced bg-gray-600 text-white text-xs"
                    />
                  </div>
                </div>
              </motion.div>
            </Tilt>
          ))
        )}
        {isLoading && (
          <div className="text-center">
            <div className="bookish-spinner mx-auto w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationList;