import { api } from "./api";
import { orgPath } from "./org";

export type NotificationRecord = {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: unknown;
};

export async function listNotifications() {
  const response = await api.get(orgPath("/notifications"));
  return response.data.data as { notifications: NotificationRecord[] };
}

export async function getUnreadNotificationCount() {
  const response = await api.get(orgPath("/notifications/unread-count"));
  return response.data.data as { unreadCount: number };
}

export async function markNotificationRead(notificationId: string) {
  const response = await api.patch(orgPath(`/notifications/${notificationId}/read`));
  return response.data.data as { notification: NotificationRecord };
}

export async function markAllNotificationsRead() {
  const response = await api.patch(orgPath("/notifications/read-all"));
  return response.data.data as Record<string, never>;
}

