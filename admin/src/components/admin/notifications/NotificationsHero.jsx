import React from 'react';
import { motion } from 'framer-motion';
import { MdNotifications, MdDoneAll } from 'react-icons/md';

const NotificationsHero = ({ unreadCount, onMarkAllRead }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-3xl border border-[#14B8A6]/25 shadow-[0_24px_80px_rgba(20,184,166,0.14)]"
      style={{ background: 'var(--admin-hero-bg)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, rgba(20,184,166,0.32) 0%, rgba(6,182,212,0.24) 50%, rgba(139,92,246,0.18) 100%)',
        }}
      />
      <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#14B8A6]/20 blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-[#8B5CF6]/20 blur-[80px] pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex flex-col sm:flex-row gap-6 sm:items-center flex-1 min-w-0">
          <div
            className="shrink-0 w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-md shadow-[0_0_48px_rgba(20,184,166,0.45)]"
            style={{
              background: 'linear-gradient(145deg, #14B8A6 0%, #06B6D4 48%, #8B5CF6 100%)',
            }}
          >
            <MdNotifications size={36} className="text-white" />
          </div>

          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight admin-text-primary mb-2">
              Notification Center
            </h1>
            <p className="admin-text-secondary text-sm md:text-base max-w-xl">
              Stay on top of course, student, teacher, and system activity across the platform.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div
            className="rounded-2xl px-5 py-3 border border-[#14B8A6]/35 min-w-[140px] backdrop-blur-sm"
            style={{ background: 'var(--admin-hero-stat-bg)' }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider admin-text-secondary mb-1">
              Unread
            </p>
            <p className="text-2xl font-extrabold text-[#14B8A6] tabular-nums">{unreadCount}</p>
          </div>

          <motion.button
            type="button"
            whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(20,184,166,0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 55%, #8B5CF6 100%)',
            }}
          >
            <MdDoneAll size={20} />
            Mark All Read
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
};

export default NotificationsHero;
