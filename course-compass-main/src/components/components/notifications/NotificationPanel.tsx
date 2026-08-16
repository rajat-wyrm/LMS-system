import { Link } from "react-router-dom";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import { getCategoryStyle } from "./categoryStyles";
import type { NotificationItem } from "@/api/notification.api";

const timeAgo = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const NotificationRow = ({
  notification,
  onRead,
  onNavigate,
}: {
  notification: NotificationItem;
  onRead: (id: string) => void;
  onNavigate: () => void;
}) => {
  const style = getCategoryStyle(notification.category);
  const Icon = style.icon;

  const content = (
    <div
      onClick={() => {
        if (!notification.isRead) onRead(notification.id);
        onNavigate();
      }}
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/40 ${
        notification.isRead ? "opacity-70" : "bg-primary/5"
      }`}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{ background: style.bg, color: style.color }}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm truncate ${notification.isRead ? "font-normal" : "font-semibold"}`}>
            {notification.title}
          </p>
          {!notification.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.message}</p>
        <p className="text-[10px] text-muted-foreground/70 mt-1">{timeAgo(notification.createdAt)}</p>
      </div>
    </div>
  );

  return notification.link ? (
    <Link to={notification.link}>{content}</Link>
  ) : (
    <div>{content}</div>
  );
};

export const NotificationPanel = ({ onClose }: { onClose: () => void }) => {
  const { notifications, unreadCount, isLoading, hasMore, loadMore, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <div className="w-[380px] max-w-[90vw] glass-card border border-border/70 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <h3 className="font-display font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      <div className="max-h-[420px] overflow-y-auto divide-y divide-border/50">
        {isLoading && notifications.length === 0 ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <Bell className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">You're all caught up!</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              New notifications will show up here in real time.
            </p>
          </div>
        ) : (
          <>
            {notifications.map((n) => (
              <NotificationRow key={n.id} notification={n} onRead={markAsRead} onNavigate={onClose} />
            ))}
            {hasMore && (
              <button
                onClick={() => loadMore()}
                disabled={isLoading}
                className="w-full py-3 text-xs text-secondary hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Load more"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
