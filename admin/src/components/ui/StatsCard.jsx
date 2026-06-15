import React from 'react';
import { motion } from 'framer-motion';

/**
 * StatsCard – compact KPI card used on the dashboard.
 * Props:
 *   title: string – label of the stat
 *   value: string | number – displayed value
 *   icon?: ReactNode – optional icon element
 */
const StatsCard = ({ title, value, icon }) => {
  return (
    <motion.div
      className="glass-card gradient-border p-4 rounded-3xl flex items-center space-x-3"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {icon && <div className="text-[#FFB800] text-xl">{icon}</div>}
      <div className="flex flex-col">
        <span className="text-sm admin-text-muted">{title}</span>
        <span className="text-lg font-semibold admin-text-primary">{value}</span>
      </div>
    </motion.div>
  );
};

export default StatsCard;
