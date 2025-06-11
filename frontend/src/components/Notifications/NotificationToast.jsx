import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNotifications } from '../../hooks/useNotifications';
import { useDiscussions } from '../../hooks/useDiscussions';
import { useAuth } from '../../hooks/useAuth';
import Button from '../Common/Button';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const NotificationToast = () => {
  const { wsNotifications, isWebSocketConnected } = useNotifications();
  const { createDiscussion } = useDiscussions();
  const { profile } = useAuth();

  useEffect(() => {
    if (!isWebSocketConnected || !wsNotifications?.length) return;

    wsNotifications.forEach((notification) => {
      const audio = new Audio('/assets/sci-fi-beep.mp3'); // Add your audio file
      audio.play().catch(() => console.log('Audio playback failed'));

      toast(
        <motion.div
          className="bookish-glass p-4 rounded-lg border border-[var(--accent)] bg-opacity-80"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm font-['Open_Sans'] text-[var(--text)]">{notification.message}</p>
          <div className="flex gap-2 mt-2">
            {notification.info?.book_id && (
              <Button
                text="Discuss"
                onClick={() => {
                  if (!profile?.user?.id) {
                    toast.warning('Please sign in to discuss');
                    return;
                  }
                  createDiscussion({
                    content: `New notification: "${notification.message}". Thoughts?`,
                    book_id: notification.info.book_id,
                  }).then(() => toast.success('Discussion posted!'));
                }}
                className="bookish-button-enhanced bg-orange-600 text-white text-xs"
              />
            )}
            {notification.info?.type && (
              <Link
                to={`/${notification.info.type}s/${notification.info.related_id}`}
                className="bookish-button-enhanced bg-blue-600 text-white text-xs px-3 py-1 rounded"
              >
                View
              </Link>
            )}
          </div>
        </motion.div>,
        {
          position: 'top-right',
          autoClose: 5000,
          progressStyle: { background: 'linear-gradient(to right, #FF6F61, #FFD700)' },
        }
      );
    });
  }, [wsNotifications, isWebSocketConnected, createDiscussion, profile]);

  return null; // Renderless component
};

export default NotificationToast;