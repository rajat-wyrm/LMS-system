import { useState, useEffect, useCallback } from 'react';
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
import { satisfactionData } from '../../../components/admin/analytics/analyticsData';
import { apiFetch } from '../../../api/config';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('Last 6 Months');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/analytics');
      setAnalyticsData(data.data);
    } catch (err) {
      console.warn('Backend analytics connection failed. Loading local mock analytics data.');
      setAnalyticsData({
        kpiSummary: {
          revenue: { value: '₹12.8L', trend: '+24%' },
          students: { value: '15,240', trend: '+12.5%' },
          activeUsers: { value: '12,870', trend: '+18%' },
          completionRate: { value: '78%', trend: '+4.2%' },
        },
        monthlyStats: [
          { name: 'Jan', revenue: 1.2, students: 1200 },
          { name: 'Feb', revenue: 1.8, students: 1800 },
          { name: 'Mar', revenue: 2.4, students: 2200 },
          { name: 'Apr', revenue: 3.1, students: 3400 },
          { name: 'May', revenue: 3.8, students: 4200 },
          { name: 'Jun', revenue: 4.5, students: 5100 },
        ],
        courseDistribution: [
          { name: 'Programming', value: 45 },
          { name: 'AI/ML', value: 25 },
          { name: 'Business', value: 15 },
          { name: 'Design', value: 10 },
          { name: 'Others', value: 5 },
        ],
        engagementData: [
          { name: 'Mon', sessions: 4200, avgDuration: 28 },
          { name: 'Tue', sessions: 5100, avgDuration: 32 },
          { name: 'Wed', sessions: 4800, avgDuration: 30 },
          { name: 'Thu', sessions: 5600, avgDuration: 35 },
          { name: 'Fri', sessions: 6200, avgDuration: 38 },
          { name: 'Sat', sessions: 3900, avgDuration: 24 },
          { name: 'Sun', sessions: 3400, avgDuration: 22 },
        ],
        funnelStages: [
          { stage: 'Visit', count: 48200, pct: 100, color: '#3B82F6' },
          { stage: 'Signup', count: 18400, pct: 38.2, color: '#8B5CF6' },
          { stage: 'Enroll', count: 12600, pct: 26.1, color: '#06B6D4' },
          { stage: 'Complete', count: 8920, pct: 18.5, color: '#10B981' },
        ],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const kpi = analyticsData?.kpiSummary;
  const heroStats = {
    revenueGrowth: kpi ? `${kpi.revenue.value} total` : 'Loading...',
    studentGrowth: kpi ? `${kpi.students.value} students` : 'Loading...'
  };

  const handleExport = () => {
    if (!kpi) return;
    exportToCSV(
      [
        { Metric: 'Total Revenue', Value: kpi.revenue.value },
        { Metric: 'Total Students', Value: kpi.students.value },
        { Metric: 'Active Users', Value: kpi.activeUsers.value },
        { Metric: 'Completion Rate', Value: kpi.completionRate.value },
      ],
      ['Metric', 'Value'],
      'platform-analytics-report.csv'
    );
  };

  const handleGenerateReport = () => {
    if (!analyticsData) return;
    exportToCSV(
      [{ reportDate: new Date().toISOString().split('T')[0], dateRange, ...kpi }],
      ['reportDate', 'dateRange'],
      'lms-analytics-summary-report.csv'
    );
  };

  return (
    <div className="admin-page space-y-6 md:space-y-8 animate-fade-in relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
      <AnalyticsHero
        revenueGrowth={heroStats.revenueGrowth}
        studentGrowth={heroStats.studentGrowth}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onExport={handleExport}
        onGenerateReport={handleGenerateReport}
      />

      <AnalyticsKpiRow kpiData={kpi} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueTrendChart data={analyticsData?.monthlyStats} loading={loading} />
        <StudentGrowthChart data={analyticsData?.monthlyStats} loading={loading} />
        <CourseDistributionChart data={analyticsData?.courseDistribution} loading={loading} />
        <EngagementMetricsChart data={analyticsData?.engagementData} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FunnelAnalytics data={analyticsData?.funnelStages} loading={loading} />
        <CohortRetention loading={loading} />
      </div>

      <EngagementOverview loading={loading} />

      <div className="grid grid-cols-1">
        <LearnerSatisfactionTrendsCard satisfactionData={analyticsData?.satisfactionData ?? satisfactionData} isLoading={loading} />
      </div>
    </div>
  );
};

export default Analytics;
