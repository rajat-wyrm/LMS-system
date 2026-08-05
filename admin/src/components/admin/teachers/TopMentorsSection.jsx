import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MdEmojiEvents, MdStar, MdGroups, MdAttachMoney } from 'react-icons/md';
import { formatRevenue, formatStudents } from '../../../utils/teacherUtils';

const RANK_STYLES = [
  { ring: 'ring-[#F59E0B]/60', glow: 'rgba(245,158,11,0.35)', label: '#1' },
  { ring: 'ring-[#CBD5E1]/50', glow: 'rgba(203,213,225,0.25)', label: '#2' },
  { ring: 'ring-[#CD7F32]/50', glow: 'rgba(205,127,50,0.3)', label: '#3' },
];

const TopMentorsSection = ({ teachers, onViewProfile }) => {
  const topThree = useMemo(
    () =>
      [...teachers]
        .sort((a, b) => (b.students || 0) - (a.students || 0))
        .slice(0, 3),
    [teachers]
  );

  if (topThree.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="relative overflow-hidden rounded-3xl border p-6 md:p-8 shadow-[var(--admin-shadow-card)]"
      style={{
        borderColor: 'rgba(139, 92, 246, 0.35)',
        background:
          'linear-gradient(135deg, var(--admin-surface) 0%, rgba(139,92,246,0.12) 50%, rgba(6,182,212,0.08) 100%)',
      }}
    >
      <div className="absolute -top-16 right-8 w-56 h-56 rounded-full bg-[#8B5CF6]/15 blur-[70px] pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-[0_0_24px_rgba(245,158,11,0.4)]"
            style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)' }}
          >
            <MdEmojiEvents size={26} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold admin-text-primary">Top Mentors</h2>
            <p className="text-xs admin-text-secondary">Spotlight on your highest-impact instructors</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5">
        {topThree.map((mentor, index) => {
          const style = RANK_STYLES[index];
          return (
            <motion.button
              key={mentor.id}
              type="button"
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onViewProfile(mentor)}
              className={`text-left rounded-2xl p-5 border transition-all cursor-pointer ring-2 ${style.ring} bg-[var(--admin-surface-raised)]`}
              style={{
                boxShadow: `0 16px 40px ${style.glow}`,
                borderColor: 'var(--admin-border)',
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <span
                  className="text-xs font-extrabold px-2.5 py-1 rounded-lg"
                  style={{
                    background: 'rgba(139,92,246,0.2)',
                    color: '#A78BFA',
                  }}
                >
                  {style.label}
                </span>
                <span className="flex items-center gap-1 text-sm font-bold text-[#FBBF24]">
                  <MdStar size={16} />
                  {mentor.rating}
                </span>
              </div>

              <div className="flex flex-col items-center text-center gap-3">
                <div
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden ring-4 ${style.ring} shadow-lg`}
                >
                  {mentor.photo ? (
                    <img
                      src={mentor.photo}
                      alt={mentor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-br ${mentor.color} flex items-center justify-center text-2xl font-bold text-white`}
                    >
                      {mentor.name[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold admin-text-primary">{mentor.name}</h3>
                  <p className="text-xs admin-text-secondary truncate max-w-[200px]">
                    {mentor.style}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div
                  className="rounded-xl py-2 px-2 border"
                  style={{
                    background: 'var(--admin-surface)',
                    borderColor: 'var(--admin-border-subtle)',
                  }}
                >
                  <div className="flex items-center justify-center gap-1 text-[10px] admin-text-secondary uppercase font-semibold mb-0.5">
                    <MdGroups size={12} className="text-[#3B82F6]" />
                    Students
                  </div>
                  <p className="text-sm font-bold admin-text-primary">
                    {formatStudents(mentor.students || 0)}
                  </p>
                </div>
                <div
                  className="rounded-xl py-2 px-2 border"
                  style={{
                    background: 'var(--admin-surface)',
                    borderColor: 'var(--admin-border-subtle)',
                  }}
                >
                  <div className="flex items-center justify-center gap-1 text-[10px] admin-text-secondary uppercase font-semibold mb-0.5">
                    <MdAttachMoney size={12} className="text-[#F59E0B]" />
                    Revenue
                  </div>
                  <p className="text-sm font-bold admin-text-primary">
                    {formatRevenue(mentor.revenue || 0)}
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

export default TopMentorsSection;
