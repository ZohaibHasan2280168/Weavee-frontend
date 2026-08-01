import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../../services/notificationService';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /**
   * Fetch notifications from backend
   */
  const fetchNotifications = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await getNotifications(page, 10);
      
      if (response.success) {
        setNotifications(response.data);
        setCurrentPage(response.pagination.page);
        setTotalPages(response.pagination.pages);
        setUnreadCount(response.pagination.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mark single notification as read
   */
  const handleMarkAsRead = useCallback(async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, []);

  /**
   * Add new notification in real-time
   */
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  /**
   * Refresh unread count
   */
  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await getNotifications(1, 1);
      setUnreadCount(response.pagination?.unreadCount || 0);
    } catch (error) {
      console.error('Failed to refresh unread count:', error);
    }
  }, []);

  /**
   * Polling - fetch notifications every 30 seconds
   */
  useEffect(() => {
    if (!user?.role) {
      return; // Only fetch notifications after a real authenticated user exists
    }

    // Initial fetch
    fetchNotifications(1);

    // Set up polling

    // const pollInterval = setInterval(() => {
    //   if (user?.role) {
    //     refreshUnreadCount();
    //   }
    // }, 30000);

    // return () => clearInterval(pollInterval);

  }, [user, fetchNotifications, refreshUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    currentPage,
    totalPages,
    fetchNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    addNotification,
    refreshUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
