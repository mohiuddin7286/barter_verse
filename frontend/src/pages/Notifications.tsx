import React, { useState, useEffect } from 'react';
import { Bell, Trash2, Check, AlertCircle, Filter, Settings } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_type?: string;
  related_id?: string;
  action_url?: string;
  created_at: string;
}

type FilterType = 'all' | 'unread' | 'read';
type SortType = 'newest' | 'oldest';

/**
 * Notification Center Page
 * Full notification management with filtering, sorting, and preferences
 */
export const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and sorting
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('newest');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showPreferences, setShowPreferences] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 15;

  // Notification preferences
  const [preferences, setPreferences] = useState<any>(null);
  const [preferencesLoading, setPreferencesLoading] = useState(false);

  // Fetch notifications on mount and when filters change
  useEffect(() => {
    fetchNotifications();
  }, [filterType, sortType, selectedType, currentPage]);

  // Fetch preferences on mount
  useEffect(() => {
    fetchPreferences();
  }, []);

  // Apply sorting and filtering
  useEffect(() => {
    let filtered = [...notifications];

    // Filter by read status
    if (filterType === 'unread') {
      filtered = filtered.filter((n) => !n.is_read);
    } else if (filterType === 'read') {
      filtered = filtered.filter((n) => n.is_read);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter((n) => n.type === selectedType);
    }

    // Sort
    if (sortType === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredNotifications(filtered);
  }, [notifications, filterType, sortType, selectedType]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getNotifications(
        filterType === 'unread' ? false : filterType === 'read' ? true : undefined,
        selectedType !== 'all' ? selectedType : undefined,
        itemsPerPage,
        (currentPage - 1) * itemsPerPage
      );
      const data = res.data?.data;
      setNotifications(data?.notifications || []);
      setTotalCount(data?.total || 0);
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      setPreferencesLoading(true);
      const res = await api.getNotificationPreferences();
      setPreferences(res.data?.data);
    } catch (err) {
      console.error('Error fetching preferences:', err);
    } finally {
      setPreferencesLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await api.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setTotalCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) {
      return;
    }

    try {
      await api.clearAllNotifications();
      setNotifications([]);
      setTotalCount(0);
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const handleUpdatePreference = async (key: string, value: boolean | string) => {
    try {
      const updated = { ...preferences, [key]: value };
      await api.updateNotificationPreferences({ [key]: value });
      setPreferences(updated);
    } catch (err) {
      console.error('Error updating preference:', err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'trade_offer':
      case 'trade_accepted':
      case 'trade_completed':
        return '💼';
      case 'quest_completed':
      case 'achievement':
        return '⭐';
      case 'message':
        return '💬';
      case 'review':
        return '⭐';
      case 'comment':
        return '💭';
      default:
        return 'ℹ️';
    }
  };

  const getTypeLabel = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const uniqueTypes = Array.from(new Set(notifications.map((n) => n.type)));
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 rounded-lg">
                <Bell className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Notifications</h1>
                <p className="text-gray-400 text-sm mt-1">
                  {unreadCount} unread • {totalCount} total
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="p-2 text-gray-400 hover:text-amber-400 rounded-lg hover:bg-gray-900/50 transition-colors"
              title="Notification Preferences"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>

          {/* Action Buttons */}
          {notifications.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
              >
                Mark all as read
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Preferences Panel */}
        {showPreferences && preferences && (
          <div className="mb-8 p-6 bg-gray-900/50 border border-gray-700/50 rounded-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Notification Preferences</h2>

            {preferencesLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-400"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Frequency */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Notification Frequency
                  </label>
                  <select
                    value={preferences.frequency || 'immediate'}
                    onChange={(e) => handleUpdatePreference('frequency', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Digest</option>
                  </select>
                </div>

                {/* Channel Toggles */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.email_enabled || false}
                      onChange={(e) => handleUpdatePreference('email_enabled', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 text-amber-500"
                    />
                    <span className="text-sm text-gray-300">Email Notifications</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.in_app_enabled || false}
                      onChange={(e) => handleUpdatePreference('in_app_enabled', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 text-amber-500"
                    />
                    <span className="text-sm text-gray-300">In-App Notifications</span>
                  </label>
                </div>

                {/* Type-specific toggles */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2 uppercase">Notification Types</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['trades', 'quests', 'messages', 'reviews', 'comments'].map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences[`in_app_${type}`] !== false}
                          onChange={(e) =>
                            handleUpdatePreference(`in_app_${type}`, e.target.checked)
                          }
                          className="w-4 h-4 rounded border-gray-600 text-amber-500"
                        />
                        <span className="text-xs text-gray-400 capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {/* Filter Buttons */}
          <div className="flex gap-2">
            {(['all', 'unread', 'read'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setFilterType(filter);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  filterType === filter
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-900/50 text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          {uniqueTypes.length > 0 && (
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-400 text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {getTypeLabel(type)}
                </option>
              ))}
            </select>
          )}

          {/* Sort */}
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value as SortType)}
            className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-400 text-sm focus:outline-none focus:border-amber-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 px-6 py-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="w-12 h-12 text-gray-700 mb-3" />
            <p className="text-gray-400">No notifications yet</p>
            <p className="text-gray-600 text-sm mt-1">
              {filterType !== 'all'
                ? 'No notifications match your filters'
                : "Check back later for updates on your trades, quests, and more!"}
            </p>
          </div>
        ) : (
          <>
            {/* Notifications Grid */}
            <div className="space-y-3 mb-8">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    notification.is_read
                      ? 'bg-gray-900/50 border-gray-700/50 hover:border-gray-600/50'
                      : 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="text-2xl flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <h3 className="font-semibold text-white">{notification.title}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {getTypeLabel(notification.type)} •{' '}
                            {formatTime(notification.created_at)}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-amber-400 rounded-full mt-2"></span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">{notification.message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex gap-2 ml-4">
                      {!notification.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-gray-800/50 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-800/50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-600"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      currentPage === page
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-900/50 border border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-600"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
