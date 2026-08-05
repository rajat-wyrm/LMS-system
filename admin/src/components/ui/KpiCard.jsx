import React from 'react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * KpiCard – displays a KPI metric.
 * Props:
 *   title: string – label of the KPI
 *   value: string | number – main displayed value
 *   sparklineData?: {name: string, value: number}[] – optional tiny sparkline (shown only for important cards)
 *   sparklineColor?: string – CSS color for the sparkline line (default: '#06B6D4')
 */
const KpiCard = ({ title, value, sparklineData, sparklineColor = '#06B6D4' }) => {
  return (
    <div className="kpi-card bg-[#111827] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 hover:border-[rgba(100,255,255,0.2)] transition-colors duration-200">
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#9CA3AF]">{title}</span>
          <span className="text-2xl font-semibold text-[#E5E7EB]">{value}</span>
        </div>
        {sparklineData && (
          <div className="h-12 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" hide />
                <Tooltip cursor={false} contentStyle={{ background: 'rgba(0,0,0,0.6)', border: 'none' }} />
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
