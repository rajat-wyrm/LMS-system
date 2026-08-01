import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import {
  MdPersonAdd,
  MdCheckCircle,
  MdPayments,
  MdUpdate,
  MdError,
} from 'react-icons/md';
import { apiFetch } from '../../../api/config';

const CATEGORY_ICONS = {
  enrollment: MdPersonAdd,
  completion: MdCheckCircle,
  revenue: MdPayments,
  courseUpdate: MdUpdate,
  critical: MdError,
};

const ACCENTS = { enrollment: '#3B82F6', completion: '#10B981', revenue: '#F59E0B', courseUpdate: '#8B5CF6', critical: '#EF4444' };
const relativeTime = (value) => {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
};

const DashboardNotificationPreview = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadNotifications = useCallback(async () => {
    try {
      const { data } = await apiFetch('/admin/dashboard/notifications');
      setNotifications(data || []);
    } catch (error) {
      console.error('Dashboard notifications fetch failed:', error);
      setNotifications([]);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { loadNotifications(); }, [loadNotifications]);
  return (
  <motion.aside
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.15 }}
    className="rounded-2xl border p-3 md:p-4 shadow-[var(--admin-shadow-card)] bg-[var(--admin-surface)]"
    style={{ borderColor: 'var(--admin-border)' }}
  >
    <div className="flex items-center justify-between mb-2.5">
      <h2 className="text-base font-bold admin-text-primary">Notifications</h2>
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full admin-text-secondary bg-[var(--admin-surface-raised)]">
        {notifications.length} new
      </span>
    </div>

    <ul className="flex flex-col gap-2 m-0 p-0 list-none">
      {loading ? <li className="text-sm admin-text-muted py-4">Loading notifications…</li> : notifications.length === 0 ? <li className="text-sm admin-text-muted py-4">No notifications.</li> : notifications.map((item, index) => {
        const Icon = CATEGORY_ICONS[item.category];
        const accent = ACCENTS[item.category] || ACCENTS.critical;
        return (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18 + index * 0.04 }}
            className="flex gap-2.5 p-2.5 rounded-xl border transition-colors hover:bg-[var(--admin-surface-hover)]"
            style={{
              borderColor: item.priority ? `${accent}50` : 'var(--admin-border-subtle)',
              background: 'var(--admin-surface-raised)',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
              style={{ background: accent }}
            >
              <Icon size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <p className="text-xs font-semibold admin-text-primary leading-snug line-clamp-1">
                  {item.title}
                </p>
                {item.priority && (
                  <span
                    className="shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
                    style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
                    title="High priority"
                  />
                )}
              </div>
              <p className="text-[11px] admin-text-muted line-clamp-1 mt-0.5">{item.desc}</p>
              <p className="text-[10px] admin-text-secondary mt-1">{relativeTime(item.createdAt)}</p>
            </div>
          </motion.li>
        );
      })}
    </ul>

    <Link
      to="/dashboard/admin/notifications"
      className="mt-2.5 pt-2.5 border-t block text-xs font-semibold text-center text-[#3B82F6] hover:text-[#60A5FA] transition-colors"
      style={{ borderColor: 'var(--admin-border-subtle)' }}
    >
      View All Notifications →
    </Link>
  </motion.aside>
  );
};

export default DashboardNotificationPreview;
