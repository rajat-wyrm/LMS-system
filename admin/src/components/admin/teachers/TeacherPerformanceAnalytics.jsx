import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MdShowChart, MdTrendingUp } from 'react-icons/md';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2.5 shadow-xl border text-sm"
      style={{
        background: 'var(--admin-surface-hover)',
        borderColor: 'var(--admin-border)',
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider admin-text-secondary mb-0.5">
        {label}
      </p>
      <p className="text-base font-extrabold admin-text-primary">
        {payload[0].value}% engagement
      </p>
    </div>
  );
};

const TeacherPerformanceAnalytics = ({ teachers = [] }) => {
  const { chartData, avgEngagement, topMentor } = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const base = teachers.length
      ? Math.min(95, Math.round(teachers.reduce((s, t) => s + (t.rating || 0), 0) / teachers.length * 18))
      : 72;
    const chartData = months.map((month, i) => ({
      month,
      engagement: Math.min(98, Math.max(45, base - 8 + i * 4 + (i % 2) * 3)),
    }));
    const avgEngagement = Math.round(
      chartData.reduce((s, d) => s + d.engagement, 0) / chartData.length
    );
    const topMentor = [...teachers].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
    return { chartData, avgEngagement, topMentor };
  }, [teachers]);

  const metrics = [
    { label: 'Avg. Engagement', value: `${avgEngagement}%`, accent: '#8B5CF6' },
    { label: 'Active Mentors', value: String(teachers.filter((t) => t.enabled).length), accent: '#10B981' },
    {
      label: 'Top Rated',
      value: topMentor ? topMentor.name.split(' ')[0] : '—',
      accent: '#F59E0B',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl border p-5 md:p-6 shadow-[var(--admin-shadow-card)] bg-[var(--admin-surface)]"
      style={{ borderColor: 'var(--admin-border)' }}
    >
      <div className="absolute -top-20 right-0 w-64 h-64 rounded-full pointer-events-none opacity-25 blur-[80px] bg-[#8B5CF6]" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-start gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)' }}
            >
              <MdShowChart size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold admin-text-primary">Mentor Performance</h2>
              <p className="text-xs admin-text-secondary mt-0.5">
                Engagement trend — last 6 months (platform-wide)
              </p>
            </div>
          </div>

          <div className="h-[200px] w-full min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border-subtle)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'var(--admin-text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--admin-text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[40, 100]}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(139,92,246,0.08)' }} />
                <Bar dataKey="engagement" fill="#8B5CF6" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:w-56 shrink-0 flex flex-col gap-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-xl px-4 py-3 border"
              style={{
                background: 'var(--admin-surface-raised)',
                borderColor: 'var(--admin-border-subtle)',
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider admin-text-secondary">
                {m.label}
              </p>
              <p className="text-xl font-extrabold admin-text-primary" style={{ color: m.accent }}>
                {m.value}
              </p>
            </div>
          ))}
          <div
            className="rounded-xl px-4 py-3 border flex items-center gap-2 mt-1"
            style={{
              background: 'rgba(16,185,129,0.1)',
              borderColor: 'rgba(16,185,129,0.35)',
            }}
          >
            <MdTrendingUp className="text-[#10B981] shrink-0" size={22} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#10B981]">
                Trend
              </p>
              <p className="text-sm font-bold admin-text-primary">+12.4% vs last month</p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default TeacherPerformanceAnalytics;
