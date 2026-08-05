import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MdEmojiEvents, MdStar, MdGroups, MdAttachMoney } from 'react-icons/md';
import { computeRevenue, formatRevenue, formatStudents } from '../../../utils/courseUtils';

const RANK_STYLES = [
  { ring: 'ring-[#F59E0B]/60', glow: 'rgba(245,158,11,0.35)', label: '#1' },
  { ring: 'ring-[#CBD5E1]/50', glow: 'rgba(203,213,225,0.25)', label: '#2' },
  { ring: 'ring-[#CD7F32]/50', glow: 'rgba(205,127,50,0.3)', label: '#3' },
  { ring: 'ring-[#8B5CF6]/40', glow: 'rgba(139,92,246,0.2)', label: '#4' },
  { ring: 'ring-[#06B6D4]/40', glow: 'rgba(6,182,212,0.2)', label: '#5' },
];

const TopPerformingCourses = ({ courses, onEdit }) => {
  const topCourses = useMemo(
    () =>
      [...courses]
        .sort((a, b) => computeRevenue(b) - computeRevenue(a))
        .slice(0, 5),
    [courses]
  );

  if (topCourses.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="relative overflow-hidden rounded-3xl border p-6 md:p-8 shadow-[var(--admin-shadow-card)]"
      style={{
        borderColor: 'rgba(6, 182, 212, 0.35)',
        background:
          'linear-gradient(135deg, var(--admin-surface) 0%, rgba(6,182,212,0.1) 50%, rgba(59,130,246,0.08) 100%)',
      }}
    >
      <div className="absolute -top-16 right-8 w-56 h-56 rounded-full bg-[#06B6D4]/15 blur-[70px] pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-[0_0_24px_rgba(245,158,11,0.4)]"
            style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)' }}
          >
            <MdEmojiEvents size={26} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold admin-text-primary">Top Performing Courses</h2>
            <p className="text-xs admin-text-secondary">
              Ranked by revenue and enrollment impact
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {topCourses.map((course, index) => {
          const style = RANK_STYLES[index] || RANK_STYLES[4];
          return (
            <motion.button
              key={course.id}
              type="button"
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onEdit?.(course)}
              className={`text-left rounded-2xl p-4 border transition-all cursor-pointer ring-2 ${style.ring} bg-[var(--admin-surface-raised)]`}
              style={{
                boxShadow: `0 12px 32px ${style.glow}`,
                borderColor: 'var(--admin-border)',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className="text-xs font-extrabold px-2 py-0.5 rounded-lg"
                  style={{
                    background: 'rgba(6,182,212,0.2)',
                    color: '#22D3EE',
                  }}
                >
                  {style.label}
                </span>
                <span className="flex items-center gap-0.5 text-xs font-bold text-[#FBBF24]">
                  <MdStar size={14} />
                  {course.rating}
                </span>
              </div>

              <div
                className={`h-16 rounded-xl mb-3 bg-gradient-to-br ${course.gradient} flex items-center justify-center overflow-hidden`}
              >
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl select-none">{course.icon}</span>
                )}
              </div>

              <h3 className="text-sm font-bold admin-text-primary line-clamp-2 mb-1">
                {course.title}
              </h3>
              <p className="text-[10px] admin-text-secondary truncate mb-3">
                {course.teacher || 'Unassigned'}
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div
                  className="rounded-lg py-1.5 px-2 border text-center"
                  style={{
                    background: 'var(--admin-surface)',
                    borderColor: 'var(--admin-border-subtle)',
                  }}
                >
                  <div className="flex items-center justify-center gap-0.5 text-[9px] admin-text-secondary uppercase font-semibold">
                    <MdGroups size={11} className="text-[#8B5CF6]" />
                    Students
                  </div>
                  <p className="text-xs font-bold admin-text-primary">
                    {formatStudents(course.students || 0)}
                  </p>
                </div>
                <div
                  className="rounded-lg py-1.5 px-2 border text-center"
                  style={{
                    background: 'var(--admin-surface)',
                    borderColor: 'var(--admin-border-subtle)',
                  }}
                >
                  <div className="flex items-center justify-center gap-0.5 text-[9px] admin-text-secondary uppercase font-semibold">
                    <MdAttachMoney size={11} className="text-[#F59E0B]" />
                    Revenue
                  </div>
                  <p className="text-xs font-bold admin-text-primary">
                    {formatRevenue(computeRevenue(course))}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
};

export default TopPerformingCourses;
