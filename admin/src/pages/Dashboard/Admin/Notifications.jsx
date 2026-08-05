import { useMemo, useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  MdNotificationsOff,
  MdFiberManualRecord,
} from 'react-icons/md';

import NotificationsHero from '../../../components/admin/notifications/NotificationsHero';
import NotificationsKpiCards from '../../../components/admin/notifications/NotificationsKpiCards';
import RealtimeBanner from '../../../components/admin/notifications/RealtimeBanner';
import NotificationsToolbar from '../../../components/admin/notifications/NotificationsToolbar';
import NotificationCard from '../../../components/admin/notifications/NotificationCard';
import NotificationDetailDrawer from '../../../components/admin/notifications/NotificationDetailDrawer';
import {
  initialNotifications,
  CATEGORY_META,
  TIMELINE_ORDER,
  PRIORITY_META,
  PRIORITIES,
} from '../../../components/admin/notifications/constants';

const Notifications = () => {
  const [notifs, setNotifs] = useState(initialNotifications);
  const [search, setSearch] = useState('');
  const [primaryFilter, setPrimaryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [readFilter, setReadFilter] = useState('all');
  const [viewMode, setViewMode] = useState('inbox');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [activeNotif, setActiveNotif] = useState(null);
  const [realtimeBanner, setRealtimeBanner] = useState(true);
  const [newCount, setNewCount] = useState(3);

  useEffect(() => {
    const t = setInterval(() => {
      setNewCount((c) => (c < 5 ? c + 1 : c));
      setRealtimeBanner(true);
    }, 45000);
    return () => clearInterval(t);
  }, []);

  const activeNotifs = useMemo(
    () => notifs.filter((n) => (showArchived ? n.archived : !n.archived)),
    [notifs, showArchived],
  );

  const stats = useMemo(() => {
    const total = activeNotifs.length;
    const unread = activeNotifs.filter((n) => !n.read).length;
    const highPriority = activeNotifs.filter(
      (n) => n.priority === 'critical' || n.priority === 'high',
    ).length;
    const pinned = activeNotifs.filter((n) => n.pinned).length;
    return { total, unread, highPriority, pinned };
  }, [activeNotifs]);

  const activitySummary = useMemo(() => {
    const critical = activeNotifs.filter((n) => !n.read && n.priority === 'critical').length;
    if (stats.unread === 0) {
      return 'Your inbox is clear. All platform alerts have been reviewed — check archived items or adjust filters to browse history.';
    }
    if (critical > 0) {
      return `${stats.unread} unread alert${stats.unread !== 1 ? 's' : ''} across your workspace — ${critical} critical item${critical !== 1 ? 's' : ''} need immediate attention. Triage with filters or bulk actions below.`;
    }
    return `${stats.unread} unread alert${stats.unread !== 1 ? 's' : ''} in your inbox. Use search, category filters, and timeline view to triage course, payment, and system updates efficiently.`;
  }, [activeNotifs, stats.unread]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activeNotifs.filter((n) => {
      if (q && !`${n.title} ${n.desc}`.toLowerCase().includes(q)) return false;

      if (primaryFilter === 'Read/Unread') {
        if (readFilter === 'unread' && n.read) return false;
        if (readFilter === 'read' && !n.read) return false;
      } else if (primaryFilter === 'Priority') {
        if (priorityFilter !== 'all' && n.priority !== priorityFilter) return false;
      } else if (primaryFilter !== 'All') {
        const catKey = Object.entries(CATEGORY_META).find(
          ([, m]) => m.filter === primaryFilter,
        )?.[0];
        if (catKey && n.category !== catKey) return false;
      }

      return true;
    });
  }, [activeNotifs, search, primaryFilter, priorityFilter, readFilter]);

  const pinnedList = filtered.filter((n) => n.pinned);
  const inboxList = filtered.filter((n) => !n.pinned);

  const timelineGroups = useMemo(() => {
    const map = {};
    TIMELINE_ORDER.forEach((g) => {
      map[g] = [];
    });
    filtered.forEach((n) => {
      const g = TIMELINE_ORDER.includes(n.timelineGroup) ? n.timelineGroup : 'Earlier';
      map[g].push(n);
    });
    return map;
  }, [filtered]);

  const updateNotif = useCallback((id, patch) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
    setActiveNotif((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));
  }, []);

  const markRead = (id) => updateNotif(id, { read: true });
  const togglePin = (id) =>
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  const archiveNotif = (id) => updateNotif(id, { archived: true });
  const deleteNotif = (id) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
    setSelectedIds((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
    if (activeNotif?.id === id) setActiveNotif(null);
  };

  const markAllRead = () => {
    setNotifs((prev) =>
      prev.map((n) => (showArchived ? n : !n.archived ? { ...n, read: true } : n)),
    );
  };

  const clearAll = () => {
    if (showArchived) {
      setNotifs((prev) => prev.filter((n) => !n.archived));
    } else {
      setNotifs((prev) => prev.filter((n) => n.archived));
    }
    setSelectedIds(new Set());
    setActiveNotif(null);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelectedIds(new Set(filtered.map((n) => n.id)));
  };

  const bulkMarkRead = () => {
    setNotifs((prev) => prev.map((n) => (selectedIds.has(n.id) ? { ...n, read: true } : n)));
    setSelectedIds(new Set());
  };

  const bulkArchive = () => {
    setNotifs((prev) => prev.map((n) => (selectedIds.has(n.id) ? { ...n, archived: true } : n)));
    setSelectedIds(new Set());
  };

  const bulkDelete = () => {
    setNotifs((prev) => prev.filter((n) => !selectedIds.has(n.id)));
    setSelectedIds(new Set());
  };

  const dismissBanner = () => {
    setRealtimeBanner(false);
    setNewCount(0);
  };

  const handlePrimaryFilterChange = (f) => {
    setPrimaryFilter(f);
    if (f !== 'Priority') setPriorityFilter('all');
    if (f !== 'Read/Unread') setReadFilter('all');
  };

  const handleSelectionModeToggle = () => {
    setSelectionMode((v) => !v);
    setSelectedIds(new Set());
  };

  const renderList = (list) => (
    <AnimatePresence mode="popLayout">
      {list.map((n) => (
        <NotificationCard
          key={n.id}
          notif={n}
          selected={selectedIds.has(n.id)}
          selectionMode={selectionMode}
          onSelect={toggleSelect}
          onView={setActiveNotif}
          onPin={togglePin}
          onArchive={archiveNotif}
          onMarkRead={markRead}
          onDelete={deleteNotif}
        />
      ))}
    </AnimatePresence>
  );

  return (
    <div className="admin-page space-y-6 md:space-y-8 animate-fade-in relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
      <NotificationsHero
        unreadCount={stats.unread}
        activitySummary={activitySummary}
        onMarkAllRead={markAllRead}
        onClearAll={clearAll}
      />

      <RealtimeBanner
        visible={realtimeBanner}
        newCount={newCount}
        onView={() => {
          handlePrimaryFilterChange('Read/Unread');
          setReadFilter('unread');
          dismissBanner();
        }}
        onDismiss={dismissBanner}
      />

      <NotificationsKpiCards stats={stats} />

      <NotificationsToolbar
        search={search}
        onSearchChange={setSearch}
        primaryFilter={primaryFilter}
        onPrimaryFilterChange={handlePrimaryFilterChange}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        readFilter={readFilter}
        onReadFilterChange={setReadFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectionMode={selectionMode}
        onSelectionModeToggle={handleSelectionModeToggle}
        showArchived={showArchived}
        onShowArchivedChange={setShowArchived}
        selectedCount={selectedIds.size}
        onSelectAllVisible={selectAllVisible}
        onBulkMarkRead={bulkMarkRead}
        onBulkArchive={bulkArchive}
        onBulkDelete={bulkDelete}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto]">
        <div className="min-w-0 space-y-3">
          {filtered.length === 0 ? (
            <div
              className="rounded-2xl border border-dashed py-16 text-center"
              style={{ borderColor: 'var(--admin-border)' }}
            >
              <MdNotificationsOff size={40} className="mx-auto mb-3 admin-text-muted" />
              <p className="text-sm admin-text-muted">No notifications match your filters.</p>
            </div>
          ) : viewMode === 'inbox' ? (
            <>
              {pinnedList.length > 0 && (
                <section>
                  <div className="mb-2 flex items-center gap-2">
                    <MdFiberManualRecord className="text-amber-500" size={8} />
                    <span className="text-[10px] font-bold uppercase tracking-widest admin-text-muted">
                      Pinned
                    </span>
                  </div>
                  <div className="space-y-2">{renderList(pinnedList)}</div>
                </section>
              )}
              <section>
                {pinnedList.length > 0 && (
                  <div className="mb-2 flex items-center gap-2">
                    <MdFiberManualRecord className="admin-text-muted" size={8} />
                    <span className="text-[10px] font-bold uppercase tracking-widest admin-text-muted">
                      Inbox
                    </span>
                  </div>
                )}
                <div className="space-y-2">{renderList(inboxList)}</div>
              </section>
            </>
          ) : (
            <div className="relative space-y-8 pl-4 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-gradient-to-b before:from-[#F97316]/50 before:via-[var(--admin-border-subtle)] before:to-transparent">
              {TIMELINE_ORDER.map((group) => {
                const items = timelineGroups[group];
                if (!items?.length) return null;
                return (
                  <section key={group} className="relative">
                    <div className="mb-3 flex items-center gap-3">
                      <span
                        className="relative z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2"
                        style={{
                          borderColor: '#F97316',
                          background: 'var(--admin-surface-raised)',
                        }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
                      </span>
                      <h3 className="text-xs font-bold uppercase tracking-widest admin-text-secondary">
                        {group}
                      </h3>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold admin-text-muted"
                        style={{ background: 'var(--admin-stat-pill-bg)' }}
                      >
                        {items.length}
                      </span>
                    </div>
                    <div className="ml-6 space-y-2">{renderList(items)}</div>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeNotif && (
            <NotificationDetailDrawer
              key={activeNotif.id}
              notif={activeNotif}
              onClose={() => setActiveNotif(null)}
              onMarkRead={markRead}
              onPin={togglePin}
              onArchive={archiveNotif}
            />
          )}
        </AnimatePresence>
      </div>

      <div
        className="flex flex-wrap items-center gap-4 rounded-xl border px-4 py-3"
        style={{
          borderColor: 'var(--admin-border-subtle)',
          background: 'var(--admin-surface)',
        }}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider admin-text-muted">
          Priority indicators
        </span>
        {PRIORITIES.map((p) => (
          <span key={p} className="inline-flex items-center gap-1.5 text-[11px] admin-text-muted">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: PRIORITY_META[p].iconBg }}
            />
            {PRIORITY_META[p].label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
