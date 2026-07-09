import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdPerson,
  MdEdit,
  MdDelete,
  MdMoreVert,
  MdSchool,
  MdLocalFireDepartment,
  MdWorkspacePremium,
  MdNotificationsActive,
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
    Active: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', dot: '#10B981', text: '#10B981' },
    Completed: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', dot: '#3B82F6', text: '#3B82F6' },
    Pending: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', dot: '#F59E0B', text: '#D97706' },
  };
  const s = styles[status] || { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', dot: '#EF4444', text: '#EF4444' };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border whitespace-nowrap"
      style={{ background: s.bg, borderColor: s.border, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
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


const ResponsiveStyles = () => (
  <style>{`
    .st-root {
      container-type: inline-size;
      container-name: student-table;
    }

    /* Mobile-first default: card list. This is also the fallback for
       browsers without container query support (progressively enhanced
       below via @supports), so nothing breaks on older engines. */
    .st-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
      gap: 0.75rem;
      padding: 1rem;
    }
    .st-table-wrap { display: none; }

    @supports (container-type: inline-size) {
      @container student-table (min-width: 640px) {
        .st-cards { display: none; }
        .st-table-wrap { display: block; }
      }

      /* Progressive column disclosure: columns fold away as the
         container itself gets tighter, not as some fixed device size. */
      @container student-table (max-width: 899.98px) {
        .st-col-optional { display: none; }
      }
      @container student-table (max-width: 749.98px) {
        .st-col-secondary { display: none; }
      }
    }
  `}</style>
);

const ActionsMenu = ({ student, onViewProfile, onNotify, onEdit, onDelete, open, onToggle, onClose }) => {
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [placement, setPlacement] = useState({ vertical: 'bottom', horizontal: 'right' });

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !menuRef.current) return;
    const trigger = triggerRef.current.getBoundingClientRect();
    const menu = menuRef.current.getBoundingClientRect();
    const margin = 8;

    const spaceBelow = window.innerHeight - trigger.bottom;
    const spaceAbove = trigger.top;
    const vertical = spaceBelow >= menu.height + margin || spaceBelow >= spaceAbove ? 'bottom' : 'top';

    const spaceRight = window.innerWidth - trigger.right;
    const horizontal = spaceRight >= menu.width + margin ? 'left' : 'right';

    setPlacement({ vertical, horizontal });
  }, [open]);

  return (
    <div className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(student.id);
        }}
        className="w-8 h-8 rounded-lg flex items-center justify-center admin-text-secondary hover:text-[var(--admin-text-primary)] transition-all opacity-60 group-hover:opacity-100 bg-[var(--admin-surface-raised)]"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${student.name}`}
      >
        <MdMoreVert size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            role="menu"
            initial={{ opacity: 0, scale: 0.95, y: placement.vertical === 'bottom' ? -5 : 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: placement.vertical === 'bottom' ? -5 : 5 }}
            transition={{ duration: 0.15 }}
            className="absolute min-w-[11rem] max-w-[calc(100vw-1.5rem)] rounded-xl p-1.5 shadow-2xl z-20 border bg-[var(--admin-surface-hover)]"
            style={{
              borderColor: 'var(--admin-border)',
              [placement.vertical === 'bottom' ? 'top' : 'bottom']: 'calc(100% + 0.5rem)',
              [placement.horizontal === 'right' ? 'right' : 'left']: 0,
            }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => { onViewProfile(student); onClose(); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium admin-text-secondary hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-surface-raised)] rounded-lg transition-colors text-left"
            >
              <MdPerson size={14} className="text-[#3B82F6] shrink-0" />
              View Profile
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => { onNotify(student); onClose(); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium admin-text-secondary hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-surface-raised)] rounded-lg transition-colors text-left"
            >
              <MdNotificationsActive size={14} className="text-[#F59E0B] shrink-0" />
              Notify
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => { onEdit(student); onClose(); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium admin-text-secondary hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-surface-raised)] rounded-lg transition-colors text-left"
            >
              <MdEdit size={14} className="text-[#10B981] shrink-0" />
              Edit
            </button>
            <div className="h-px my-1 bg-[var(--admin-border)]" />
            <button
              type="button"
              role="menuitem"
              onClick={() => { onDelete(student); onClose(); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left"
            >
              <MdDelete size={14} className="shrink-0" />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProgressBar = ({ value }) => (
  <div className="flex items-center gap-3 w-full">
    <div className="flex-1 h-2 rounded-full overflow-hidden bg-[var(--admin-progress-track)] min-w-[3rem]">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${value}%`, background: 'linear-gradient(90deg, #06B6D4, #3B82F6, #8B5CF6)' }}
      />
    </div>
    <span className="text-xs font-bold text-[#3B82F6] shrink-0">{value}%</span>
  </div>
);

const StudentCard = ({ student, onViewProfile, ...menuProps }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={() => onViewProfile(student)}
    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onViewProfile(student)}
    className="rounded-xl border p-4 flex flex-col gap-3 cursor-pointer transition-all bg-[var(--admin-surface-raised)] hover:shadow-[inset_3px_0_0_#3B82F6]"
    style={{ borderColor: 'var(--admin-border-subtle)' }}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[var(--admin-surface)]">
          {getAvatarContent(student)}
        </div>
        <div className="min-w-0">
          <div className="font-semibold admin-text-primary text-sm truncate">{student.name}</div>
          <div className="text-xs admin-text-secondary truncate">{student.email}</div>
        </div>
      </div>
      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
        <ActionsMenu student={student} onViewProfile={onViewProfile} {...menuProps} />
      </div>
    </div>

    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(139, 92, 246, 0.2)' }}>
          <MdSchool size={14} className="text-[#8B5CF6]" />
        </div>
        <span className="text-xs font-medium admin-text-primary truncate">{student.enrolledCourse}</span>
      </div>
      {getStatusBadge(student.status)}
    </div>

    <ProgressBar value={student.progress ?? 0} />

    <div className="flex items-center justify-between gap-2 pt-2 border-t text-xs admin-text-secondary" style={{ borderColor: 'var(--admin-border-subtle)' }}>
      <span className="flex items-center gap-1"><MdWorkspacePremium size={14} className="text-[#F59E0B]" />{deriveCertificates(student)}</span>
      <span className="flex items-center gap-1"><MdLocalFireDepartment size={14} className="text-[#F59E0B]" />{deriveStreak(student)}d</span>
      <span className="truncate">{deriveLastActive(student)}</span>
    </div>
  </div>
);

const StudentTable = ({ students, onViewProfile, onNotify, onEdit, onDelete }) => {
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  const closeDropdown = useCallback(() => setActiveDropdownId(null), []);
  const toggleDropdown = useCallback(
    (id) => setActiveDropdownId((current) => (current === id ? null : id)),
    []
  );

  useEffect(() => {
    const handleOutsideClick = () => closeDropdown();
    const handleEscape = (e) => e.key === 'Escape' && closeDropdown();
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closeDropdown]);

  const menuProps = {
    onNotify,
    onEdit,
    onDelete,
    open: undefined, // set per-row below
    onToggle: toggleDropdown,
    onClose: closeDropdown,
  };

  return (
    <div
      className="st-root relative overflow-hidden rounded-2xl border shadow-[var(--admin-shadow-lg)] bg-[var(--admin-surface)]"
      style={{ borderColor: 'var(--admin-border)' }}
    >
      <ResponsiveStyles />

      <div className="px-4 sm:px-6 py-4 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--admin-border-subtle)' }}>
        <h2 className="text-lg font-bold admin-text-primary">Student Directory</h2>
        <span className="text-xs font-medium admin-text-secondary whitespace-nowrap">{students.length} shown</span>
      </div>

      {students.length === 0 ? (
        <div className="py-16 text-center admin-text-secondary text-sm px-4">No students match your filters.</div>
      ) : (
        <>
          {/* Narrow-container layout: stacked cards, no fixed widths, no horizontal scroll */}
          <div className="st-cards">
            {students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onViewProfile={onViewProfile}
                {...menuProps}
                open={activeDropdownId === student.id}
              />
            ))}
          </div>

          {/* Wide-container layout: full table, columns fold away as space shrinks */}
          <div className="st-table-wrap overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--admin-surface-raised)]">
                  <th className="py-4 px-5 font-bold text-[10px] admin-text-secondary uppercase tracking-wider">Student</th>
                  <th className="py-4 px-5 font-bold text-[10px] admin-text-secondary uppercase tracking-wider st-col-secondary">Course</th>
                  <th className="py-4 px-5 font-bold text-[10px] admin-text-secondary uppercase tracking-wider">Progress</th>
                  <th className="py-4 px-5 font-bold text-[10px] admin-text-secondary uppercase tracking-wider st-col-optional">Last Active</th>
                  <th className="py-4 px-5 font-bold text-[10px] admin-text-secondary uppercase tracking-wider st-col-optional">Certificates</th>
                  <th className="py-4 px-5 font-bold text-[10px] admin-text-secondary uppercase tracking-wider st-col-optional">Streak</th>
                  <th className="py-4 px-5 font-bold text-[10px] admin-text-secondary uppercase tracking-wider">Status</th>
                  <th className="py-4 px-5 font-bold text-[10px] admin-text-secondary uppercase tracking-wider text-right w-14"></th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
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
                      <div className="flex items-center gap-3 min-w-0">
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

                    <td className="py-4 px-5 st-col-secondary">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(139, 92, 246, 0.2)' }}>
                          <MdSchool size={14} className="text-[#8B5CF6]" />
                        </div>
                        <span className="text-xs font-medium admin-text-primary truncate">{student.enrolledCourse}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5" style={{ minWidth: 'min(13rem, 100%)' }}>
                      <ProgressBar value={student.progress ?? 0} />
                    </td>

                    <td className="py-4 px-5 st-col-optional">
                      <span className="text-xs admin-text-secondary whitespace-nowrap">{deriveLastActive(student)}</span>
                    </td>

                    <td className="py-4 px-5 st-col-optional">
                      <div className="flex items-center gap-1.5">
                        <MdWorkspacePremium size={16} className="text-[#F59E0B]" />
                        <span className="text-xs font-semibold admin-text-primary">{deriveCertificates(student)}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5 st-col-optional">
                      <div className="flex items-center gap-1.5">
                        <MdLocalFireDepartment size={16} className="text-[#F59E0B]" />
                        <span className="text-xs font-semibold admin-text-primary">{deriveStreak(student)}d</span>
                      </div>
                    </td>

                    <td className="py-4 px-5">{getStatusBadge(student.status)}</td>

                    <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <ActionsMenu
                        student={student}
                        onViewProfile={onViewProfile}
                        {...menuProps}
                        open={activeDropdownId === student.id}
                      />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentTable;
