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
      className="glass-card p-5 rounded-2xl flex items-center space-x-4 border border-border bg-card/70"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {icon && <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xl">{icon}</div>}
      <div className="flex flex-col">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
        <span className="text-xl font-bold font-display text-foreground">{value}</span>
      </div>
    </motion.div>
  );
};

export default StatsCard;
