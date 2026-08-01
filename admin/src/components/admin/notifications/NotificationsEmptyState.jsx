import React from 'react';
import { motion } from 'framer-motion';
import { MdNotificationsNone } from 'react-icons/md';

const NotificationsEmptyState = ({ hasNotifications }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 px-6 text-center"
    style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-surface)' }}
  >
    <div
      className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
      style={{ background: 'var(--admin-stat-pill-bg)' }}
    >
      <MdNotificationsNone size={32} className="text-[#14B8A6]" />
    </div>
    <p className="text-sm font-semibold admin-text-primary mb-1">
      {hasNotifications ? 'No matching notifications' : "You're all caught up!"}
    </p>
    <p className="text-xs admin-text-muted max-w-xs">
      {hasNotifications
        ? 'Try a different search term or filter to find what you’re looking for.'
        : 'No notifications right now. New course, student, teacher, and system updates will show up here.'}
    </p>
  </motion.div>
);

export default NotificationsEmptyState;
