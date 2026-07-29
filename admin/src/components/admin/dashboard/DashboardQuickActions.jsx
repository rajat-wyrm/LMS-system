import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MdPersonAdd,
  MdAddCircle,
  MdSchool,
  MdEmojiEvents,
  MdBarChart,
  MdNotifications,
} from 'react-icons/md';

const ACTIONS = [
  {
    label: 'Create Course',
    path: '/dashboard/admin/courses',
    icon: MdAddCircle,
    bg: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
    glow: 'rgba(139,92,246,0.35)',
  },
  {
    label: 'Add Teacher',
    path: '/dashboard/admin/teachers',
    icon: MdSchool,
    bg: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
    glow: 'rgba(16,185,129,0.35)',
  },
  {
    label: 'Generate Certificate',
    path: '/dashboard/admin/courses',
    icon: MdEmojiEvents,
    bg: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    glow: 'rgba(245,158,11,0.35)',
  },
  {
    label: 'Send Notification',
    path: '/dashboard/admin/notifications',
    icon: MdNotifications,
    bg: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
    glow: 'rgba(139,92,246,0.35)',
  },
  {
    label: 'View Analytics',
    path: '/dashboard/admin/analytics',
    icon: MdBarChart,
    bg: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
    glow: 'rgba(6,182,212,0.35)',
  },
];

const DashboardQuickActions = () => {
  const navigate = useNavigate();

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border p-4 md:p-5 shadow-[var(--admin-shadow-card)] bg-[var(--admin-surface)]"
      style={{ borderColor: 'var(--admin-border)' }}
    >
      <h2 className="text-base font-bold admin-text-primary mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {ACTIONS.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              type="button"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12 + index * 0.03 }}
              whileHover={{
                scale: 1.03,
                y: -4,
                boxShadow: `0 14px 32px ${action.glow}`,
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl text-white font-semibold text-[11px] sm:text-xs min-h-[88px] border border-white/10 transition-all"
              style={{ background: action.bg }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-md" style={{ background: 'rgba(255,255,255,0.22)' }}>
                <Icon size={22} className="text-white" />
              </div>
              <span className="text-center leading-tight">{action.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
};

export default DashboardQuickActions;
