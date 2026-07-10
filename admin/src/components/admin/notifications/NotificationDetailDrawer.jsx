import React from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdMarkEmailRead } from 'react-icons/md';
import { CATEGORY_META, PRIORITY_META } from './constants';
import { useAutoFocusPanel } from '../../../hooks/useFocusTrap';

const NotificationDetailDrawer = ({
  notif,
  onClose,
  onMarkRead,
  onPin,
  onArchive,
}) => {
  const panelRef = useAutoFocusPanel(Boolean(notif), onClose);
  if (!notif) return null;
  const cat = CATEGORY_META[notif.category];
  const pri = PRIORITY_META[notif.priority];
  const CatIcon = cat.icon;

  return (
    <motion.aside
      ref={panelRef}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      role="complementary"
      aria-label={`Notification details: ${notif.title}`}
      tabIndex={-1}
      className="flex w-full flex-col rounded-2xl border p-5 shadow-[var(--admin-shadow-card)] lg:min-w-[320px] lg:max-w-[360px]"
      style={{
        borderColor: 'var(--admin-border)',
        background: 'var(--admin-surface-raised)',
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider admin-text-muted">
          Details
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 admin-text-muted hover:bg-[var(--admin-surface-hover)]"
        >
          <MdClose size={18} />
        </button>
      </div>

      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl shadow-md"
        style={{ background: cat.iconBg }}
      >
        <CatIcon size={22} className="text-white" />
      </div>

      <h2 className="text-lg font-bold admin-text-primary">{notif.title}</h2>
      <p className="mt-2 text-sm leading-relaxed admin-text-secondary">{notif.desc}</p>

      <dl
        className="mt-6 space-y-3 border-t pt-4 text-sm"
        style={{ borderColor: 'var(--admin-border-subtle)' }}
      >
        <div className="flex justify-between gap-4">
          <dt className="admin-text-muted">Priority</dt>
          <dd>
            <span
              className="rounded-md border px-2 py-0.5 text-xs font-semibold"
              style={{
                background: pri.badgeBg,
                borderColor: pri.badgeBorder,
                color: pri.badgeText,
              }}
            >
              {pri.label}
            </span>
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="admin-text-muted">Category</dt>
          <dd className="admin-text-primary">{cat.label}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="admin-text-muted">Received</dt>
          <dd className="admin-text-secondary">{notif.time}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="admin-text-muted">Response SLA</dt>
          <dd className="admin-text-secondary">{notif.responseMinutes} min avg</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="admin-text-muted">Status</dt>
          <dd className={notif.read ? 'admin-text-muted' : 'text-[#8B5CF6]'}>
            {notif.read ? 'Read' : 'Unread'}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-2 pt-2">
        {!notif.read && (
          <button
            type="button"
            onClick={() => onMarkRead(notif.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white"
            style={{
              background: 'linear-gradient(135deg, #F97316, #8B5CF6)',
            }}
          >
            <MdMarkEmailRead size={14} /> Mark read
          </button>
        )}
        <button
          type="button"
          onClick={() => onPin(notif.id)}
          className="rounded-xl border px-3 py-2 text-xs font-medium admin-text-secondary hover:bg-[var(--admin-surface-hover)]"
          style={{ borderColor: 'var(--admin-border)' }}
        >
          {notif.pinned ? 'Unpin' : 'Pin'}
        </button>
        <button
          type="button"
          onClick={() => onArchive(notif.id)}
          className="rounded-xl border px-3 py-2 text-xs font-medium admin-text-secondary hover:bg-[var(--admin-surface-hover)]"
          style={{ borderColor: 'var(--admin-border)' }}
        >
          Archive
        </button>
      </div>
    </motion.aside>
  );
};

export default NotificationDetailDrawer;
