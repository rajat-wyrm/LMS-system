import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  MdStar,
  MdGroups,
  MdAttachMoney,
  MdSchool,
  MdTrendingUp,
} from 'react-icons/md';
import CourseActionMenu from './CourseActionMenu';
import {
  computeRevenue,
  formatRevenue,
  formatStudents,
  getCourseHealth,
} from '../../../utils/courseUtils';

const levelStyles = {
  Beginner: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)', color: '#10B981' },
  Intermediate: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.35)', color: '#3B82F6' },
  Advanced: { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.35)', color: '#8B5CF6' },
  Expert: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)', color: '#F59E0B' },
};

const StarRating = ({ rating }) => {
  const full = Math.floor(rating);
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <MdStar
          key={i}
          size={12}
          className={i < full ? 'text-[#FBBF24]' : 'text-[var(--admin-text-muted)]'}
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-[#FBBF24]">{rating}</span>
    </span>
  );
};

const CourseCard = ({
  course,
  index,
  onEdit,
  onClone,
  onAnalytics,
  onPreview,
  onDelete,
}) => {
  const health = getCourseHealth(course);
  const lvl = levelStyles[course.level] || levelStyles.Beginner;
  const menuRef = useRef(null);

  const handleCardKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      menuRef.current?.openMenu();
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: '0 24px 48px rgba(6, 182, 212, 0.22)',
      }}
      tabIndex={0}
      role="group"
      aria-label={`${course.title} course card. Press Enter to open actions menu.`}
      onKeyDown={handleCardKeyDown}
      className="group relative flex flex-col rounded-2xl overflow-hidden border cursor-pointer shadow-[var(--admin-shadow-card)] bg-[var(--admin-surface-raised)] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF6B35] focus-visible:outline-offset-2"
      style={{ borderColor: 'var(--admin-border)' }}
    >
      <div className={`relative h-40 bg-gradient-to-br ${course.gradient} overflow-hidden shrink-0`}>
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <>
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 60%)',
              }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-5xl drop-shadow-lg select-none">
              {course.icon}
            </span>
          </>
        )}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />

        <span
          className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            course.active
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              : 'bg-gray-500/20 border-gray-500/40 text-gray-400'
          }`}
        >
          {course.active ? '● Active' : '● Inactive'}
        </span>

        <div
          className="absolute top-3 right-12 flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm"
          style={{
            background: `${health.color}22`,
            borderColor: `${health.color}55`,
            color: health.color,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: health.color }}
          />
          {health.label}
        </div>

        <div className="absolute top-3 right-3 z-10">
          <CourseActionMenu
            ref={menuRef}
            course={course}
            onEdit={onEdit}
            onClone={onClone}
            onAnalytics={onAnalytics}
            onPreview={onPreview}
            onDelete={onDelete}
          />
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
            style={{
              background: lvl.bg,
              borderColor: lvl.border,
              color: lvl.color,
            }}
          >
            {course.level}
          </span>
          {course.xp && (
            <span className="text-[10px] font-bold text-[#F59E0B]">{course.xp}</span>
          )}
        </div>

        <h3 className="text-base font-bold admin-text-primary leading-snug line-clamp-2 group-hover:text-[#22D3EE] transition-colors">
          {course.title}
        </h3>

        <p className="flex items-center gap-1.5 text-xs admin-text-secondary -mt-1">
          <MdSchool size={14} className="text-[#8B5CF6] shrink-0" />
          <span className="truncate">{course.teacher || 'Unassigned'}</span>
        </p>

        <StarRating rating={course.rating} />

        <div className="grid grid-cols-2 gap-2">
          <Stat
            icon={MdAttachMoney}
            label="Revenue"
            value={formatRevenue(computeRevenue(course))}
            accent="#F59E0B"
          />
          <Stat
            icon={MdGroups}
            label="Students"
            value={formatStudents(course.students || 0)}
            accent="#8B5CF6"
          />
        </div>

        <div>
          <div className="flex justify-between text-[10px] admin-text-secondary mb-1">
            <span className="flex items-center gap-1">
              <MdTrendingUp size={12} className="text-[#06B6D4]" />
              Completion
            </span>
            <span className="font-semibold admin-text-primary">{course.completion}%</span>
          </div>
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ background: 'var(--admin-progress-track)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${course.completion}%`,
                background: `linear-gradient(90deg, ${health.color}, #06B6D4)`,
              }}
            />
          </div>
        </div>
      </div>
    </motion.article>
  );
};

function Stat({ icon: Icon, label, value, accent }) {
  return (
    <div
      className="rounded-xl py-2 px-2 border"
      style={{
        background: 'var(--admin-surface)',
        borderColor: 'var(--admin-border-subtle)',
      }}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <Icon size={12} style={{ color: accent }} />
        <span className="text-[10px] admin-text-secondary uppercase font-semibold">{label}</span>
      </div>
      <p className="text-sm font-bold admin-text-primary">{value}</p>
    </div>
  );
}

export default CourseCard;
