import React from 'react';
import { MdTrendingUp } from 'react-icons/md';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import AnalyticsChartCard from './AnalyticsChartCard';
import ChartTooltip from './ChartTooltip';
import { studentGrowthChartData } from './analyticsData';

const StudentGrowthChart = () => (
  <AnalyticsChartCard
    title="Student Growth"
    subtitle="New registrations by month"
    icon={MdTrendingUp}
    iconGradient="linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)"
    glowColor="#3B82F6"
    delay={0.15}
  >
    <ResponsiveContainer width="100%" height={260} minWidth={0}>
      <AreaChart data={studentGrowthChartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="studentGrowthArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border-subtle)" vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'var(--admin-text-muted)', fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'var(--admin-text-muted)', fontSize: 11 }}
          width={44}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          name="Students"
          stroke="#3B82F6"
          strokeWidth={2}
          fill="url(#studentGrowthArea)"
          dot={false}
          activeDot={{ r: 4, fill: '#8B5CF6' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  </AnalyticsChartCard>
);

export default StudentGrowthChart;
