import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MdPeople,
  MdCheckCircle,
  MdShowChart,
  MdEmojiEvents,
} from 'react-icons/md';

const StudentAnalyticsCards = ({ students = [] }) => {
  const metrics = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.status === 'Active').length;
    const avgProgress =
      total > 0
        ? students.reduce((sum, s) => sum + (s.progress ?? 0), 0) / total
        : 0;
    const certificates = students.reduce(
      (sum, s) => sum + (s.certificates ?? Math.floor((s.progress ?? 0) / 25)),
      0
    );
    return {
      total: total.toLocaleString(),
      active: active.toLocaleString(),
      completionRate: `${Math.round(avgProgress)}%`,
      certificates: certificates.toLocaleString(),
    };
  }, [students]);

  const cards = [
    {
      title: 'Total Students',
      value: metrics.total,
      trend: '+8.2%',
      trendUp: true,
      icon: MdPeople,
      gradient: 'linear-gradient(135deg, rgba(59,130,246,0.45) 0%, rgba(6,182,212,0.2) 100%)',
      iconBg: '#3B82F6',
      glow: 'rgba(59,130,246,0.35)',
      border: 'rgba(59,130,246,0.4)',
    },
    {
      title: 'Active Students',
      value: metrics.active,
      trend: '+5.4%',
      trendUp: true,
      icon: MdCheckCircle,
      gradient: 'linear-gradient(135deg, rgba(16,185,129,0.4) 0%, rgba(6,182,212,0.15) 100%)',
      iconBg: '#10B981',
      glow: 'rgba(16,185,129,0.35)',
      border: 'rgba(16,185,129,0.4)',
    },
    {
      title: 'Completion Rate',
      value: metrics.completionRate,
      trend: '+3.1%',
      trendUp: true,
      icon: MdShowChart,
      gradient: 'linear-gradient(135deg, rgba(139,92,246,0.45) 0%, rgba(59,130,246,0.15) 100%)',
      iconBg: '#8B5CF6',
      glow: 'rgba(139,92,246,0.35)',
      border: 'rgba(139,92,246,0.4)',
    },
    {
      title: 'Certificates Earned',
      value: metrics.certificates,
      trend: '+11.8%',
      trendUp: true,
      icon: MdEmojiEvents,
      gradient: 'linear-gradient(135deg, rgba(245,158,11,0.4) 0%, rgba(239,68,68,0.12) 100%)',
      iconBg: '#F59E0B',
      glow: 'rgba(245,158,11,0.35)',
      border: 'rgba(245,158,11,0.4)',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map((card, index) => {
        const Icon = card.icon;
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
                  className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
                  style={{ background: card.iconBg }}
                >
                  <Icon size={20} className="text-white" />
                </div>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-lg ${
                    card.trendUp ? 'text-[#10B981]' : 'text-red-400'
                  }`}
                  style={{ background: 'var(--admin-stat-pill-bg)' }}
                >
                  {card.trend}
                </span>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider admin-text-secondary mb-1">
                  {card.title}
                </p>
                <h3 className="text-3xl font-extrabold admin-text-primary tracking-tight">
                  {card.value}
                </h3>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StudentAnalyticsCards;
