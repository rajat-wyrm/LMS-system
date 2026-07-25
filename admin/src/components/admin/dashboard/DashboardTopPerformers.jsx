import { useCallback, useEffect, useState } from 'react';
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
import { apiFetch } from '../../../api/config';

const ICONS = {
  course: MdLibraryBooks,
  teacher: MdSchool,
  student: MdEmojiEvents,
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

const FALLBACK_ITEMS = [
  {
    label: 'Top Course',
    name: 'No data yet',
    iconKey: 'course',
    accent: '#3B82F6',
    glow: 'rgba(59,130,246,0.35)',
    trend: '0%',
    trendUp: true,
    enrollmentsDisplay: '0',
    progress: 0,
  },
];

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

const DashboardTopPerformers = () => {
  const [items, setItems] = useState(FALLBACK_ITEMS);

  const fetchPerformers = useCallback(async () => {
    try {
      const { data } = await apiFetch('/admin/dashboard/top-performers');
      const nextItems = [];

      if (data?.topCourse) {
        nextItems.push({
          label: 'Top Course',
          name: data.topCourse.name,
          iconKey: 'course',
          accent: '#3B82F6',
          glow: 'rgba(59,130,246,0.35)',
          trend: `${data.topCourse.rating ?? 0}★`,
          trendUp: true,
          enrollmentsDisplay: data.topCourse.enrollments.toLocaleString(),
          progress: Math.min(data.topCourse.enrollments, 100),
        });
      }

      if (data?.topInstructor) {
        nextItems.push({
          label: 'Top Teacher',
          name: data.topInstructor.name,
          iconKey: 'teacher',
          accent: '#10B981',
          glow: 'rgba(16,185,129,0.35)',
          trend: `${data.topInstructor.rating ?? 0}★`,
          trendUp: true,
          learnersDisplay: data.topInstructor.students >= 1000
            ? `${(data.topInstructor.students / 1000).toFixed(1)}k`
            : data.topInstructor.students.toString(),
          rating: data.topInstructor.rating ?? 0,
        });
      }

      if (data?.topStudent) {
        nextItems.push({
          label: 'Top Student',
          name: data.topStudent.name,
          iconKey: 'student',
          accent: '#8B5CF6',
          glow: 'rgba(139,92,246,0.35)',
          trend: `${data.topStudent.progress}%`,
          trendUp: true,
          completion: data.topStudent.progress,
          streak: 1,
        });
      }

      setItems(nextItems.length > 0 ? nextItems : FALLBACK_ITEMS);
    } catch (error) {
      console.error('Top performers fetch failed:', error);
    }
  }, []);

  useEffect(() => {
    fetchPerformers();
  }, [fetchPerformers]);

  return (
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
        {items.map((item, index) => {
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
                <span className="text-[10px] font-semibold admin-text-secondary">
                  Live platform data
                </span>
                <span className="text-[9px] font-medium admin-text-muted">Updated now</span>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
};

export default DashboardTopPerformers;
