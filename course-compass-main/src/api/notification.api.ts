import API from "./client";

export type NotificationCategory =
  | "COURSE"
  | "ASSIGNMENT"
  | "QUIZ"
  | "ANNOUNCEMENT"
  | "SYSTEM"
  | "PAYMENT"
  | "MESSAGE";

export interface NotificationItem {
  id: string;
  userId: string | null;
  title: string;
  message: string;
  category: NotificationCategory;
  isRead: boolean;
  isBroadcast: boolean;
  link?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  success: boolean;
  data: NotificationItem[];
  unreadCount: number;
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const notificationApi = {
  getNotifications: (page = 1, limit = 20) =>
    API.get<NotificationListResponse>("/notifications", { params: { page, limit } }),

  getUnreadCount: () => API.get<{ success: boolean; data: { unreadCount: number } }>("/notifications/unread-count"),

  markRead: (id: string) => API.patch(`/notifications/${id}/read`),

  markAllRead: () => API.patch("/notifications/read-all"),

  broadcast: (data: { title: string; message: string; category?: NotificationCategory; link?: string; roles?: string[] }) =>
    API.post("/admin/notifications/broadcast", data),
};
