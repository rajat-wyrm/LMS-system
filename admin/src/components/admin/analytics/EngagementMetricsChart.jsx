import { MdBarChart } from 'react-icons/md';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import AnalyticsChartCard from './AnalyticsChartCard';
import ChartTooltip from './ChartTooltip';

const EngagementMetricsChart = ({ data = [], loading = false }) => (
  <AnalyticsChartCard
    title="Engagement Metrics"
    subtitle="Weekly sessions and avg. duration (min)"
    icon={MdBarChart}
    iconGradient="linear-gradient(135deg, #10B981 0%, #06B6D4 100%)"
    glowColor="#10B981"
    delay={0.25}
  >
    {loading ? (
      <div className="h-[260px] rounded-xl animate-pulse bg-[var(--admin-surface-raised)]" />
    ) : (
      <ResponsiveContainer width="100%" height={260} minWidth={0}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border-subtle)" vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--admin-text-muted)', fontSize: 11 }}
          />
          <YAxis
            yAxisId="left"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--admin-text-muted)', fontSize: 11 }}
            width={40}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--admin-text-muted)', fontSize: 11 }}
            width={36}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) => (
              <span className="admin-text-secondary">{value}</span>
            )}
          />
          <Bar
            yAxisId="left"
            dataKey="sessions"
            name="Sessions"
            fill="#3B82F6"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            yAxisId="right"
            dataKey="avgDuration"
            name="Avg Duration"
            fill="#10B981"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    )}
  </AnalyticsChartCard>
);

export default EngagementMetricsChart;
