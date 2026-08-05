import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MdDashboard,
  MdAdd,
  MdPersonAdd,
  MdAssessment,
  MdTrendingUp,
  MdSchool,
  MdEmojiEvents,
} from 'react-icons/md';
import { todaySummary } from './dashboardData';
import { useDateRange } from '../../../context/DateRangeContext';
import { scaleTodaySummary } from '../../../utils/dashboardDateFilter';

const DashboardHero = () => {
  const navigate = useNavigate();
  const { startDate, endDate, label } = useDateRange();
  const summary = useMemo(
    () => scaleTodaySummary(todaySummary, startDate, endDate),
    [startDate, endDate]
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-3xl border border-[#3B82F6]/20 shadow-[0_24px_80px_rgba(59,130,246,0.12)] bg-[var(--admin-hero-bg)]"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'var(--admin-hero-overlay)' }}
      />
      <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#8B5CF6]/20 blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-[#3B82F6]/20 blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 right-[22%] w-48 h-48 rounded-full bg-[#06B6D4]/12 blur-[70px] pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8 lg:p-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div className="flex flex-col sm:flex-row gap-6 sm:items-start flex-1 min-w-0">
          <div
            className="shrink-0 w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl flex items-center justify-center shadow-[0_0_48px_rgba(59,130,246,0.4)] backdrop-blur-sm border border-white/10"
            style={{
              background: 'linear-gradient(145deg, #3B82F6 0%, #8B5CF6 55%, #06B6D4 100%)',
            }}
          >
            <MdDashboard size={36} className="text-white" />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight admin-text-primary mb-2">
              Welcome back, Admin 👋
            </h1>
            <p className="admin-text-secondary text-sm md:text-base max-w-2xl mb-6 leading-relaxed">
              Monitor platform growth, manage learners, track mentor performance, and stay
              updated with key activities across your learning ecosystem.
            </p>

            <p className="text-[10px] font-bold uppercase tracking-widest admin-text-muted mb-3">
              Summary · {label}
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'New enrollments', value: summary.newEnrollments, icon: MdPersonAdd, color: '#3B82F6' },
                { label: 'Courses published', value: summary.coursesPublished, icon: MdSchool, color: '#8B5CF6' },
                { label: 'Certificates', value: summary.certificatesIssued, icon: MdEmojiEvents, color: '#10B981' },
                { label: 'Live sessions', value: summary.liveSessions, icon: MdTrendingUp, color: '#06B6D4' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl px-4 py-3 border min-w-[130px] flex items-center gap-3"
                    style={{
                      background: 'var(--admin-hero-stat-bg)',
                      borderColor: `${stat.color}40`,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: stat.color }}
                    >
                      <Icon size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider admin-text-secondary">
                        {stat.label}
                      </p>
                      <p className="text-xl font-extrabold admin-text-primary">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row xl:flex-col gap-3 shrink-0">
          <motion.button
            type="button"
            whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(139,92,246,0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard/admin/courses')}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white border border-white/10"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
            }}
          >
            <MdAdd size={22} />
            Add Course
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(59,130,246,0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard/admin/students')}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white border border-white/10"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
            }}
          >
            <MdPersonAdd size={22} />
            Add Student
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard/admin/analytics')}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold admin-text-primary border border-[var(--admin-border)] bg-[var(--admin-surface-raised)] hover:border-[#F59E0B]/50 transition-all"
          >
            <MdAssessment size={22} className="text-[#F59E0B]" />
            Generate Report
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
};

export default DashboardHero;
