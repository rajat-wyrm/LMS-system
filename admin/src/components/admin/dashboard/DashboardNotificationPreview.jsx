import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MdPersonAdd,
  MdCheckCircle,
  MdPayments,
  MdUpdate,
  MdError,
} from 'react-icons/md';

const CATEGORY_ICONS = {
  enrollment: MdPersonAdd,
  completion: MdCheckCircle,
  revenue: MdPayments,
  courseUpdate: MdUpdate,
  critical: MdError,
};

const notificationPreview = [
  {
    id: 1,
    title: 'Admin dashboard metrics are live',
    desc: 'Cards are now reading values from the backend API.',
    time: 'Just now',
    category: 'completion',
    accent: '#10B981',
    priority: false,
  },
  {
    id: 2,
    title: 'Pending users require review',
    desc: 'Check new instructor and learner signups awaiting approval.',
    time: 'Today',
    category: 'enrollment',
    accent: '#3B82F6',
    priority: false,
  },
  {
    id: 3,
    title: 'Analytics endpoint connected',
    desc: 'Overview charts now have a valid backend route.',
    time: 'Today',
    category: 'courseUpdate',
    accent: '#8B5CF6',
    priority: false,
  },
];

const DashboardNotificationPreview = () => (
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
        {notificationPreview.length} new
      </span>
    </div>

    <ul className="flex flex-col gap-2 m-0 p-0 list-none">
      {notificationPreview.slice(0, 5).map((item, index) => {
        const Icon = CATEGORY_ICONS[item.category];
        return (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18 + index * 0.04 }}
            className="flex gap-2.5 p-2.5 rounded-xl border transition-colors hover:bg-[var(--admin-surface-hover)]"
            style={{
              borderColor: item.priority ? `${item.accent}50` : 'var(--admin-border-subtle)',
              background: 'var(--admin-surface-raised)',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
              style={{ background: item.accent }}
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
                    style={{ background: item.accent, boxShadow: `0 0 6px ${item.accent}` }}
                    title="High priority"
                  />
                )}
              </div>
              <p className="text-[11px] admin-text-muted line-clamp-1 mt-0.5">{item.desc}</p>
              <p className="text-[10px] admin-text-secondary mt-1">{item.time}</p>
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

export default DashboardNotificationPreview;
