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
  XMarkIcon,
  BellIcon
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
    isLoading,
    error,
    pagination
  } = useNotifications();
  useAuth();
  const [filter, setFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
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

  const handleRetry = () => {
    getNotifications({ is_read: filter === 'unread' ? false : undefined });
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
    <div className="min-h-screen font-open-sans text-text">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-lora font-bold text-gradient mb-4 relative">
            🔔 Notifications
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full opacity-20"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </h1>
          <motion.p
            className="font-open-sans text-primary/80 text-lg max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Stay updated with your book exchanges, messages, and community activities
          </motion.p>
        </motion.div>

        <motion.div
          className={`bookish-glass rounded-2xl border border-white/20 ${className}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {/* Enhanced Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl">
                  <BellIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-lora font-bold text-primary">
                    Your Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <motion.div
                      className="flex items-center gap-2 mt-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <span className="px-3 py-1 bg-gradient-to-r from-accent to-accent/80 text-white text-sm rounded-full font-medium shadow-lg">
                        {unreadCount} unread
                      </span>
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Enhanced Filter buttons */}
                <div className="flex bg-white/10 rounded-xl p-1 backdrop-blur-sm border border-white/20">
                  <motion.button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 font-medium ${
                      filter === 'all'
                        ? 'bg-gradient-to-r from-accent to-accent/80 text-white shadow-lg'
                        : 'text-primary/70 hover:text-primary hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    All
                  </motion.button>
                  <motion.button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 font-medium ${
                      filter === 'unread'
                        ? 'bg-gradient-to-r from-accent to-accent/80 text-white shadow-lg'
                        : 'text-primary/70 hover:text-primary hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Unread
                  </motion.button>
                </div>

                {/* Enhanced Mark all read button */}
                {unreadCount > 0 && (
                  <motion.button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-2 px-4 py-2 bookish-button-enhanced text-white text-sm rounded-xl font-medium shadow-lg"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isLoading}
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    Mark All Read
                  </motion.button>
                )}
              </div>
            </div>

            {/* Enhanced Bulk actions toolbar */}
            <AnimatePresence>
              {showBulkActions && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="mt-4 p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/20 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-primary">
                        {selectedNotifications.size} notification{selectedNotifications.size !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => handleBulkOperation('mark_read')}
                        className="flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <EyeIcon className="w-3 h-3" />
                        Mark Read
                      </motion.button>
                      <motion.button
                        onClick={() => handleBulkOperation('mark_unread')}
                        className="flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg"
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <EyeSlashIcon className="w-3 h-3" />
                        Mark Unread
                      </motion.button>
                      <motion.button
                        onClick={() => handleBulkOperation('delete')}
                        className="flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <TrashIcon className="w-3 h-3" />
                        Delete
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          setSelectedNotifications(new Set());
                          setShowBulkActions(false);
                        }}
                        className="flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all duration-200 shadow-lg"
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <XMarkIcon className="w-3 h-3" />
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhanced Select all checkbox */}
            {filteredNotifications.length > 0 && (
              <motion.div
                className="mt-4 flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectedNotifications.size === filteredNotifications.length}
                  onChange={handleSelectAll}
                  className="checkbox-enhanced"
                />
                <label htmlFor="select-all" className="text-sm font-medium text-primary cursor-pointer">
                  Select all notifications ({filteredNotifications.length})
                </label>
              </motion.div>
            )}
          </div>

          {/* Enhanced Notifications content */}
          <div className="p-6">
            {isLoading && filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <motion.div
                  className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-lg font-medium text-primary">Loading notifications...</p>
              </div>
            ) : error ? (
              <motion.div
                className="text-center py-20"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-6xl mb-4">😔</div>
                <p className="text-xl font-semibold text-red-600 mb-4">{error}</p>
                <motion.button
                  onClick={handleRetry}
                  className="bookish-button-enhanced px-6 py-3 text-white rounded-xl font-semibold shadow-lg"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Try Again
                </motion.button>
              </motion.div>
            ) : filteredNotifications.length === 0 ? (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-8xl mb-6">🔔</div>
                <h3 className="text-2xl font-lora font-bold text-primary mb-4">
                  {filter === 'unread' ? 'All Caught Up!' : 'No Notifications Yet'}
                </h3>
                <p className="text-primary/70 max-w-md mx-auto">
                  {filter === 'unread'
                    ? 'You\'re all up to date! Check back later for new updates.'
                    : 'Notifications about your book swaps, messages, and community activities will appear here.'}
                </p>
              </motion.div>
            ) : (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.notification_id}
                    ref={index === filteredNotifications.length - 1 ? lastNotificationRef : null}
                    className={`group bookish-glass rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                      notification.is_read
                        ? 'border-white/10 bg-white/5'
                        : 'border-accent/30 bg-white/10 shadow-md'
                    } ${
                      selectedNotifications.has(notification.notification_id)
                        ? 'ring-2 ring-accent/50 scale-[1.02]'
                        : ''
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    layout
                  >
                    <div className="flex items-start gap-4 p-6">
                      {/* Enhanced Selection checkbox */}
                      <motion.div
                        className="flex-shrink-0 mt-1"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedNotifications.has(notification.notification_id)}
                          onChange={() => handleSelectNotification(notification.notification_id)}
                          className="checkbox-enhanced"
                        />
                      </motion.div>

                      {/* Enhanced Notification icon */}
                      <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl text-lg transition-all duration-300 ${
                        notification.is_read
                          ? 'bg-white/10 text-primary/60'
                          : 'bg-gradient-to-br from-accent/20 to-primary/20 text-accent'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Enhanced Notification content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className={`text-base leading-relaxed ${
                              notification.is_read
                                ? 'text-primary/70'
                                : 'text-primary font-medium'
                            }`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <p className="text-sm text-primary/60">
                                {formatTimeAgo(notification.created_at)}
                              </p>
                              {notification.type && (
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                  notification.type === 'swap' ? 'bg-blue-100 text-blue-800' :
                                  notification.type === 'message' ? 'bg-green-100 text-green-800' :
                                  notification.type === 'system' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {notification.type}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Enhanced Read indicator */}
                          {!notification.is_read && (
                            <motion.div
                              className="w-3 h-3 bg-accent rounded-full flex-shrink-0 mt-1"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                        </div>

                        {/* Enhanced Action buttons */}
                        <div className="flex items-center gap-3 mt-4">
                          {!notification.is_read && (
                            <motion.button
                              onClick={() => handleMarkRead(notification.notification_id)}
                              className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-accent to-accent/80 text-white rounded-xl hover:from-accent/90 hover:to-accent/70 transition-all duration-200 shadow-lg font-medium"
                              whileHover={{ scale: 1.05, y: -1 }}
                              whileTap={{ scale: 0.95 }}
                              disabled={isLoading}
                            >
                              <CheckIcon className="w-4 h-4" />
                              Mark Read
                            </motion.button>
                          )}

                          <motion.button
                            onClick={() => handleDelete(notification.notification_id)}
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg font-medium"
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <TrashIcon className="w-4 h-4" />
                            Delete
                          </motion.button>

                          {/* Enhanced Link to related content */}
                          {notification.content_id && (
                            <Link
                              to={`/${notification.content_type}/${notification.content_id}`}
                              className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 transition-colors duration-200 font-medium"
                            >
                              <span>View Details</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Enhanced Loading state for pagination */}
            {isLoading && filteredNotifications.length > 0 && (
              <motion.div
                className="flex justify-center items-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full mr-3"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span className="text-primary/70 font-medium">Loading more notifications...</span>
              </motion.div>
            )}

            {/* Enhanced Pagination info */}
            {pagination.next && !isLoading && (
              <motion.div
                className="text-center mt-8 p-4 bg-white/10 rounded-xl border border-white/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm text-primary/70 font-medium">
                  📜 Scroll down to load more notifications
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotificationList;