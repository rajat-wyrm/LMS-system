import React from 'react';
import { motion } from 'framer-motion';
import {
  MdArrowBack,
  MdMail,
  MdPhone,
  MdDateRange,
  MdStar,
  MdEdit,
  MdDelete,
  MdPerson,
  MdGroups,
  MdAttachMoney,
  MdMenuBook,
} from 'react-icons/md';
import { formatRevenue } from '../../../utils/teacherUtils';

const TeacherProfileView = ({ teacher, onBack, onEdit, onDelete }) => {
  if (!teacher) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className="admin-page rounded-2xl relative overflow-hidden border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)] min-h-[70vh]"
    >
      <button
        type="button"
        onClick={onBack}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm px-4 py-2 rounded-full border transition-colors admin-text-primary"
        style={{
          background: 'var(--admin-surface-raised)',
          borderColor: 'var(--admin-border)',
        }}
      >
        <MdArrowBack size={18} /> Back
      </button>

      <div className={`h-56 w-full bg-gradient-to-r ${teacher.color} opacity-90`} />
      <div
        className="h-56 w-full absolute top-0 left-0"
        style={{
          background: 'linear-gradient(to top, var(--admin-page-panel), transparent)',
        }}
      />

      <div className="relative z-10 pt-32 px-6 md:px-12 pb-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div
            className="w-36 h-36 rounded-full overflow-hidden shrink-0 ring-4"
            style={{
              borderColor: 'var(--admin-page-panel)',
              boxShadow: 'var(--admin-shadow-lg)',
              background: 'var(--admin-surface)',
            }}
          >
            {teacher.photo ? (
              <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MdPerson className="text-5xl admin-text-muted" />
              </div>
            )}
          </div>

          <div className="flex-1 w-full pt-2">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold admin-text-primary mb-2">{teacher.name}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="text-sm font-medium px-3 py-1 rounded-full border admin-text-secondary"
                    style={{
                      background: 'var(--admin-surface)',
                      borderColor: 'var(--admin-border)',
                    }}
                  >
                    {teacher.style}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                      teacher.enabled
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}
                  >
                    {teacher.enabled ? '● Active' : '● Disabled'}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => onEdit(teacher)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border font-medium text-sm admin-text-primary transition-all hover:bg-[var(--admin-surface-hover)]"
                  style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-surface-raised)' }}
                >
                  <MdEdit size={16} /> Edit Profile
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(teacher.id)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all font-medium text-sm"
                >
                  <MdDelete size={16} /> Delete
                </button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Students', value: (teacher.students || 0).toLocaleString(), icon: MdGroups, color: '#3B82F6' },
                { label: 'Rating', value: `${teacher.rating} ★`, icon: MdStar, color: '#F59E0B' },
                { label: 'Revenue', value: formatRevenue(teacher.revenue || 0), icon: MdAttachMoney, color: '#10B981' },
                { label: 'Courses', value: String(teacher.courses ?? 1), icon: MdMenuBook, color: '#8B5CF6' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="p-5 rounded-2xl border"
                    style={{
                      background: 'var(--admin-surface)',
                      borderColor: 'var(--admin-border)',
                    }}
                  >
                    <div className="flex items-center gap-2 admin-text-secondary text-xs uppercase tracking-wider mb-2">
                      <Icon size={16} style={{ color: stat.color }} />
                      {stat.label}
                    </div>
                    <div className="text-2xl font-bold admin-text-primary">{stat.value}</div>
                  </div>
                );
              })}
            </div>

            <div
              className="mt-6 p-6 rounded-2xl border"
              style={{
                background: 'var(--admin-surface)',
                borderColor: 'var(--admin-border)',
              }}
            >
              <h3 className="text-lg font-semibold mb-3 admin-text-primary">About</h3>
              <p className="admin-text-secondary leading-relaxed">{teacher.bio}</p>
            </div>

            <div
              className="mt-6 p-6 rounded-2xl border grid grid-cols-1 md:grid-cols-2 gap-8"
              style={{
                background: 'var(--admin-surface)',
                borderColor: 'var(--admin-border)',
              }}
            >
              <div>
                <h3 className="text-lg font-semibold mb-4 admin-text-primary">Contact Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 admin-text-secondary">
                    <MdMail className="admin-text-muted shrink-0" />
                    <a href={`mailto:${teacher.email}`} className="hover:text-[var(--admin-text-primary)] transition-colors">
                      {teacher.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 admin-text-secondary">
                    <MdPhone className="admin-text-muted shrink-0" />
                    <a href={`tel:${teacher.phone}`} className="hover:text-[var(--admin-text-primary)] transition-colors">
                      {teacher.phone}
                    </a>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 admin-text-primary">Platform Details</h3>
                <div className="flex items-center gap-3 admin-text-secondary text-sm">
                  <MdDateRange className="admin-text-muted shrink-0" />
                  Joined on {teacher.joinDate}
                </div>
                <p className="mt-3 text-sm admin-text-secondary">
                  Primary course: <span className="font-semibold admin-text-primary">{teacher.course}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TeacherProfileView;
