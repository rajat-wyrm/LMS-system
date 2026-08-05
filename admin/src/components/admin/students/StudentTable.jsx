import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdPerson,
  MdEdit,
  MdDelete,
  MdMoreVert,
  MdSchool,
  MdLocalFireDepartment,
  MdWorkspacePremium,
} from 'react-icons/md';

const getAvatarContent = (student) => {
  if (student.avatar) {
    return (
      <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
    );
  }
  const colors = [
    ['#3B82F6', '#1e3a8a'],
    ['#10B981', '#065f46'],
    ['#8B5CF6', '#5b21b6'],
    ['#F59E0B', '#c2410c'],
  ];
  const idx = (student.name?.charCodeAt(0) || 0) % colors.length;
  return (
    <div
      className="w-full h-full flex items-center justify-center font-bold text-sm text-white"
      style={{ background: `linear-gradient(135deg, ${colors[idx][0]}, ${colors[idx][1]})` }}
    >
      {student.name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
};

const getStatusBadge = (status) => {
  const styles = {
    Active: {
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.4)',
      dot: '#10B981',
      text: '#10B981',
    },
    Completed: {
      bg: 'rgba(59, 130, 246, 0.15)',
      border: 'rgba(59, 130, 246, 0.4)',
      dot: '#3B82F6',
      text: '#3B82F6',
    },
    Pending: {
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.4)',
      dot: '#F59E0B',
      text: '#D97706',
    },
  };
  const s = styles[status] || {
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.4)',
    dot: '#EF4444',
    text: '#EF4444',
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border"
      style={{ background: s.bg, borderColor: s.border, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {status}
    </span>
  );
};

const deriveLastActive = (student) =>
  student.lastActive ||
  (student.status === 'Active' ? '2h ago' : student.status === 'Pending' ? '5d ago' : '1w ago');

const deriveCertificates = (student) =>
  student.certificates ?? Math.max(0, Math.floor((student.progress ?? 0) / 25));

const deriveStreak = (student) =>
  student.streak ?? Math.max(1, Math.floor((student.progress ?? 0) / 12));

const StudentTable = ({ students, onViewProfile, onNotify, onEdit, onDelete }) => {
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdownId(null);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border shadow-[var(--admin-shadow-lg)] bg-[var(--admin-surface)]"
      style={{ borderColor: 'var(--admin-border)' }}
    >
      <div
        className="px-6 py-4 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--admin-border-subtle)' }}
      >
        <h2 className="text-lg font-bold admin-text-primary">Student Directory</h2>
        <span className="text-xs font-medium admin-text-secondary">{students.length} shown</span>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1050px]">
          <thead>
            <tr className="bg-[var(--admin-surface-raised)]">
              {[
                'Student',
                'Course',
                'Progress',
                'Last Active',
                'Certificates',
                'Streak',
                'Status',
                '',
              ].map((col) => (
                <th
                  key={col || 'actions'}
                  className={`py-4 px-5 font-bold text-[10px] admin-text-secondary uppercase tracking-wider ${
                    col === '' ? 'text-right w-14' : ''
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center admin-text-secondary text-sm">
                  No students match your filters.
                </td>
              </tr>
            ) : (
              students.map((student, index) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group cursor-pointer border-b transition-all duration-200 hover:bg-[var(--admin-surface-hover)] hover:shadow-[inset_3px_0_0_#3B82F6]"
                  style={{ borderColor: 'var(--admin-border-subtle)' }}
                  onClick={() => onViewProfile(student)}
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-transparent group-hover:ring-[#3B82F6]/50 transition-all bg-[var(--admin-surface-raised)]">
                        {getAvatarContent(student)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold admin-text-primary text-sm truncate group-hover:text-[#3B82F6] transition-colors">
                          {student.name}
                        </div>
                        <div className="text-xs admin-text-secondary truncate">{student.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(139, 92, 246, 0.2)' }}
                      >
                        <MdSchool size={14} className="text-[#8B5CF6]" />
                      </div>
                      <span className="text-xs font-medium admin-text-primary">{student.enrolledCourse}</span>
                    </div>
                  </td>

                  <td className="py-4 px-5 w-52">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full overflow-hidden bg-[var(--admin-progress-track)]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${student.progress ?? 0}%`,
                            background: 'linear-gradient(90deg, #06B6D4, #3B82F6, #8B5CF6)',
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-[#3B82F6] w-9 shrink-0">
                        {student.progress ?? 0}%
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-5">
                    <span className="text-xs admin-text-secondary">{deriveLastActive(student)}</span>
                  </td>

                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1.5">
                      <MdWorkspacePremium size={16} className="text-[#F59E0B]" />
                      <span className="text-xs font-semibold admin-text-primary">
                        {deriveCertificates(student)}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1.5">
                      <MdLocalFireDepartment size={16} className="text-[#F59E0B]" />
                      <span className="text-xs font-semibold admin-text-primary">
                        {deriveStreak(student)}d
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-5">{getStatusBadge(student.status)}</td>

                  <td className="py-4 px-5 text-right relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownId(activeDropdownId === student.id ? null : student.id);
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center admin-text-secondary hover:text-[var(--admin-text-primary)] transition-all ml-auto opacity-60 group-hover:opacity-100 bg-[var(--admin-surface-raised)]"
                    >
                      <MdMoreVert size={18} />
                    </button>

                    <AnimatePresence>
                      {activeDropdownId === student.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -5 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-5 top-12 w-44 rounded-xl p-1.5 shadow-2xl z-20 border bg-[var(--admin-surface-hover)]"
                          style={{ borderColor: 'var(--admin-border)' }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              onViewProfile(student);
                              setActiveDropdownId(null);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium admin-text-secondary hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-surface-raised)] rounded-lg transition-colors text-left"
                          >
                            <MdPerson size={14} className="text-[#3B82F6]" />
                            View Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onNotify(student);
                              setActiveDropdownId(null);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium admin-text-secondary hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-surface-raised)] rounded-lg transition-colors text-left"
                          >
                            Notify
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onEdit(student);
                              setActiveDropdownId(null);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium admin-text-secondary hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-surface-raised)] rounded-lg transition-colors text-left"
                          >
                            <MdEdit size={14} className="text-[#10B981]" />
                            Edit
                          </button>
                          <div className="h-px my-1 bg-[var(--admin-border)]" />
                          <button
                            type="button"
                            onClick={() => {
                              onDelete(student);
                              setActiveDropdownId(null);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                          >
                            <MdDelete size={14} />
                            Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;
