import { motion } from 'framer-motion';
import NotificationBadge from '../../components/Notifications/NotificationBadge';
import NotificationList from '../../components/Notifications/NotificationList';

const NotificationsPage = () => {
  return (
    <motion.div
      className="min-h-screen bookish-gradient p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-['Lora'] text-[var(--primary)] mb-6 text-center">Notifications</h1>
        <NotificationBadge className="mb-4 flex justify-center" />
        <NotificationList />
      </div>
    </motion.div>
  );
};

export default NotificationsPage;