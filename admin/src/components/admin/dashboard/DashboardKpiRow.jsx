import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MdPeople,
  MdSchool,
  MdLibraryBooks,
  MdAttachMoney,
} from 'react-icons/md';
import { kpiMetrics } from './dashboardData';
import { useDateRange } from '../../../context/DateRangeContext';
import { scaleKpiMetrics } from '../../../utils/dashboardDateFilter';

const ICONS = {
  students: MdPeople,
  teachers: MdSchool,
  courses: MdLibraryBooks,
  revenue: MdAttachMoney,
};

const DashboardKpiRow = () => {
  const { startDate, endDate, label } = useDateRange();
  const metrics = useMemo(
    () => scaleKpiMetrics(kpiMetrics, startDate, endDate),
    [startDate, endDate]
  );

  return (
  <>
    <p className="sr-only">Metrics for {label}</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
    {metrics.map((card, index) => {
      const Icon = ICONS[card.iconKey];
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
                <Icon size={24} className="text-white" />
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
  </>
  );
};

export default DashboardKpiRow;
