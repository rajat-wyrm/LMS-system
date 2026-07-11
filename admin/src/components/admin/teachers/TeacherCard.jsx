import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  MdStar,
  MdGroups,
  MdAttachMoney,
  MdMenuBook,
  MdVerified,
  MdWorkspacePremium,
} from 'react-icons/md';
import TeacherActionMenu from './TeacherActionMenu';
import { formatRevenue, formatStudents } from '../../../utils/teacherUtils';

const BADGES = [
  { key: 'verified', label: 'Verified', icon: MdVerified, color: '#3B82F6' },
  { key: 'featured', label: 'Featured', icon: MdWorkspacePremium, color: '#8B5CF6' },
  { key: 'topMentor', label: 'Top Mentor', icon: MdStar, color: '#F59E0B' },
];

const TeacherCard = ({ teacher, onView, onEdit, onDelete }) => {
  const activeBadges = BADGES.filter((b) => teacher[b.key]);
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
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: '0 24px 48px rgba(139, 92, 246, 0.2)',
      }}
      onClick={() => onView(teacher)}
      tabIndex={0}
      role="group"
      aria-label={`${teacher.name} teacher card. Press Enter to open actions menu.`}
      onKeyDown={handleCardKeyDown}
      className="rounded-2xl overflow-hidden cursor-pointer group border shadow-[var(--admin-shadow-card)] bg-[var(--admin-surface-raised)] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF6B35] focus-visible:outline-offset-2"
      style={{ borderColor: 'var(--admin-border)' }}
    >
      <div className={`relative h-32 bg-gradient-to-r ${teacher.color} overflow-hidden`}>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, var(--admin-surface-raised) 0%, transparent 55%)',
          }}
        />
        <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
          <TeacherActionMenu
            ref={menuRef}
            teacher={teacher}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
        <span
          className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            teacher.enabled
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              : 'bg-red-500/20 border-red-500/40 text-red-400'
          }`}
        >
          {teacher.enabled ? '● Active' : '● Disabled'}
        </span>
      </div>

      <div className="px-5 pb-5 -mt-10 relative z-10">
        <div className="flex items-end justify-between mb-3">
          <div
            className="w-[72px] h-[72px] rounded-full overflow-hidden ring-4 group-hover:scale-105 transition-transform duration-300"
            style={{
              borderColor: 'var(--admin-surface-raised)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            }}
          >
            {teacher.photo ? (
              <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${teacher.color} flex items-center justify-center text-white font-bold text-xl`}
              >
                {teacher.name[0]}
              </div>
            )}
          </div>
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold mb-1"
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#FBBF24',
            }}
          >
            <MdStar size={14} />
            {teacher.rating}
          </div>
        </div>

        <h3 className="text-lg font-bold admin-text-primary mb-0.5 group-hover:text-[#A78BFA] transition-colors">
          {teacher.name}
        </h3>
        <p className="text-xs admin-text-secondary mb-3 line-clamp-1">{teacher.style}</p>

        {activeBadges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {activeBadges.map((b) => {
              const Icon = b.icon;
              return (
                <span
                  key={b.key}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                  style={{
                    background: `${b.color}18`,
                    borderColor: `${b.color}40`,
                    color: b.color,
                  }}
                >
                  <Icon size={12} />
                  {b.label}
                </span>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-3 border-t" style={{ borderColor: 'var(--admin-border-subtle)' }}>
          <Stat icon={MdAttachMoney} label="Revenue" value={formatRevenue(teacher.revenue || 0)} accent="#F59E0B" />
          <Stat icon={MdGroups} label="Students" value={formatStudents(teacher.students || 0)} accent="#3B82F6" />
          <Stat
            icon={MdMenuBook}
            label="Courses"
            value={String(teacher.courses ?? 1)}
            accent="#8B5CF6"
          />
          <Stat icon={MdStar} label="Rating" value={`${teacher.rating}★`} accent="#FBBF24" />
        </div>
      </div>
    </motion.article>
  );
};

function Stat({ icon: Icon, label, value, accent }) {
  return (
    <div
      className="rounded-xl py-2 px-2 text-center"
      style={{ background: 'var(--admin-surface)' }}
    >
      <div className="flex items-center justify-center gap-1 mb-0.5">
        <Icon size={12} style={{ color: accent }} />
        <span className="text-[10px] admin-text-secondary uppercase font-semibold">{label}</span>
      </div>
      <p className="text-sm font-bold admin-text-primary">{value}</p>
    </div>
  );
}

export default TeacherCard;
