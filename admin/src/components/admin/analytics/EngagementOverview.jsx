import React from 'react';
import { motion } from 'framer-motion';
import {
  MdTimer,
  MdPlayLesson,
  MdQuiz,
  MdReplay,
  MdInsights,
} from 'react-icons/md';
import { engagementOverviewMetrics } from './analyticsData';

const ICON_MAP = {
  session: MdTimer,
  lessons: MdPlayLesson,
  quiz: MdQuiz,
  return: MdReplay,
};

const EngagementOverview = () => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4, duration: 0.35 }}
    className="rounded-2xl border p-5 md:p-6 shadow-[var(--admin-shadow-card)] bg-[var(--admin-surface)]"
    style={{ borderColor: 'var(--admin-border)' }}
  >
    <div className="flex items-start gap-3 mb-5">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shrink-0"
        style={{ background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)' }}
      >
        <MdInsights size={20} className="text-white" />
      </div>
      <div>
        <h3 className="text-base font-bold admin-text-primary">Engagement Overview</h3>
        <p className="text-[11px] admin-text-secondary mt-0.5">
          Key behavioral metrics for the selected period
        </p>
      </div>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {engagementOverviewMetrics.map((metric, index) => {
        const Icon = ICON_MAP[metric.icon] || MdInsights;
        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 + index * 0.05 }}
            whileHover={{ y: -4, boxShadow: `0 12px 32px ${metric.color}33` }}
            className="rounded-xl border p-4 transition-all duration-300"
            style={{
              borderColor: `${metric.color}44`,
              background: 'var(--admin-surface-raised)',
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 shadow-md"
              style={{ background: metric.color }}
            >
              <Icon size={18} className="text-white" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider admin-text-secondary mb-1">
              {metric.label}
            </p>
            <p className="text-2xl font-extrabold admin-text-primary">{metric.value}</p>
            <p className="text-xs font-semibold mt-1" style={{ color: '#10B981' }}>
              ↑ {metric.trend}
            </p>
          </motion.div>
        );
      })}
    </div>
  </motion.section>
);

export default EngagementOverview;
