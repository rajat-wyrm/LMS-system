import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/store/AuthContext";
import { notificationApi, type NotificationItem } from "@/api/notification.api";
import { connectSocket, disconnectSocket } from "@/lib/socket";

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const PAGE_SIZE = 20;

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);

  const loadPage = useCallback(async (pageNumber: number, replace: boolean) => {
    setIsLoading(true);
    try {
      const res = await notificationApi.getNotifications(pageNumber, PAGE_SIZE);
      const { data, unreadCount: count, meta } = res.data;
      setUnreadCount(count);
      setNotifications((prev) => (replace ? data : [...prev, ...data]));
      setHasMore(meta.page < meta.totalPages);
      pageRef.current = meta.page;
      setPage(meta.page);
    } catch {
      // Non-fatal: leave existing state as-is
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadPage(1, true);
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    await loadPage(pageRef.current + 1, false);
  }, [isLoading, hasMore, loadPage]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await notificationApi.markRead(id);
    } catch {
      // Socket "notification:count" / manual refresh will reconcile on failure
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await notificationApi.markAllRead();
    } catch {
      // ignore; will reconcile on next refresh/socket event
    }
  }, []);

  // Connect the socket + fetch initial state whenever the user logs in;
  // tear both down on logout.
  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnectSocket();
      setNotifications([]);
      setUnreadCount(0);
      setHasMore(true);
      pageRef.current = 1;
      setPage(1);
      return;
    }

    refresh();
    notificationApi
      .getUnreadCount()
      .then((res) => setUnreadCount(res.data.data.unreadCount))
      .catch(() => {});

    const socket = connectSocket(token);

    const onNew = (notification: NotificationItem) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((c) => c + 1);
    };

    const onBroadcast = (payload: Omit<NotificationItem, "id" | "isRead" | "userId">) => {
      // The DB row is already persisted server-side; refresh to pick up the
      // real id/userId rather than rendering a synthetic optimistic entry.
      refresh();
    };

    const onRead = ({ id }: { id: string }) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    };

    const onReadAll = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    const onCount = ({ unreadCount: count }: { unreadCount: number }) => {
      setUnreadCount(count);
    };

    socket.on("notification:new", onNew);
    socket.on("notification:broadcast", onBroadcast);
    socket.on("notification:read", onRead);
    socket.on("notification:read-all", onReadAll);
    socket.on("notification:count", onCount);

    return () => {
      socket.off("notification:new", onNew);
      socket.off("notification:broadcast", onBroadcast);
      socket.off("notification:read", onRead);
      socket.off("notification:read-all", onReadAll);
      socket.off("notification:count", onCount);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, isLoading, hasMore, loadMore, markAsRead, markAllAsRead, refresh }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within a NotificationProvider");
  return ctx;
};
