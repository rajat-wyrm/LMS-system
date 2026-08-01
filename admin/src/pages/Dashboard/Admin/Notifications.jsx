import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import NotificationsHero from '../../../components/admin/notifications/NotificationsHero';
import NotificationsToolbar from '../../../components/admin/notifications/NotificationsToolbar';
import NotificationCard from '../../../components/admin/notifications/NotificationCard';
import NotificationsEmptyState from '../../../components/admin/notifications/NotificationsEmptyState';
import { initialNotifications, CATEGORY_META } from '../../../components/admin/notifications/constants';

const Notifications = () => {
  const [notifs, setNotifs] = useState(initialNotifications);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const unreadCount = useMemo(() => notifs.filter((n) => !n.read).length, [notifs]);

  const filterCounts = useMemo(() => {
    const counts = { All: notifs.length, Unread: 0, Read: 0 };
    notifs.forEach((n) => {
      if (n.read) counts.Read += 1;
      else counts.Unread += 1;
      const label = CATEGORY_META[n.category]?.label;
      if (label) counts[label] = (counts[label] ?? 0) + 1;
    });
    return counts;
  }, [notifs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notifs.filter((n) => {
      if (q && !`${n.title} ${n.desc}`.toLowerCase().includes(q)) return false;

      if (filter === 'Unread') return !n.read;
      if (filter === 'Read') return n.read;
      if (filter !== 'All') return n.category === filter.toLowerCase();

      return true;
    });
  }, [notifs, search, filter]);

  const markRead = (id) =>
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

  const deleteNotif = (id) => setNotifs((prev) => prev.filter((n) => n.id !== id));

  return (
    <div className="admin-page space-y-6 md:space-y-8 animate-fade-in relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
      <NotificationsHero unreadCount={unreadCount} onMarkAllRead={markAllRead} />

      <NotificationsToolbar
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        counts={filterCounts}
      />

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <NotificationsEmptyState hasNotifications={notifs.length > 0} />
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((n) => (
              <NotificationCard
                key={n.id}
                notif={n}
                onMarkRead={markRead}
                onDelete={deleteNotif}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Notifications;
