import React from 'react';
import { motion } from 'framer-motion';
import {
  MdLibraryBooks,
  MdSchool,
  MdEmojiEvents,
  MdTrendingUp,
  MdTrendingDown,
  MdStar,
  MdLocalFireDepartment,
} from 'react-icons/md';
import { topPerformersSpotlight } from './dashboardData';

const ICONS = {
  course: MdLibraryBooks,
  teacher: MdSchool,
  student: MdEmojiEvents,
};

const SPARK_W = 72;
const SPARK_H = 22;

const MiniSparkline = ({ points, color, trendUp }) => {
  if (!points?.length) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = SPARK_W / (points.length - 1);
  const coords = points.map((v, i) => {
    const x = i * step;
    const y = SPARK_H - ((v - min) / range) * (SPARK_H - 4) - 2;
    return `${x},${y}`;
  });
  const line = coords.join(' ');
  const area = `M0,${SPARK_H} L${coords.map((c) => c.replace(',', ' ')).join(' L')} L${SPARK_W},${SPARK_H} Z`;

  return (
    <svg
      width={SPARK_W}
      height={SPARK_H}
      viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
      className="shrink-0"
      aria-hidden
    >
      <defs>
        <linearGradient id={`spark-fill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={trendUp ? 0.35 : 0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-fill-${color.replace('#', '')})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const TrendBadge = ({ trend, trendUp }) => {
  const TrendIcon = trendUp ? MdTrendingUp : MdTrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
        trendUp ? 'text-[#10B981]' : 'text-red-400'
      }`}
      style={{ background: 'var(--admin-stat-pill-bg)' }}
    >
      <TrendIcon size={11} />
      {trend}
    </span>
  );
};

const ProgressBar = ({ value, accent }) => (
  <div className="w-full">
    <div
      className="h-1.5 rounded-full overflow-hidden"
      style={{ background: 'var(--admin-progress-track)' }}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${value}%`,
          background: `linear-gradient(90deg, ${accent} 0%, ${accent}cc 100%)`,
          boxShadow: `0 0 8px ${accent}55`,
        }}
      />
    </div>
  </div>
);

const PerformerMetrics = ({ item }) => {
  if (item.iconKey === 'course') {
    return (
      <>
        <p className="text-[11px] admin-text-muted leading-tight">
          <span className="font-semibold admin-text-secondary">{item.enrollmentsDisplay}</span>
          {' '}
          enrollments
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <ProgressBar value={item.progress} accent={item.accent} />
          <span className="text-[10px] font-bold shrink-0 admin-text-secondary">{item.progress}%</span>
        </div>
      </>
    );
  }

  if (item.iconKey === 'teacher') {
    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] admin-text-muted">
        <span>
          <span className="font-semibold admin-text-secondary">{item.learnersDisplay}</span>
          {' '}
          learners
        </span>
        <span className="text-[var(--admin-border)]">·</span>
        <span className="inline-flex items-center gap-0.5 font-semibold text-[#F59E0B]">
          <MdStar size={12} className="shrink-0" />
          {item.rating}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] admin-text-muted">
      <span>
        <span className="font-semibold admin-text-secondary">{item.completion}%</span>
        {' '}
        completion
      </span>
      <span className="text-[var(--admin-border)]">·</span>
      <span className="inline-flex items-center gap-0.5 font-semibold text-orange-400">
        <MdLocalFireDepartment size={12} className="shrink-0" />
        {item.streak}-day streak
      </span>
    </div>
  );
};

const DashboardTopPerformers = () => (
  <section
    className="rounded-2xl border p-3 md:p-4 shadow-[var(--admin-shadow-card)] bg-[var(--admin-surface)]"
    style={{ borderColor: 'var(--admin-border)' }}
  >
    <div className="flex items-center justify-between mb-2.5">
      <h2 className="text-base font-bold admin-text-primary">Top Performers</h2>
      <span className="text-[10px] font-semibold uppercase tracking-wider admin-text-muted">
        Leaderboard
      </span>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
      {topPerformersSpotlight.map((item, index) => {
        const Icon = ICONS[item.iconKey];
        return (
          <motion.article
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{
              y: -6,
              boxShadow: `0 12px 32px ${item.glow}`,
            }}
            className="relative overflow-hidden rounded-xl border p-2.5 transition-all duration-300 cursor-default"
            style={{
              borderColor: `${item.accent}40`,
              background: 'var(--admin-surface-raised)',
              backgroundImage: item.gradient,
            }}
          >
            <div className="flex items-start justify-between gap-1 mb-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="text-[9px] font-extrabold text-white px-1.5 py-0.5 rounded shrink-0"
                  style={{ background: item.accent }}
                >
                  #1
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wide admin-text-secondary truncate">
                  {item.label}
                </span>
              </div>
              <TrendBadge trend={item.trend} trendUp={item.trendUp} />
            </div>

            <div className="flex items-start gap-2 mb-1.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-md"
                style={{ background: item.accent }}
              >
                <Icon size={16} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-sm font-bold admin-text-primary truncate leading-snug"
                  title={item.name}
                >
                  {item.name}
                </p>
                <PerformerMetrics item={item} />
              </div>
            </div>

            <div
              className="flex items-center justify-between pt-1.5 border-t"
              style={{ borderColor: 'var(--admin-border-subtle)' }}
            >
              <MiniSparkline
                points={item.sparkline}
                color={item.accent}
                trendUp={item.trendUp}
              />
              <span className="text-[9px] font-medium admin-text-muted">30d trend</span>
            </div>
          </motion.article>
        );
      })}
    </div>
  </section>
);

export default DashboardTopPerformers;
