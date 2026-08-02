import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdminSidebar } from '../../context/AdminSidebarContext';
import {
  LuLayoutDashboard,
  LuUsers,
  LuStar,
  LuBookOpen,
  LuChartBar,
  LuMessageSquare,
  LuBell,
  LuSettings2,
  LuLogOut,
  LuChevronRight,
  LuChevronLeft,
} from 'react-icons/lu';

// ── Per-item accent colour config ─────────────────────────────────────────────
const ACCENT = {
  Dashboard:          { color: '#3B82F6', rgb: '59,130,246'  },
  Students:           { color: '#06B6D4', rgb: '6,182,212'   },
  'Celebrity Teachers': { color: '#8B5CF6', rgb: '139,92,246' },
  Courses:            { color: '#F97316', rgb: '249,115,22'  },
  Analytics:          { color: '#10B981', rgb: '16,185,129'  },
  'Reviews & Ratings':{ color: '#EC4899', rgb: '236,72,153'  },
  Notifications:      { color: '#14B8A6', rgb: '20,184,166'  },
  Settings:           { color: '#6366F1', rgb: '99,102,241'  },
};

function SidebarTooltip({ label, children, enabled }) {
  const triggerRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  if (!enabled) {
    return children;
  }

  const updatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      top: rect.top + rect.height / 2,
      left: rect.right + 10,
    });
  };

  return (
    <>
      <div
        ref={triggerRef}
        className="w-full"
        onMouseEnter={() => {
          updatePosition();
          setVisible(true);
        }}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => {
          updatePosition();
          setVisible(true);
        }}
        onBlur={() => setVisible(false)}
      >
        {children}
      </div>
      {visible &&
        createPortal(
          <div
            role="tooltip"
            className="fixed z-[200] pointer-events-none px-2.5 py-1.5 text-xs font-medium text-white bg-[#0f172a] rounded-md shadow-[0_4px_14px_rgba(0,0,0,0.35)] whitespace-nowrap -translate-y-1/2"
            style={{ top: position.top, left: position.left }}
          >
            {label}
          </div>,
          document.body
        )}
    </>
  );
}

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, toggleCollapsed } = useAdminSidebar();

  const links = [
    { name: 'Dashboard',           path: '/dashboard/admin',              icon: LuLayoutDashboard, end: true },
    { name: 'Students',            path: '/dashboard/admin/students',     icon: LuUsers },
    { name: 'Celebrity Teachers',  path: '/dashboard/admin/teachers',     icon: LuStar },
    { name: 'Courses',             path: '/dashboard/admin/courses',      icon: LuBookOpen },
    { name: 'Analytics',           path: '/dashboard/admin/analytics',    icon: LuChartBar },
    { name: 'Reviews & Ratings',   path: '/dashboard/admin/reviews',      icon: LuMessageSquare },
    { name: 'Notifications',       path: '/dashboard/admin/notifications', icon: LuBell },
    { name: 'Settings',            path: '/dashboard/admin/settings',     icon: LuSettings2 },
  ];

  const handleLogout = () => {
    localStorage.removeItem('role');
    navigate('/admin-login');
  };

  return (
    <aside
      className={`admin-sidebar h-screen border-r flex flex-col fixed left-0 top-0 z-50 transition-[width] duration-[250ms] ease-in-out ${
        collapsed ? 'w-[84px]' : 'w-[280px]'
      }`}
    >
      {/* ── Logo ── */}
      <div
        className={`flex items-center border-b border-[var(--admin-nav-border)] transition-[padding] duration-[250ms] ease-in-out ${
          collapsed ? 'justify-center px-2 py-5' : 'px-5 py-5'
        }`}
      >
        <button
          type="button"
          onClick={() => navigate('/dashboard/admin')}
          aria-label="Go to admin dashboard"
          className="group rounded-lg focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF6B35] focus-visible:outline-offset-2"
        >
          <img
            src="/logo.webp"
            alt="UpToSkills Logo"
            className={`object-contain drop-shadow-[0_0_10px_rgba(124,58,237,0.5)] transition-all duration-300 ease-out group-hover:scale-105 group-hover:brightness-110 group-hover:drop-shadow-[0_0_18px_rgba(124,58,237,0.65)] ${
              collapsed ? 'h-8 w-8' : 'h-10'
            }`}
          />
        </button>
      </div>

      {/* ── Nav ── */}
      <nav
        className={`flex-1 overflow-y-auto py-4 space-y-1 custom-scrollbar transition-[padding] duration-[250ms] ease-in-out ${
          collapsed ? 'px-2' : 'px-3'
        }`}
      >
        {/* Collapse / expand control */}
        <div className={collapsed ? 'flex justify-center mb-2' : 'mb-2'}>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Close sidebar'}
            className={`flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF6B35] focus-visible:outline-offset-2 bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] text-white shadow-[0_0_16px_rgba(124,58,237,0.35)] hover:shadow-[0_0_22px_rgba(124,58,237,0.5)] hover:scale-105 ${
              collapsed ? 'w-9 h-9' : 'gap-2 px-3.5 py-2 text-[12px] font-semibold tracking-wide'
            }`}
          >
            {collapsed ? (
              <LuChevronRight size={16} aria-hidden />
            ) : (
              <>
                <LuChevronLeft size={14} aria-hidden />
                <span>Close</span>
              </>
            )}
          </button>
        </div>

        {links.map((link) => {
          const accent = ACCENT[link.name] || { color: '#8B5CF6', rgb: '139,92,246' };
          const IconComponent = link.icon;
          const isStudentsLink = link.name === 'Students';

          const navItem = (
            <NavLink
              to={link.path}
              end={link.end}
              className={({ isActive }) => {
                const active =
                  isActive ||
                  (isStudentsLink && location.pathname.includes('/students'));
                return [
                  'flex items-center rounded-xl transition-all duration-300 relative group focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF6B35] focus-visible:outline-offset-2',
                  collapsed ? 'justify-center px-0 py-2' : 'justify-between px-2.5 py-2',
                  active
                    ? 'text-white'
                    : `text-gray-400 hover:text-white ${collapsed ? '' : 'hover:translate-x-1'}`,
                ].join(' ');
              }}
              style={({ isActive }) => {
                const active =
                  isActive ||
                  (isStudentsLink && location.pathname.includes('/students'));
                if (active) {
                  return {
                    background: `linear-gradient(135deg, rgba(${accent.rgb},0.22), rgba(${accent.rgb},0.10))`,
                    border: `1px solid rgba(${accent.rgb},0.30)`,
                    boxShadow: `0 0 18px rgba(${accent.rgb},0.15)`,
                  };
                }
                return {};
              }}
            >
              {({ isActive }) => {
                const active =
                  isActive ||
                  (isStudentsLink && location.pathname.includes('/students'));
                return (
                  <>
                    {active && !collapsed && (
                      <motion.div
                        layoutId="adminActiveTab"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full"
                        style={{
                          background: accent.color,
                          boxShadow: `0 0 10px ${accent.color}`,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                    )}

                    <div
                      className={`flex items-center transition-all duration-[250ms] ease-in-out ${
                        collapsed ? 'justify-center w-full' : 'gap-3'
                      }`}
                    >
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-[10px] flex items-center justify-center transition-all duration-300"
                        style={{
                          background: active
                            ? `rgba(${accent.rgb},0.25)`
                            : `rgba(${accent.rgb},0.12)`,
                          border: `1px solid rgba(${accent.rgb},${active ? '0.40' : '0.20'})`,
                          boxShadow: active
                            ? `0 0 14px rgba(${accent.rgb},0.35)`
                            : 'none',
                        }}
                      >
                        <IconComponent
                          size={16}
                          style={{ color: accent.color }}
                          className="transition-all duration-300 group-hover:scale-110"
                        />
                      </div>

                      <span
                        className={`font-[550] text-[13px] tracking-wide truncate transition-all duration-[250ms] ease-in-out ${
                          collapsed
                            ? 'max-w-0 opacity-0 -translate-x-2 overflow-hidden'
                            : 'max-w-[180px] opacity-100 translate-x-0'
                        }`}
                      >
                        {link.name}
                      </span>
                    </div>
                  </>
                );
              }}
            </NavLink>
          );

          return (
            <div key={link.name}>
              <SidebarTooltip label={link.name} enabled={collapsed}>
                {navItem}
              </SidebarTooltip>
            </div>
          );
        })}
      </nav>

      {/* ── Logout ── */}
      <div
        className={`border-t border-white/8 pt-3 transition-[padding] duration-[250ms] ease-in-out ${
          collapsed ? 'px-2 pb-4' : 'px-3 pb-4'
        }`}
      >
        <SidebarTooltip label="Logout" enabled={collapsed}>
          <button
            onClick={handleLogout}
            className={`flex items-center w-full rounded-xl text-gray-400 hover:text-red-400 transition-all duration-300 text-[13px] font-[550] group hover:bg-red-400/8 ${
              collapsed ? 'justify-center px-0 py-2' : 'gap-3 px-2.5 py-2'
            }`}
          >
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center bg-red-500/10 border border-red-500/20 group-hover:bg-red-500/20 group-hover:border-red-500/40 group-hover:shadow-[0_0_12px_rgba(239,68,68,0.25)] transition-all duration-300">
              <LuLogOut size={15} className="text-red-400" />
            </div>
            <span
              className={`transition-all duration-[250ms] ease-in-out ${
                collapsed
                  ? 'max-w-0 opacity-0 overflow-hidden'
                  : 'max-w-[120px] opacity-100'
              }`}
            >
              Logout
            </span>
          </button>
        </SidebarTooltip>
      </div>
    </aside>
  );
};

export default AdminSidebar;
