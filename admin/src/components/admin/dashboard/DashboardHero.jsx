import React, { useState, useEffect, useCallback } from 'react';
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
  MdOutlinePendingActions
} from 'react-icons/md';
import { useDateRange } from '../../../context/DateRangeContext';
import { apiFetch } from '../../../api/config';

const DashboardHero = () => {
  const navigate = useNavigate();
  const { startDate, endDate, label } = useDateRange();
  const [stats, setStats] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const query = startDate && endDate
        ? `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        : '';
      const data = await apiFetch(`/admin/stats${query}`);
      setStats(data.data);
    } catch (err) {
      console.error('Hero stats fetch failed:', err);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-3xl border border-border bg-card/70 backdrop-blur-xl shadow-lg p-6 md:p-8 lg:p-10 font-body"
    >
      <div className="aurora-bg" />
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div className="flex flex-col sm:flex-row gap-6 sm:items-start flex-1 min-w-0">
          <div className="shrink-0 w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-primary via-secondary to-accent text-white">
            <MdDashboard size={36} />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-foreground tracking-tight mb-2">
              Welcome back, Admin 👋
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mb-6 leading-relaxed">
              Monitor platform growth, manage learners, track mentor performance, and stay
              updated with key activities across your learning ecosystem.
            </p>

            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 font-display">
              Summary · {label}
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'New Students', value: stats?.studentsCount || 0, icon: MdPersonAdd, color: 'hsl(var(--accent))' },
                { label: 'Courses added', value: stats?.coursesCount || 0, icon: MdSchool, color: 'hsl(var(--secondary))' },
                { label: 'Active Enrolls', value: stats?.activeEnrollments || 0, icon: MdTrendingUp, color: 'hsl(var(--teal))' },
                { label: 'Pending Users', value: stats?.pendingUsers || 0, icon: MdOutlinePendingActions, color: 'hsl(var(--primary))' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl px-4 py-3 border border-border bg-muted/40 min-w-[130px] flex items-center gap-3"
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white"
                      style={{ background: stat.color }}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-xl font-bold font-display text-foreground">{stat.value}</p>
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
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard/admin/courses')}
            className="btn-primary text-sm font-semibold !py-3 !px-5"
          >
            <MdAdd size={20} />
            Add Course
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard/admin/students')}
            className="btn-outline-teal text-sm font-semibold !py-3 !px-5"
          >
            <MdPersonAdd size={20} />
            Add Student
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard/admin/analytics')}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-foreground border border-border bg-muted/50 hover:bg-muted transition-all text-sm"
          >
            <MdAssessment size={20} className="text-orange-400" />
            Generate Report
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
};

export default DashboardHero;
