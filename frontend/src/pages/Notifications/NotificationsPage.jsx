import { useEffect } from 'react';
import { useSwaps } from '../hooks/useSwaps';
import { NotificationCard } from '../components/swaps/NotificationCard';

const NotificationsPage = () => {
  const { getNotifications, markNotificationRead, notifications, isLoading, error } = useSwaps();

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!notifications.length) return <div>No notifications</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Notifications</h1>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onClick={() => markNotificationRead(notification.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;