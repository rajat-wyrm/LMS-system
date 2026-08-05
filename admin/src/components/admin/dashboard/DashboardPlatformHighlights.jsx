import React from 'react';
import { motion } from 'framer-motion';
import {
  MdLibraryBooks,
  MdStar,
  MdEmojiEvents,
  MdWorkspacePremium,
} from 'react-icons/md';
import { platformHighlights } from './dashboardData';

const ICONS = {
  course: MdLibraryBooks,
  teacher: MdStar,
  student: MdEmojiEvents,
  certificate: MdWorkspacePremium,
};

const DashboardPlatformHighlights = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
    {platformHighlights.map((item, index) => {
      const Icon = ICONS[item.iconKey];
      return (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ y: -4, boxShadow: `0 12px 28px ${item.accent}33` }}
          className="rounded-xl px-3 py-3 border transition-all duration-300 bg-[var(--admin-surface-raised)] shadow-[var(--admin-shadow-card)] flex items-center gap-3"
          style={{ borderColor: `${item.accent}35` }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-md"
            style={{ background: item.accent }}
          >
            <Icon size={20} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-semibold uppercase tracking-wider admin-text-secondary leading-none mb-1">
              {item.label}
            </p>
            <p className="text-xs font-bold admin-text-primary truncate" title={item.value}>
              {item.value}
            </p>
            <p className="text-[10px] admin-text-muted truncate">{item.sub}</p>
          </div>
        </motion.div>
      );
    })}
  </div>
);

export default DashboardPlatformHighlights;
