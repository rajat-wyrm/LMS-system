import React from 'react';
import { MdDonutLarge } from 'react-icons/md';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import AnalyticsChartCard from './AnalyticsChartCard';
import ChartTooltip from './ChartTooltip';
import { courseDistributionData } from './analyticsData';

const CourseDistributionChart = () => (
  <AnalyticsChartCard
    title="Course Distribution"
    subtitle="Enrollment share by category"
    icon={MdDonutLarge}
    iconGradient="linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)"
    glowColor="#8B5CF6"
    delay={0.2}
  >
    <ResponsiveContainer width="100%" height={260} minWidth={0}>
      <PieChart>
        <Pie
          data={courseDistributionData}
          cx="50%"
          cy="50%"
          innerRadius={58}
          outerRadius={88}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
        >
          {courseDistributionData.map((entry) => (
            <Cell key={entry.name} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip valueSuffix="%" />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => (
            <span className="text-[11px] admin-text-secondary">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  </AnalyticsChartCard>
);

export default CourseDistributionChart;
