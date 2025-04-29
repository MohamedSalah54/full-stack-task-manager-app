// src/lib/notificationService.ts
import axios from "./api";

// Get ALL notifications for user (with optional unreadOnly filter)
export const fetchNotifications = async (userId: string, unreadOnly = false) => {
  const { data } = await axios.get(`/notifications/${userId}`, {
    params: {
      unreadOnly,  // لو عايز تجيب بس الإشعارات الغير مقروءة
    },
  });
  return data;
};
export const getAllNotifications = async (): Promise<Notification[]> => {
  const response = await axios.get('/notifications'); // Endpoint مخصص للـ admin
  return response.data;
};

// Mark notification as read
export const markNotificationAsRead = async (id: string) => {
  const { data } = await axios.patch(`/notifications/read/${id}`);
  return data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId: string) => {
  const { data } = await axios.patch(`/notifications/read-all/${userId}`);
  return data;
};
