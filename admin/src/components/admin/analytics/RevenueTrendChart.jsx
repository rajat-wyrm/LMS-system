import { MdShowChart } from 'react-icons/md';
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

const RevenueTrendChart = ({ data = [], loading = false }) => (
  <AnalyticsChartCard
    title="Revenue Trend"
    subtitle="Monthly revenue in INR lakhs (last 6 months)"
    icon={MdShowChart}
    iconGradient="linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)"
    glowColor="#F59E0B"
    delay={0.1}
  >
    {loading ? (
      <div className="h-[260px] rounded-xl animate-pulse bg-[var(--admin-surface-raised)]" />
    ) : (
      <ResponsiveContainer width="100%" height={260} minWidth={0}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
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
            tickFormatter={(v) => `INR ${v}L`}
            width={56}
          />
          <Tooltip content={<ChartTooltip valueSuffix="L" />} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#F59E0B"
            strokeWidth={2}
            fill="url(#revenueArea)"
            dot={false}
            activeDot={{ r: 4, fill: '#F59E0B' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    )}
  </AnalyticsChartCard>
);

export default RevenueTrendChart;
