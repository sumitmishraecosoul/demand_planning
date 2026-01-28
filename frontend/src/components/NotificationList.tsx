'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notificationAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiBell, FiCheck, FiX, FiCheckCircle, FiAlertCircle, FiFileText } from 'react-icons/fi';

interface Notification {
  _id: string;
  sender: {
    name: string;
    designation: string;
  };
  file: {
    _id: string;
    title: string;
    currentLevel?: {
      levelName: string;
    };
    status: string;
  };
  type: 'assigned' | 'passed' | 'rejected' | 'completed' | 'updated';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl: string;
  createdAt: string;
}

export default function NotificationList() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getNotifications();
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }
    router.push(notification.actionUrl);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assigned':
        return <FiBell className="w-5 h-5 text-blue-600" />;
      case 'completed':
        return <FiCheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <FiX className="w-5 h-5 text-red-600" />;
      default:
        return <FiFileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'assigned':
        return 'bg-blue-50 border-blue-200';
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const groupNotificationsByDate = (notifications: Notification[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: { [key: string]: Notification[] } = {
      Today: [],
      Yesterday: [],
      Older: []
    };

    notifications.forEach(notification => {
      const notifDate = new Date(notification.createdAt);
      notifDate.setHours(0, 0, 0, 0);

      if (notifDate.getTime() === today.getTime()) {
        groups.Today.push(notification);
      } else if (notifDate.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(notification);
      } else {
        groups.Older.push(notification);
      }
    });

    return groups;
  };

  const groupedNotifications = groupNotificationsByDate(notifications);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FiBell className="w-6 h-6" />
            Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Recent updates and assignments
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            <FiCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <FiBell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No notifications yet</p>
          <p className="text-sm text-gray-500 mt-1">
            You'll see updates here when files are assigned to you
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Today */}
          {groupedNotifications.Today.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Today
              </h3>
              <div className="space-y-3">
                {groupedNotifications.Today.map((notification) => (
                  <NotificationCard 
                    key={notification._id}
                    notification={notification}
                    onNotificationClick={handleNotificationClick}
                    getNotificationIcon={getNotificationIcon}
                    getNotificationColor={getNotificationColor}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Yesterday */}
          {groupedNotifications.Yesterday.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Yesterday
              </h3>
              <div className="space-y-3">
                {groupedNotifications.Yesterday.map((notification) => (
                  <NotificationCard 
                    key={notification._id}
                    notification={notification}
                    onNotificationClick={handleNotificationClick}
                    getNotificationIcon={getNotificationIcon}
                    getNotificationColor={getNotificationColor}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Older */}
          {groupedNotifications.Older.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Older
              </h3>
              <div className="space-y-3">
                {groupedNotifications.Older.map((notification) => (
                  <NotificationCard 
                    key={notification._id}
                    notification={notification}
                    onNotificationClick={handleNotificationClick}
                    getNotificationIcon={getNotificationIcon}
                    getNotificationColor={getNotificationColor}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Notification Card Component
function NotificationCard({ 
  notification, 
  onNotificationClick, 
  getNotificationIcon, 
  getNotificationColor, 
  formatTime 
}: {
  notification: any;
  onNotificationClick: (notification: any) => void;
  getNotificationIcon: (type: string) => JSX.Element;
  getNotificationColor: (type: string) => string;
  formatTime: (dateString: string) => string;
}) {
  return (
    <div
      onClick={() => onNotificationClick(notification)}
      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
        notification.isRead
          ? 'bg-white border-gray-200'
          : `${getNotificationColor(notification.type)} border-2`
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-sm">
              {notification.title}
            </h3>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formatTime(notification.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-1">
            {notification.message}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <FiFileText className="w-3 h-3" />
              {notification.file?.title}
            </span>
            {notification.file?.currentLevel && (
              <span>• {notification.file.currentLevel.levelName}</span>
            )}
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                notification.file?.status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : notification.file?.status === 'rejected'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {notification.file?.status}
            </span>
          </div>
        </div>

        {/* Unread Indicator */}
        {!notification.isRead && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
}
