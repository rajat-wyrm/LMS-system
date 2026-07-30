import React from 'react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * KpiCard – displays a KPI metric.
 * Props:
 *   title: string – label of the KPI
 *   value: string | number – main displayed value
 *   sparklineData?: {name: string, value: number}[] – optional tiny sparkline (shown only for important cards)
 *   sparklineColor?: string – CSS color for the sparkline line (default: 'hsl(var(--primary))')
 */
const KpiCard = ({ title, value, sparklineData, sparklineColor = 'hsl(189, 94%, 43%)' }) => {
  return (
    <div className="kpi-card bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-all duration-300 shadow-sm">
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <span className="text-2xl font-bold font-display text-foreground">{value}</span>
        </div>
        {sparklineData && (
          <div className="h-12 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" hide />
                <Tooltip cursor={false} contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))', fontSize: '12px' }} />
                <Line type="monotone" dataKey="value" stroke={sparklineColor} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
