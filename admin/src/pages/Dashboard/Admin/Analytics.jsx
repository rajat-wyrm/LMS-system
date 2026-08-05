import React, { useState } from 'react';
import { exportToCSV } from '../../../utils/export';
import AnalyticsHero from '../../../components/admin/analytics/AnalyticsHero';
import AnalyticsKpiRow from '../../../components/admin/analytics/AnalyticsKpiRow';
import RevenueTrendChart from '../../../components/admin/analytics/RevenueTrendChart';
import StudentGrowthChart from '../../../components/admin/analytics/StudentGrowthChart';
import CourseDistributionChart from '../../../components/admin/analytics/CourseDistributionChart';
import EngagementMetricsChart from '../../../components/admin/analytics/EngagementMetricsChart';
import FunnelAnalytics from '../../../components/admin/analytics/FunnelAnalytics';
import CohortRetention from '../../../components/admin/analytics/CohortRetention';
import EngagementOverview from '../../../components/admin/analytics/EngagementOverview';
import LearnerSatisfactionTrendsCard from '../../../components/admin/analytics/LearnerSatisfactionTrendsCard';
import {
  HERO_STATS,
  satisfactionData,
  buildAnalyticsExportRows,
  buildAnalyticsReportRows,
} from '../../../components/admin/analytics/analyticsData';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('Last 6 Months');

  const handleExport = () => {
    exportToCSV(
      buildAnalyticsExportRows(),
      ['Metric', 'Value', 'Growth'],
      'platform-analytics-report.csv',
    );
  };

  const handleGenerateReport = () => {
    exportToCSV(
      buildAnalyticsReportRows(dateRange),
      ['reportDate', 'dateRange', 'totalRevenue', 'totalStudents', 'activeUsers', 'completionRate'],
      'lms-analytics-summary-report.csv',
    );
  };

  return (
    <div className="admin-page space-y-6 md:space-y-8 animate-fade-in relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
      <AnalyticsHero
        revenueGrowth={HERO_STATS.revenueGrowth}
        studentGrowth={HERO_STATS.studentGrowth}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onExport={handleExport}
        onGenerateReport={handleGenerateReport}
      />

      <AnalyticsKpiRow />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueTrendChart />
        <StudentGrowthChart />
        <CourseDistributionChart />
        <EngagementMetricsChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FunnelAnalytics />
        <CohortRetention />
      </div>

      <EngagementOverview />

      <div className="grid grid-cols-1">
        <LearnerSatisfactionTrendsCard satisfactionData={satisfactionData} isLoading={false} />
      </div>
    </div>
  );
};

export default Analytics;
