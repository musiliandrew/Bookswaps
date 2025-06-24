import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../hooks/useAuth';
import ErrorMessage from '../Common/ErrorMessage';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  CheckIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const NotificationList = ({ className = '' }) => {
  const {
    notifications,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    bulkNotificationOperations,
    unreadCount,
    groupedNotifications,
    isLoading,
    error,
    pagination
  } = useNotifications();
  const { profile } = useAuth();
  const [filter, setFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grouped'
  const observerRef = useRef();
  const lastNotificationRef = useRef();

  // Filter notifications based on current filter
  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

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

  // Handler functions
  const handleMarkRead = async (notificationId) => {
    await markNotificationRead(notificationId);
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) {
      toast.info('No unread notifications');
      return;
    }
    await markAllNotificationsRead();
  };

  const handleDelete = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      await deleteNotification(notificationId);
    }
  };

  const handleSelectNotification = (notificationId) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.notification_id)));
      setShowBulkActions(true);
    }
  };

  const handleBulkOperation = async (operation) => {
    const notificationIds = Array.from(selectedNotifications);
    if (notificationIds.length === 0) return;

    if (operation === 'delete' && !window.confirm(`Delete ${notificationIds.length} notifications?`)) {
      return;
    }

    await bulkNotificationOperations(notificationIds, operation);
    setSelectedNotifications(new Set());
    setShowBulkActions(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'swap_proposed':
      case 'swap_accepted':
      case 'swap_confirmed':
        return '🔄';
      case 'message_received':
        return '💬';
      case 'note_added':
      case 'note_liked':
        return '💭';
      case 'discussion_upvoted':
        return '👍';
      case 'follow_request':
        return '👤';
      default:
        return '🔔';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (error) return <ErrorMessage message={error} />;

  return (
    <motion.div
      className={`bg-[var(--card-bg)] rounded-lg border border-[var(--secondary)] ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-[var(--secondary)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-[var(--accent)] text-white text-xs rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex bg-[var(--secondary)] rounded-lg p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  filter === 'all'
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  filter === 'unread'
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Unread
              </button>
            </div>

            {/* Mark all read button */}
            {unreadCount > 0 && (
              <motion.button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 px-3 py-1 bg-[var(--accent)] text-white text-sm rounded-lg hover:bg-[var(--accent)]/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
              >
                <CheckCircleIcon className="w-4 h-4" />
                Mark All Read
              </motion.button>
            )}
          </div>
        </div>

        {/* Bulk actions toolbar */}
        <AnimatePresence>
          {showBulkActions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 bg-[var(--secondary)]/20 rounded-lg border border-[var(--secondary)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">
                  {selectedNotifications.size} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkOperation('mark_read')}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    <EyeIcon className="w-3 h-3" />
                    Mark Read
                  </button>
                  <button
                    onClick={() => handleBulkOperation('mark_unread')}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    <EyeSlashIcon className="w-3 h-3" />
                    Mark Unread
                  </button>
                  <button
                    onClick={() => handleBulkOperation('delete')}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    <TrashIcon className="w-3 h-3" />
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setSelectedNotifications(new Set());
                      setShowBulkActions(false);
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
                  >
                    <XMarkIcon className="w-3 h-3" />
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Select all checkbox */}
        {filteredNotifications.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              id="select-all"
              checked={selectedNotifications.size === filteredNotifications.length}
              onChange={handleSelectAll}
              className="rounded border-[var(--secondary)] text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            <label htmlFor="select-all" className="text-sm text-[var(--text-secondary)]">
              Select all notifications
            </label>
          </div>
        )}
      </div>
      {/* Notifications content */}
      <div className="p-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </h3>
            <p className="text-[var(--text-secondary)]">
              {filter === 'unread'
                ? 'All caught up! Check back later for new notifications.'
                : 'You\'ll see notifications here when you have activity.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.notification_id}
                ref={index === filteredNotifications.length - 1 ? lastNotificationRef : null}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  notification.is_read
                    ? 'bg-[var(--secondary)]/20 border-[var(--secondary)]'
                    : 'bg-[var(--card-bg)] border-[var(--accent)]/30 shadow-sm'
                } ${
                  selectedNotifications.has(notification.notification_id)
                    ? 'ring-2 ring-[var(--accent)]/50'
                    : ''
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <div className="flex items-start gap-3">
                  {/* Selection checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notification.notification_id)}
                    onChange={() => handleSelectNotification(notification.notification_id)}
                    className="mt-1 rounded border-[var(--secondary)] text-[var(--accent)] focus:ring-[var(--accent)]"
                  />

                  {/* Notification icon */}
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[var(--secondary)] rounded-full text-sm">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Notification content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={`text-sm ${
                          notification.is_read
                            ? 'text-[var(--text-secondary)]'
                            : 'text-[var(--text-primary)] font-medium'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>

                      {/* Read indicator */}
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-[var(--accent)] rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-3">
                      {!notification.is_read && (
                        <motion.button
                          onClick={() => handleMarkRead(notification.notification_id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-[var(--accent)] text-white rounded hover:bg-[var(--accent)]/90 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={isLoading}
                        >
                          <CheckIcon className="w-3 h-3" />
                          Mark Read
                        </motion.button>
                      )}

                      <motion.button
                        onClick={() => handleDelete(notification.notification_id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <TrashIcon className="w-3 h-3" />
                        Delete
                      </motion.button>

                      {/* Link to related content if available */}
                      {notification.content_id && (
                        <Link
                          to={`/${notification.content_type}/${notification.content_id}`}
                          className="text-xs text-[var(--accent)] hover:underline"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--accent)]"></div>
            <span className="ml-2 text-[var(--text-secondary)]">Loading notifications...</span>
          </div>
        )}

        {/* Pagination info */}
        {pagination.next && !isLoading && (
          <div className="text-center mt-6">
            <p className="text-sm text-[var(--text-secondary)]">
              Scroll down to load more notifications
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationList;