import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MdPerson,
  MdSettings,
  MdLock,
  MdPayment,
  MdPalette,
  MdHistory,
  MdHelpOutline,
  MdLogout,
  MdPersonAdd,
  MdLibraryBooks,
  MdAssessment,
} from 'react-icons/md';

const PANEL_WIDTH = 320;

const QUICK_ACTIONS = [
  {
    label: 'Add Student',
    icon: MdPersonAdd,
    path: '/dashboard/admin/students',
    className:
      'bg-gradient-to-r from-blue-500 to-cyan-400 hover:shadow-[0_8px_24px_rgba(59,130,246,0.45)]',
  },
  {
    label: 'Add Course',
    icon: MdLibraryBooks,
    path: '/dashboard/admin/courses',
    className:
      'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-[0_8px_24px_rgba(168,85,247,0.45)]',
  },
  {
    label: 'Generate Report',
    icon: MdAssessment,
    path: '/dashboard/admin/analytics',
    className:
      'bg-gradient-to-r from-orange-500 to-amber-400 hover:shadow-[0_8px_24px_rgba(249,115,22,0.45)]',
  },
];

const MENU_ITEMS = [
  {
    label: 'My Profile',
    icon: MdPerson,
    path: '/dashboard/admin/settings?tab=profile',
    iconColor: '#3B82F6',
    iconBg: 'rgba(59,130,246,0.18)',
  },
  {
    label: 'Account Settings',
    icon: MdSettings,
    path: '/dashboard/admin/settings?tab=profile',
    iconColor: '#8B5CF6',
    iconBg: 'rgba(139,92,246,0.18)',
  },
  {
    label: 'Security Settings',
    icon: MdLock,
    path: '/dashboard/admin/settings?tab=security',
    iconColor: '#EF4444',
    iconBg: 'rgba(239,68,68,0.18)',
  },
  {
    label: 'Billing',
    icon: MdPayment,
    path: '/dashboard/admin/settings?tab=billing',
    iconColor: '#10B981',
    iconBg: 'rgba(16,185,129,0.18)',
  },
  {
    label: 'Appearance',
    icon: MdPalette,
    path: '/dashboard/admin/settings?tab=appearance',
    iconColor: '#A855F7',
    iconBg: 'rgba(168,85,247,0.18)',
  },
  {
    label: 'Activity Log',
    icon: MdHistory,
    path: '/dashboard/admin/settings?tab=platform',
    placeholder: true,
    iconColor: '#06B6D4',
    iconBg: 'rgba(6,182,212,0.18)',
  },
];

const HELP_ITEM = {
  label: 'Help & Support',
  icon: MdHelpOutline,
  iconColor: '#F59E0B',
  iconBg: 'rgba(245,158,11,0.18)',
};

const panelMotion = {
  initial: { opacity: 0, y: -8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.98 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

const ProfileDropdown = ({ onToast }) => {
  const navigate = useNavigate();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, right: 16 });
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPanelPos({
      top: rect.bottom + 8,
      right: Math.max(12, window.innerWidth - rect.right),
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return undefined;
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    const onPointerDown = (e) => {
      const inTrigger = triggerRef.current?.contains(e.target);
      const inPanel = panelRef.current?.contains(e.target);
      if (!inTrigger && !inPanel) close();
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [close]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') close();
    };
    if (open) window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  const handleNav = (item) => {
    close();
    if (item.placeholder) {
      onToast?.('Activity log is coming soon.');
      navigate(item.path);
      return;
    }
    navigate(item.path);
  };

  const handleQuickAction = (action) => {
    close();
    navigate(action.path);
  };

  const handleLogout = () => {
    localStorage.removeItem('role');
    close();
    navigate('/admin-login');
  };

  const handleHelp = () => {
    close();
    onToast?.('Support: support@uptoskills.com — we typically reply within 24 hours.');
  };

  const dropdownPanel =
    typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={panelRef}
                id={menuId}
                role="menu"
                aria-label="Admin profile menu"
                initial={panelMotion.initial}
                animate={panelMotion.animate}
                exit={panelMotion.exit}
                transition={panelMotion.transition}
                className="admin-profile-dropdown flex flex-col p-4 gap-0"
                style={{
                  position: 'fixed',
                  top: panelPos.top,
                  right: panelPos.right,
                  width: PANEL_WIDTH,
                  zIndex: 9999,
                  maxHeight: `min(calc(100vh - ${panelPos.top}px - 16px), 640px)`,
                  overflowY: 'auto',
                }}
              >
                {/* Profile header */}
                <header className="flex flex-col items-center text-center pb-4 shrink-0">
                  <div
                    className="w-14 h-14 rounded-full p-[3px] bg-gradient-to-br from-[#A855F7] via-[#7C3AED] to-[#4F46E5] shadow-[0_0_20px_rgba(124,58,237,0.55)]"
                    aria-hidden
                  >
                    <div className="w-full h-full rounded-full bg-[#1a2a44] flex items-center justify-center text-lg font-bold text-white">
                      SA
                    </div>
                  </div>
                  <p className="mt-3 text-base font-semibold text-white">Super Admin</p>
                  <span className="mt-1.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#7C3AED] to-[#A855F7] shadow-[0_0_12px_rgba(124,58,237,0.35)]">
                    Super Admin
                  </span>
                  <p className="mt-2 text-xs text-slate-300 flex items-center justify-center gap-1.5">
                    <span className="text-emerald-400" aria-hidden>
                      ●
                    </span>
                    <span>Online</span>
                    <span className="text-slate-500" aria-hidden>
                      ·
                    </span>
                    <span className="text-slate-400">Last login today</span>
                  </p>
                </header>

                {/* Quick actions — vertical stack, no overlap */}
                <section className="flex flex-col gap-2 pb-4 shrink-0" aria-labelledby={`${menuId}-quick-actions`}>
                  <h3
                    id={`${menuId}-quick-actions`}
                    className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5"
                  >
                    Quick Actions
                  </h3>
                  <div className="flex flex-col gap-2">
                    {QUICK_ACTIONS.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.label}
                          type="button"
                          role="menuitem"
                          onClick={() => handleQuickAction(action)}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[14px] text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${action.className}`}
                        >
                          <Icon size={18} aria-hidden />
                          {action.label}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <div className="h-px bg-white/[0.08] shrink-0" role="separator" />

                {/* Menu items */}
                <nav className="flex flex-col gap-1 py-3 shrink-0" aria-label="Account links">
                  {MENU_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        role="menuitem"
                        onClick={() => handleNav(item)}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-200 hover:bg-white/[0.06] hover:shadow-[0_0_16px_rgba(255,255,255,0.04)] transition-all duration-150 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/50"
                      >
                        <span
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: item.iconBg, color: item.iconColor }}
                          aria-hidden
                        >
                          <Icon size={16} />
                        </span>
                        {item.label}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleHelp}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-200 hover:bg-white/[0.06] hover:shadow-[0_0_16px_rgba(255,255,255,0.04)] transition-all duration-150 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/50"
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: HELP_ITEM.iconBg, color: HELP_ITEM.iconColor }}
                      aria-hidden
                    >
                      <HELP_ITEM.icon size={16} />
                    </span>
                    {HELP_ITEM.label}
                  </button>
                </nav>

                <div className="h-px bg-white/[0.08] shrink-0" role="separator" />

                {/* Logout */}
                <div className="pt-3 shrink-0">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[14px] text-sm font-semibold text-red-100 bg-gradient-to-r from-red-500/20 to-red-600/25 border border-red-400/20 hover:from-red-500/30 hover:to-red-600/35 hover:shadow-[0_8px_24px_rgba(239,68,68,0.35)] hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
                  >
                    <MdLogout size={18} aria-hidden />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <>
      <div ref={triggerRef} className="relative">
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={open ? menuId : undefined}
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-3 cursor-pointer group rounded-lg px-1 py-1 hover:bg-[var(--admin-surface-hover)] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]/50 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center shadow-[0_0_10px_rgba(124,58,237,0.3)] text-xs font-bold text-white">
            SA
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold text-[var(--admin-text-primary)] group-hover:text-[#7C3AED] transition-colors leading-tight">
              Super Admin
            </span>
            <span className="text-[10px] text-[var(--admin-text-muted)]">Super Admin</span>
          </div>
          <svg
            className={`w-4 h-4 text-[var(--admin-text-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      {dropdownPanel}
    </>
  );
};

export default ProfileDropdown;
