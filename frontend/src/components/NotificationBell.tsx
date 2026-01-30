import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Trash2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

interface NotificationBellProps {
  isAuthenticated: boolean;
}

/**
 * Notification Bell Component for Navbar
 * Shows notification count and recent notifications in a dropdown
 */
export const NotificationBell: React.FC<NotificationBellProps> = ({ isAuthenticated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications on mount and when dropdown opens
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      fetchNotifications();
    }
  }, [isOpen, isAuthenticated]);

  // Fetch unread count periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchCount = async () => {
      try {
        const res = await api.getUnreadNotificationCount();
        setUnreadCount(res.data?.data?.unreadCount || 0);
      } catch (err) {
        // Silently fail for periodic checks
      }
    };

    // Initial fetch
    fetchCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getRecentNotifications(5);
      const data = res.data?.data;
      setNotifications(data?.notifications || []);
      setUnreadCount(data?.unreadCount || 0);
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    try {
      await api.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    try {
      await api.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
    if (!notification.is_read) {
      handleMarkAsRead(new MouseEvent('click') as any, notification.id);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconClass = 'w-4 h-4';
    switch (type) {
      case 'trade_offer':
      case 'trade_accepted':
      case 'trade_completed':
        return <span className="text-blue-400">💼</span>;
      case 'quest_completed':
      case 'achievement':
        return <span className="text-amber-400">⭐</span>;
      case 'message':
        return <span className="text-green-400">💬</span>;
      case 'review':
        return <span className="text-purple-400">⭐</span>;
      case 'comment':
        return <span className="text-orange-400">💭</span>;
      default:
        return <span className="text-gray-400">ℹ️</span>;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-amber-400 transition-colors rounded-lg hover:bg-gray-900/50"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-900 border border-gray-700/50 rounded-xl shadow-2xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400"></div>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 px-4 py-6 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-gray-700/50">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      notification.is_read
                        ? 'bg-gray-900/50 hover:bg-gray-800/50'
                        : 'bg-amber-500/10 hover:bg-amber-500/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex gap-1 ml-2">
                        {!notification.is_read && (
                          <button
                            onClick={(e) => handleMarkAsRead(e, notification.id)}
                            className="p-1 text-gray-400 hover:text-blue-400 transition-colors rounded"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(e, notification.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-700/50 bg-gray-900/50">
              <a
                href="/notifications"
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                View all notifications →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
