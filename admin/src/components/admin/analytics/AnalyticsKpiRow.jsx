import React from 'react';
import { motion } from 'framer-motion';
import {
  MdAttachMoney,
  MdPeople,
  MdOfflineBolt,
  MdShowChart,
} from 'react-icons/md';

const CARD_META = [
  {
    title: 'Revenue',
    key: 'revenue',
    icon: MdAttachMoney,
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.5) 0%, rgba(239,68,68,0.12) 100%)',
    iconBg: '#F59E0B',
    glow: 'rgba(245,158,11,0.35)',
    border: 'rgba(245,158,11,0.45)',
  },
  {
    title: 'Students',
    key: 'students',
    icon: MdPeople,
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.5) 0%, rgba(6,182,212,0.15) 100%)',
    iconBg: '#3B82F6',
    glow: 'rgba(59,130,246,0.35)',
    border: 'rgba(59,130,246,0.4)',
  },
  {
    title: 'Active Users',
    key: 'activeUsers',
    icon: MdOfflineBolt,
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.45) 0%, rgba(6,182,212,0.15) 100%)',
    iconBg: '#10B981',
    glow: 'rgba(16,185,129,0.35)',
    border: 'rgba(16,185,129,0.4)',
  },
  {
    title: 'Completion Rate',
    key: 'completionRate',
    icon: MdShowChart,
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.45) 0%, rgba(59,130,246,0.12) 100%)',
    iconBg: '#8B5CF6',
    glow: 'rgba(139,92,246,0.35)',
    border: 'rgba(139,92,246,0.4)',
  },
];

/**
 * AnalyticsKpiRow
 * @param {object|null} kpiData - Shape: { revenue, students, activeUsers, completionRate }
 *   Each field: { value: string, raw?: number, trend?: string }
 * @param {boolean} loading - Whether data is still being fetched
 */
const AnalyticsKpiRow = ({ kpiData = null, loading = false }) => {
  if (loading || !kpiData) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {CARD_META.map((card) => (
          <div
            key={card.title}
            className="relative overflow-hidden rounded-2xl border p-5 animate-pulse shadow-[var(--admin-shadow-card)]"
            style={{
              borderColor: card.border,
              backgroundColor: 'var(--admin-kpi-base)',
              backgroundImage: card.gradient,
            }}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl" style={{ background: 'var(--admin-surface)' }} />
                <div className="w-14 h-5 rounded-lg" style={{ background: 'var(--admin-surface)' }} />
              </div>
              <div>
                <div className="w-20 h-3 rounded mb-2" style={{ background: 'var(--admin-surface)' }} />
                <div className="w-28 h-8 rounded" style={{ background: 'var(--admin-surface)' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {CARD_META.map((card, index) => {
        const Icon = card.icon;
        const kpiEntry = kpiData[card.key] ?? {};
        const value = kpiEntry.value ?? '—';
        const trend = kpiEntry.trend ?? null;

        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
            whileHover={{
              y: -8,
              boxShadow: `0 20px 50px ${card.glow}`,
            }}
            className="relative overflow-hidden rounded-2xl border p-5 cursor-default transition-all duration-300 shadow-[var(--admin-shadow-card)]"
            style={{
              borderColor: card.border,
              backgroundColor: 'var(--admin-kpi-base)',
              backgroundImage: card.gradient,
            }}
          >
            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-20 pointer-events-none bg-white" />

            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: card.iconBg }}
                >
                  <Icon size={22} className="text-white" />
                </div>
                {trend && (
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-lg text-[#10B981]"
                    style={{ background: 'var(--admin-stat-pill-bg)' }}
                  >
                    ↑ {trend}
                  </span>
                )}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider admin-text-secondary mb-1">
                  {card.title}
                </p>
                <h3 className="text-3xl font-extrabold admin-text-primary tracking-tight">
                  {value}
                </h3>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AnalyticsKpiRow;
