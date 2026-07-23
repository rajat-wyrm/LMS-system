import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
const logo = '/logo.webp';
import { useAdminSidebar } from '../../context/AdminSidebarContext';
import { clearAdminAuth } from '../../utils/api';
import {
  LuLayoutDashboard,
  LuShield,
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

// ── Per-item accent color config ─────────────────────────────────────────────
const ACCENT = {
  Dashboard:          { color: 'hsl(var(--primary))',   rgb: '6,182,212'   },
  Students:           { color: 'hsl(var(--primary))',   rgb: '6,182,212'   },
  'Celebrity Teachers': { color: 'hsl(var(--secondary))', rgb: '139,92,246' },
  Courses:            { color: 'hsl(var(--orange))',    rgb: '255,102,51'  },
  Analytics:          { color: 'hsl(175 100% 35%)',     rgb: '0,178,149'   },
  'Reviews & Ratings':{ color: 'hsl(var(--secondary))', rgb: '139,92,246' },
  Notifications:      { color: 'hsl(var(--teal))',      rgb: '0,178,149'   },
  Settings:           { color: 'hsl(var(--accent))',    rgb: '59,130,246'  },
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
            className="fixed z-[200] pointer-events-none px-3 py-1.5 text-xs font-medium text-foreground bg-popover border border-border rounded-md shadow-lg whitespace-nowrap -translate-y-1/2"
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
    { name: 'Users',               path: '/dashboard/admin/users',        icon: LuShield },
    { name: 'Students',            path: '/dashboard/admin/students',     icon: LuUsers },
    { name: 'Celebrity Teachers',  path: '/dashboard/admin/teachers',     icon: LuStar },
    { name: 'Courses',             path: '/dashboard/admin/courses',      icon: LuBookOpen },
    { name: 'Analytics',           path: '/dashboard/admin/analytics',    icon: LuChartBar },
    { name: 'Reviews & Ratings',   path: '/dashboard/admin/reviews',      icon: LuMessageSquare },
    { name: 'Notifications',       path: '/dashboard/admin/notifications', icon: LuBell },
    { name: 'Settings',            path: '/dashboard/admin/settings',     icon: LuSettings2 },
  ];

  const handleLogout = () => {
    clearAdminAuth();
    navigate('/admin-login');
  };

  return (
    <aside
      className={`admin-sidebar h-screen border-r border-border flex flex-col fixed left-0 top-0 z-50 transition-[width] duration-[250ms] ease-in-out bg-card/80 backdrop-blur-xl ${
        collapsed ? 'w-[84px]' : 'w-[280px]'
      }`}
    >
      {/* ── Logo ── */}
      <div
        className={`flex items-center border-b border-border transition-[padding] duration-[250ms] ease-in-out ${
          collapsed ? 'justify-center px-2 py-5' : 'px-5 py-5'
        }`}
      >
        <button
          type="button"
          onClick={() => navigate('/dashboard/admin')}
          aria-label="Go to admin dashboard"
          className="group rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <img
            src="/favicon.svg"
            alt="UpToSkills Logo"
            className={`object-contain transition-all duration-300 ease-out group-hover:scale-105 ${
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
        <div className={collapsed ? 'flex justify-center mb-3' : 'mb-3'}>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Close sidebar'}
            className={`flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.6)] hover:scale-105 ${
              collapsed ? 'w-9 h-9' : 'gap-2 px-3.5 py-1.5 text-xs font-semibold tracking-wide'
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
          const accent = ACCENT[link.name] || { color: 'hsl(var(--primary))', rgb: '6,182,212' };
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
                  'flex items-center rounded-xl transition-all duration-300 relative group font-display focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  collapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3 py-2.5',
                  active
                    ? 'text-foreground font-semibold bg-muted/60 border border-primary/30 shadow-sm'
                    : `text-muted-foreground hover:text-foreground hover:bg-muted/30 ${collapsed ? '' : 'hover:translate-x-1'}`,
                ].join(' ');
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
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_hsl(var(--primary))]"
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
                        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                          active
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'bg-muted/50 text-muted-foreground group-hover:text-foreground group-hover:bg-muted'
                        }`}
                      >
                        <IconComponent
                          size={16}
                          className="transition-all duration-300 group-hover:scale-110"
                        />
                      </div>

                      <span
                        className={`text-sm tracking-wide truncate transition-all duration-[250ms] ease-in-out ${
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
        className={`border-t border-border pt-3 transition-[padding] duration-[250ms] ease-in-out ${
          collapsed ? 'px-2 pb-4' : 'px-3 pb-4'
        }`}
      >
        <SidebarTooltip label="Logout" enabled={collapsed}>
          <button
            onClick={handleLogout}
            className={`flex items-center w-full rounded-xl text-muted-foreground hover:text-destructive transition-all duration-300 text-sm font-medium group hover:bg-destructive/10 ${
              collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
            }`}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-destructive/10 border border-destructive/20 group-hover:bg-destructive/20 group-hover:border-destructive/40 transition-all duration-300">
              <LuLogOut size={15} className="text-destructive" />
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
