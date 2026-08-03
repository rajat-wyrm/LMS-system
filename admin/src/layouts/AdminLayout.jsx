import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/ui/AdminSidebar';
import Navbar from '../components/ui/Navbar';
import { DateRangeProvider } from '../context/DateRangeContext';
import { AdminSidebarProvider, useAdminSidebar } from '../context/AdminSidebarContext';

function AdminLayoutContent() {
  const { sidebarWidth, mobileOpen, toggleMobileSidebar, closeMobileSidebar } = useAdminSidebar();
  const location = useLocation();

  useEffect(() => {
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }
  }, [location.pathname]);

  return (
    <div
      className="flex min-h-screen bg-background text-foreground font-body antialiased"
      style={{ '--sidebar-width': `${sidebarWidth}px` }}
    >
      <AdminSidebar mobileOpen={mobileOpen} />
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}
      <div
        className="flex-1 flex flex-col min-h-screen md:ml-[var(--sidebar-width)] transition-[margin-left] duration-[250ms] ease-in-out"
      >
        <Navbar onMenuClick={toggleMobileSidebar} />
        <main className="flex-1 overflow-y-auto bg-background/50 p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const AdminLayout = () => {
  return (
    <DateRangeProvider>
      <AdminSidebarProvider>
        <AdminLayoutContent />
      </AdminSidebarProvider>
    </DateRangeProvider>
  );
};

export default AdminLayout;
