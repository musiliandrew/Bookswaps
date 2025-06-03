import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { toast } from 'react-toastify';
import { useSwaps } from '../../hooks/useSwaps';
import { useAuth } from '../../hooks/useAuth';
import NotificationCard from '../../components/notifications/NotificationCard'; 
import Button from '../../components/common/Button';

const NotificationsPage = () => {
  const { getNotifications, markNotificationRead, notifications, isLoading, error } = useSwaps();
  const { user } = useAuth();
  // Removed unused ws state
  const [wsNotifications, setWsNotifications] = useState([]);
  const [showShareCard, setShowShareCard] = useState(false);

  useEffect(() => {
    getNotifications().catch(() => toast.error('Failed to load notifications'));

    // Initialize WebSocket
    if (user?.user_id) {
      const token = localStorage.getItem('access_token');
      const wsUrl = `ws://localhost:8000/ws/notifications/?token=${token}`; // Adjust URL as needed
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('WebSocket connected');
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setWsNotifications((prev) => [
          {
            id: `ws-${Date.now()}`,
            message: data.message,
            is_read: false,
            timestamp: new Date().toISOString(),
            info: { type: data.type, related_id: data.follow_id },
          },
          ...prev,
        ]);
        toast.info(`New notification: ${data.message}`);
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
      };

      socket.onerror = (err) => {
        console.error('WebSocket error:', err);
        toast.error('Notification connection failed');
      };

      // No need to set ws in state

      return () => {
        socket.close();
      };
    }
  }, [getNotifications, user]);

  useEffect(() => {
    if (error) {
      toast.error(error || 'Error loading notifications');
    }
    if (notifications?.length === 0 && wsNotifications.length === 0) {
      toast.success('🎉 Badge Earned: Inbox Zero!');
    }
  }, [error, notifications, wsNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
    } catch (err) {
      console.error('Mark read error:', err);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      for (const notification of notifications.filter((n) => !n.is_read)) {
        await markNotificationRead(notification.id);
      }
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Mark all read error:', err);
      toast.error('Failed to mark all as read');
    }
  };

  const handleShareAll = () => {
    setShowShareCard(true);
  };

  const allNotifications = [...wsNotifications, ...notifications].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  if (isLoading && !allNotifications.length) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <motion.div
      className="container mx-auto p-4 bookish-gradient"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-3xl font-bold mb-6 font-['Playfair_Display'] text-[#FF6F61]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Notifications
      </motion.h1>

      <motion.div
        className="flex justify-end mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Button
          text="Mark All Read"
          onClick={handleMarkAllRead}
          className="bookish-button-enhanced bg-blue-600 hover:bg-blue-700"
          disabled={isLoading || !notifications.some((n) => !n.is_read)}
          aria-label="Mark all notifications as read"
        />
        <Button
          text="Share All"
          onClick={handleShareAll}
          className="ml-2 bookish-button-enhanced bg-teal-600 hover:bg-teal-700"
          disabled={isLoading || !allNotifications.length}
          aria-label="Share all notifications"
        />
      </motion.div>

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        role="list"
      >
        <AnimatePresence>
          {allNotifications.length ? (
            allNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                role="listitem"
              >
                <NotificationCard
                  notification={notification}
                  onRead={notification.id.startsWith('ws-') ? () => {} : handleMarkRead}
                />
              </motion.div>
            ))
          ) : (
            <motion.div
              className="text-center text-[#333] font-['Poppins']"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              No notifications
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {showShareCard && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-64 w-full bookish-shadow">
            <Canvas>
              <ambientLight />
              <OrbitControls />
              <mesh>
                <boxGeometry args={[3, 2, 0.1]} />
                <meshStandardMaterial color="#FF6F61" />
                <Text position={[0, 0.5, 0.1]} fontSize={0.2} color="white">
                  My Notifications
                </Text>
                <Text position={[0, 0, 0.1]} fontSize={0.15} color="white">
                  {allNotifications.length} Updates
                </Text>
              </mesh>
            </Canvas>
            <Button
              text="Share on X"
              onClick={() => console.log('Share to X')}
              className="mt-2 bg-blue-600 hover:bg-blue-700"
              aria-label="Share all notifications on X"
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default NotificationsPage;