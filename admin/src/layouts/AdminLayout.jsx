import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/ui/AdminSidebar';
import Navbar from '../components/ui/Navbar';
import { DateRangeProvider } from '../context/DateRangeContext';
import { AdminSidebarProvider, useAdminSidebar } from '../context/AdminSidebarContext';

function AdminLayoutContent() {
  const {
  sidebarWidth,
  mobileOpen,
  toggleMobileSidebar,
  closeMobileSidebar,
} = useAdminSidebar();

  return (
    <div
      className="flex min-h-screen bg-[var(--admin-shell-bg)]"
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
  className="flex-1 flex flex-col min-h-screen md:ml-[var(--sidebar-width)]"
>
        <Navbar onMenuClick={toggleMobileSidebar} />
        <main className="flex-1 overflow-y-auto bg-[var(--admin-shell-bg)] p-6">
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
