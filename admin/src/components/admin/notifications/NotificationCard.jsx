import React from 'react';
import { motion } from 'framer-motion';
import { CATEGORY_META } from './constants';
import NotificationActionMenu from './NotificationActionMenu';

const NotificationCard = ({ notif, onMarkRead, onDelete }) => {
  const cat = CATEGORY_META[notif.category];
  const CatIcon = cat.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 12 }}
      whileHover={{ y: -4, scale: 1.005, boxShadow: 'var(--admin-shadow-lg)' }}
      transition={{ duration: 0.2 }}
      className="group relative flex items-start gap-4 rounded-2xl border p-4 shadow-[var(--admin-shadow-card)]"
      style={{
        borderColor: 'var(--admin-border)',
        borderLeft: !notif.read ? '3px solid #14B8A6' : undefined,
        background: !notif.read ? 'var(--admin-surface-raised)' : 'var(--admin-surface)',
      }}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md"
        style={{ background: cat.color }}
      >
        <CatIcon size={20} className="text-white" />
      </div>

      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="text-[11px] admin-text-muted tabular-nums">{notif.time}</span>
          <span
            className="rounded-md border px-2 py-0.5 text-[10px] font-semibold admin-text-secondary"
            style={{
              borderColor: 'var(--admin-border-subtle)',
              background: 'var(--admin-stat-pill-bg)',
            }}
          >
            {cat.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!notif.read && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#14B8A6]" aria-hidden />
          )}
          <h3
            className={`truncate text-sm font-semibold ${
              notif.read ? 'admin-text-secondary' : 'admin-text-primary'
            }`}
          >
            {notif.title}
          </h3>
        </div>

        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed admin-text-muted">
          {notif.desc}
        </p>
      </div>

      <div className="pt-0.5">
        <NotificationActionMenu notif={notif} onMarkRead={onMarkRead} onDelete={onDelete} />
      </div>
    </motion.div>
  );
};

export default NotificationCard;
