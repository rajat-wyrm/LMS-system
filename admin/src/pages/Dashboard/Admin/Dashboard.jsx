import React from 'react';
import DashboardHero from '../../../components/admin/dashboard/DashboardHero';
import DashboardKpiRow from '../../../components/admin/dashboard/DashboardKpiRow';
import DashboardQuickActions from '../../../components/admin/dashboard/DashboardQuickActions';
import DashboardPlatformHighlights from '../../../components/admin/dashboard/DashboardPlatformHighlights';
import DashboardRecentActivity from '../../../components/admin/dashboard/DashboardRecentActivity';
import DashboardNotificationPreview from '../../../components/admin/dashboard/DashboardNotificationPreview';
import DashboardTopPerformers from '../../../components/admin/dashboard/DashboardTopPerformers';
import DashboardStudentGrowthChart from '../../../components/admin/dashboard/DashboardStudentGrowthChart';

const AdminDashboard = () => (
  <div className="admin-page flex flex-col gap-6 animate-fade-in relative z-10 pb-8 rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
    <DashboardHero />
    <DashboardKpiRow />
    <DashboardQuickActions />

    <section className="space-y-3">
      <h2 className="text-base font-bold admin-text-primary">Platform Highlights</h2>
      <DashboardPlatformHighlights />
    </section>

    <DashboardTopPerformers />

    <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-5 lg:gap-6 items-start">
      <DashboardRecentActivity />
      <DashboardNotificationPreview />
    </div>

    <DashboardStudentGrowthChart />
  </div>
);

export default AdminDashboard;
