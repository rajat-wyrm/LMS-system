import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/ui/AdminSidebar';
import Navbar from '../components/ui/Navbar';
import { DateRangeProvider } from '../context/DateRangeContext';
import { AdminSidebarProvider, useAdminSidebar } from '../context/AdminSidebarContext';

function AdminLayoutContent() {
  const { sidebarWidth } = useAdminSidebar();

  return (
    <div
      className="flex min-h-screen bg-background text-foreground font-body antialiased"
      style={{ '--sidebar-width': `${sidebarWidth}px` }}
    >
      <AdminSidebar />

      <div
        className="flex-1 flex flex-col min-h-screen transition-[margin-left] duration-[250ms] ease-in-out"
        style={{ marginLeft: 'var(--sidebar-width)' }}
      >
        <Navbar />
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
