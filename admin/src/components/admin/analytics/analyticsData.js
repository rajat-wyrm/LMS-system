export const DATE_RANGE_OPTIONS = [
  'Today',
  'Last 7 Days',
  'Last 30 Days',
  'Last 6 Months',
  'All Time',
];

export const revenueTrendData = [
  { name: 'Jan', value: 1.2 },
  { name: 'Feb', value: 1.8 },
  { name: 'Mar', value: 2.4 },
  { name: 'Apr', value: 3.1 },
  { name: 'May', value: 3.8 },
  { name: 'Jun', value: 4.5 },
];

export const studentGrowthChartData = [
  { name: 'Jan', value: 1200 },
  { name: 'Feb', value: 1800 },
  { name: 'Mar', value: 2200 },
  { name: 'Apr', value: 3400 },
  { name: 'May', value: 4200 },
  { name: 'Jun', value: 5100 },
];

export const courseDistributionData = [
  { name: 'Programming', value: 45, color: '#8B5CF6' },
  { name: 'AI/ML', value: 25, color: '#06B6D4' },
  { name: 'Business', value: 15, color: '#EC4899' },
  { name: 'Design', value: 10, color: '#F59E0B' },
  { name: 'Others', value: 5, color: '#10B981' },
];

export const engagementMetricsData = [
  { name: 'Mon', sessions: 4200, avgDuration: 28 },
  { name: 'Tue', sessions: 5100, avgDuration: 32 },
  { name: 'Wed', sessions: 4800, avgDuration: 30 },
  { name: 'Thu', sessions: 5600, avgDuration: 35 },
  { name: 'Fri', sessions: 6200, avgDuration: 38 },
  { name: 'Sat', sessions: 3900, avgDuration: 24 },
  { name: 'Sun', sessions: 3400, avgDuration: 22 },
];

export const funnelStages = [
  { stage: 'Visit', count: 48200, pct: 100, color: '#3B82F6' },
  { stage: 'Signup', count: 18400, pct: 38.2, color: '#8B5CF6' },
  { stage: 'Enroll', count: 12600, pct: 26.1, color: '#06B6D4' },
  { stage: 'Complete', count: 8920, pct: 18.5, color: '#10B981' },
];

export const cohortRetentionData = {
  weeks: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
  cohorts: [
    { label: 'Jan 2026', values: [100, 82, 74, 68, 64, 61] },
    { label: 'Feb 2026', values: [100, 85, 78, 72, 69, null] },
    { label: 'Mar 2026', values: [100, 88, 81, 76, null, null] },
    { label: 'Apr 2026', values: [100, 86, 79, null, null, null] },
  ],
};

export const engagementOverviewMetrics = [
  {
    label: 'Avg Session',
    value: '32m',
    trend: '+8%',
    icon: 'session',
    color: '#3B82F6',
  },
  {
    label: 'Lessons / User',
    value: '4.2',
    trend: '+12%',
    icon: 'lessons',
    color: '#8B5CF6',
  },
  {
    label: 'Quiz Completion',
    value: '76%',
    trend: '+5%',
    icon: 'quiz',
    color: '#10B981',
  },
  {
    label: 'Return Rate',
    value: '68%',
    trend: '+3%',
    icon: 'return',
    color: '#F59E0B',
  },
];

export const satisfactionData = {
  daily: [
    { name: 'Jan 1', rating: 4.2, nps: 42, reviewVolume: 38, positiveSentiment: 78.5 },
    { name: 'Jan 2', rating: 4.0, nps: 35, reviewVolume: 45, positiveSentiment: 74.2 },
    { name: 'Jan 3', rating: 4.5, nps: 55, reviewVolume: 52, positiveSentiment: 82.1 },
    { name: 'Jan 4', rating: 4.3, nps: 48, reviewVolume: 41, positiveSentiment: 79.8 },
    { name: 'Jan 5', rating: 4.1, nps: 38, reviewVolume: 60, positiveSentiment: 76.3 },
    { name: 'Jan 6', rating: 4.6, nps: 62, reviewVolume: 55, positiveSentiment: 85.0 },
    { name: 'Jan 7', rating: 4.4, nps: 50, reviewVolume: 48, positiveSentiment: 81.4 },
  ],
  weekly: [
    { name: 'Week 1', rating: 4.1, nps: 38, reviewVolume: 210, positiveSentiment: 75.2 },
    { name: 'Week 2', rating: 4.3, nps: 45, reviewVolume: 265, positiveSentiment: 78.9 },
    { name: 'Week 3', rating: 4.0, nps: 32, reviewVolume: 198, positiveSentiment: 72.4 },
    { name: 'Week 4', rating: 4.5, nps: 58, reviewVolume: 310, positiveSentiment: 83.6 },
    { name: 'Week 5', rating: 4.2, nps: 44, reviewVolume: 280, positiveSentiment: 79.1 },
    { name: 'Week 6', rating: 4.6, nps: 65, reviewVolume: 340, positiveSentiment: 86.3 },
  ],
  monthly: [
    { name: 'Jan', rating: 4.1, nps: 38, reviewVolume: 920, positiveSentiment: 74.5 },
    { name: 'Feb', rating: 4.2, nps: 42, reviewVolume: 1050, positiveSentiment: 76.8 },
    { name: 'Mar', rating: 4.0, nps: 30, reviewVolume: 870, positiveSentiment: 72.1 },
    { name: 'Apr', rating: 4.4, nps: 52, reviewVolume: 1200, positiveSentiment: 80.3 },
    { name: 'May', rating: 4.3, nps: 48, reviewVolume: 1140, positiveSentiment: 78.9 },
    { name: 'Jun', rating: 4.6, nps: 63, reviewVolume: 1380, positiveSentiment: 85.2 },
  ],
  quarterly: [
    { name: 'Q1 2023', rating: 3.9, nps: 28, reviewVolume: 2800, positiveSentiment: 70.4 },
    { name: 'Q2 2023', rating: 4.1, nps: 36, reviewVolume: 3100, positiveSentiment: 73.8 },
    { name: 'Q3 2023', rating: 4.2, nps: 42, reviewVolume: 3400, positiveSentiment: 76.5 },
    { name: 'Q4 2023', rating: 4.3, nps: 48, reviewVolume: 3750, positiveSentiment: 79.2 },
    { name: 'Q1 2024', rating: 4.4, nps: 54, reviewVolume: 4100, positiveSentiment: 81.7 },
    { name: 'Q2 2024', rating: 4.6, nps: 65, reviewVolume: 4600, positiveSentiment: 85.4 },
  ],
};

export const KPI_SUMMARY = {
  revenue: { value: '₹12.8L', trend: '+24%' },
  students: { value: '15,240', trend: '+12.5%' },
  activeUsers: { value: '12,870', trend: '+18%' },
  completionRate: { value: '78%', trend: '+4.2%' },
};

export const HERO_STATS = {
  revenueGrowth: '+24% MoM',
  studentGrowth: '+12.5% this month',
};

export function buildAnalyticsExportRows() {
  return [
    { Metric: 'Total Revenue', Value: KPI_SUMMARY.revenue.value, Growth: KPI_SUMMARY.revenue.trend },
    { Metric: 'Total Students', Value: KPI_SUMMARY.students.value, Growth: KPI_SUMMARY.students.trend },
    { Metric: 'Active Users', Value: KPI_SUMMARY.activeUsers.value, Growth: KPI_SUMMARY.activeUsers.trend },
    { Metric: 'Completion Rate', Value: KPI_SUMMARY.completionRate.value, Growth: KPI_SUMMARY.completionRate.trend },
    { Metric: 'Revenue Growth (Hero)', Value: HERO_STATS.revenueGrowth, Growth: 'Last 6 months' },
    { Metric: 'Student Growth (Hero)', Value: HERO_STATS.studentGrowth, Growth: 'Last 6 months' },
  ];
}

export function buildAnalyticsReportRows(dateRange) {
  return [
    {
      reportDate: new Date().toISOString().split('T')[0],
      dateRange,
      totalRevenue: KPI_SUMMARY.revenue.value,
      totalStudents: KPI_SUMMARY.students.value,
      activeUsers: KPI_SUMMARY.activeUsers.value,
      completionRate: KPI_SUMMARY.completionRate.value,
    },
  ];
}
