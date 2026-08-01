import API from './reqInterceptor';

/**
 * Fetch all notifications for current user
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 20)
 */
export const getNotifications = async (page = 1, limit = 20) => {
  try {
    const response = await API.get('/notifications', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Mark a single notification as read
 * @param {string} notificationId - Notification ID
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await API.patch(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await API.patch('/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Get unread notification count
 * Used for badge on bell icon
 */
export const getUnreadCount = async () => {
  try {
    const response = await getNotifications(1, 1);
    return response.pagination?.unreadCount || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};
