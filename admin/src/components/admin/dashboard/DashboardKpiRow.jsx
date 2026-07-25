import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MdPeople, MdSchool, MdLibraryBooks, MdAttachMoney,
  MdTrendingUp, MdTrendingDown,
} from 'react-icons/md';
import { useDateRange } from '../../../context/DateRangeContext';
import { apiFetch } from '../../../api/config';

const CARD_DEFS = [
  { key: 'studentsCount', label: 'Total Students', trendKey: 'studentsTrend', trendUpKey: 'studentsTrendUp', icon: MdPeople, accent: '#3B82F6', glow: 'rgba(59,130,246,0.25)', border: 'rgba(59,130,246,0.3)', gradient: 'from-blue-600/20 to-blue-500/5' },
  { key: 'teachersCount', label: 'Active Teachers', trendKey: 'teachersTrend', trendUpKey: 'teachersTrendUp', icon: MdSchool, accent: '#8B5CF6', glow: 'rgba(139,92,246,0.25)', border: 'rgba(139,92,246,0.3)', gradient: 'from-violet-600/20 to-violet-500/5' },
  { key: 'coursesCount', label: 'Total Courses', trendKey: 'coursesTrend', trendUpKey: 'coursesTrendUp', icon: MdLibraryBooks, accent: '#10B981', glow: 'rgba(16,185,129,0.25)', border: 'rgba(16,185,129,0.3)', gradient: 'from-emerald-600/20 to-emerald-500/5' },
  { key: 'revenueCount', label: 'Period Revenue', trendKey: 'revenueTrend', trendUpKey: 'revenueTrendUp', icon: MdAttachMoney, accent: '#F59E0B', glow: 'rgba(245,158,11,0.25)', border: 'rgba(245,158,11,0.3)', gradient: 'from-amber-600/20 to-amber-500/5', isRevenue: true },
];

function formatValue(key, val) {
  if (key === 'revenueCount') {
    if (val >= 100000) return `\u20b9${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `\u20b9${(val / 1000).toFixed(1)}K`;
    return `\u20b9${val}`;
  }
  return val?.toLocaleString() ?? '0';
}

const KpiCard = ({ def, stats, loading, delay }) => {
  const { key, label, trendKey, trendUpKey, icon: Icon, accent, glow, border, gradient } = def;
  const value = stats?.[key];
  const trend = stats?.[trendKey];
  const trendUp = stats?.[trendUpKey] ?? true;
  const TrendIcon = trendUp ? MdTrendingUp : MdTrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -6, boxShadow: `0 12px 32px ${glow}` }}
      className={`relative overflow-hidden rounded-2xl border p-4 md:p-5 shadow-[var(--admin-shadow-card)] bg-gradient-to-br ${gradient} transition-all duration-300 cursor-default`}
      style={{ borderColor: border, background: 'var(--admin-surface)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{ background: accent }}>
          <Icon size={20} className="text-white" />
        </div>
        {trend && (
          <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-lg ${trendUp ? 'text-[#10B981]' : 'text-red-400'}`}
            style={{ background: 'var(--admin-stat-pill-bg)' }}>
            <TrendIcon size={12} />{trend}
          </span>
        )}
      </div>
      {loading ? (
        <div className="h-7 w-24 rounded-lg animate-pulse" style={{ background: 'var(--admin-border)' }} />
      ) : (
        <p className="text-2xl font-extrabold admin-text-primary tabular-nums">{formatValue(key, value)}</p>
      )}
      <p className="text-xs font-semibold admin-text-secondary mt-1">{label}</p>
    </motion.div>
  );
};

const DashboardKpiRow = () => {
  const { startDate, endDate } = useDateRange();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const query = startDate && endDate
        ? `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        : '';
      const data = await apiFetch(`/admin/stats${query}`);
      setStats(data.data);
    } catch (err) {
      console.error('KPI fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {CARD_DEFS.map((def, i) => (
        <KpiCard key={def.key} def={def} stats={stats} loading={loading} delay={i * 0.07} />
      ))}
    </div>
  );
};

export default DashboardKpiRow;
