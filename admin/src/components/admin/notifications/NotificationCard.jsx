import React from 'react';
import { motion } from 'framer-motion';
import {
  MdDelete,
  MdPushPin,
  MdArchive,
  MdVisibility,
  MdMarkEmailRead,
  MdOutlinePushPin,
} from 'react-icons/md';
import { CATEGORY_META, PRIORITY_META } from './constants';

function ActionBtn({ icon: Icon, title, onClick, danger, active }) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`rounded-lg p-1.5 transition-colors focus:opacity-100 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF6B35] focus-visible:outline-offset-2 ${
        danger
          ? 'admin-text-muted hover:bg-red-500/15 hover:text-red-400'
          : active
            ? 'bg-amber-500/15 text-amber-500'
            : 'admin-text-muted hover:bg-[var(--admin-surface-hover)] hover:admin-text-primary'
      }`}
    >
      <Icon size={16} />
    </button>
  );
}

const NotificationCard = ({
  notif,
  selected,
  onSelect,
  onView,
  onPin,
  onArchive,
  onMarkRead,
  onDelete,
  selectionMode,
}) => {
  const cat = CATEGORY_META[notif.category];
  const pri = PRIORITY_META[notif.priority];
  const CatIcon = cat.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 12 }}
      whileHover={{ y: -4, boxShadow: 'var(--admin-shadow-lg)' }}
      tabIndex={0}
      role="group"
      aria-label={`Notification: ${notif.title}`}
      className={`group relative flex gap-3 rounded-2xl border p-4 transition-all duration-300 shadow-[var(--admin-shadow-card)] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF6B35] focus-visible:outline-offset-2 ${
        !notif.read
          ? 'ring-1 ring-[#8B5CF6]/25'
          : ''
      } ${selected ? 'ring-2 ring-[#8B5CF6]/50' : ''} ${notif.pinned ? 'ring-1 ring-amber-500/30' : ''}`}
      style={{
        borderColor: selected ? 'rgba(139, 92, 246, 0.5)' : 'var(--admin-border)',
        background: !notif.read
          ? 'var(--admin-surface-raised)'
          : 'var(--admin-surface)',
      }}
    >
      {selectionMode && (
        <label className="flex shrink-0 items-start pt-1">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(notif.id)}
            className="h-4 w-4 rounded border-[var(--admin-border)] bg-[var(--admin-input-bg)] text-[#8B5CF6] focus:ring-[#8B5CF6]/40"
          />
        </label>
      )}

      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md"
        style={{ background: cat.iconBg }}
      >
        <CatIcon size={20} className="text-white" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-[11px] admin-text-muted tabular-nums">{notif.time}</span>
          <span
            className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{
              background: pri.badgeBg,
              borderColor: pri.badgeBorder,
              color: pri.badgeText,
            }}
          >
            {pri.label}
          </span>
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
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-[#8B5CF6]"
              aria-hidden
            />
          )}
          <h3
            className={`truncate text-sm font-semibold ${
              notif.read ? 'admin-text-secondary' : 'admin-text-primary'
            }`}
          >
            {notif.title}
          </h3>
          {notif.pinned && (
            <span className="inline-flex items-center gap-0.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500">
              <MdOutlinePushPin size={10} /> Pinned
            </span>
          )}
        </div>

        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed admin-text-muted">
          {notif.desc}
        </p>
      </div>

      <div className="flex shrink-0 flex-col gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity sm:flex-row sm:items-start">
        <ActionBtn icon={MdVisibility} title="View" onClick={() => onView(notif)} />
        <ActionBtn
          icon={MdPushPin}
          title={notif.pinned ? 'Unpin' : 'Pin'}
          onClick={() => onPin(notif.id)}
          active={notif.pinned}
        />
        {!notif.read && (
          <ActionBtn
            icon={MdMarkEmailRead}
            title="Mark read"
            onClick={() => onMarkRead(notif.id)}
          />
        )}
        <ActionBtn icon={MdArchive} title="Archive" onClick={() => onArchive(notif.id)} />
        <ActionBtn icon={MdDelete} title="Delete" onClick={() => onDelete(notif.id)} danger />
      </div>
    </motion.div>
  );
};

export default NotificationCard;
