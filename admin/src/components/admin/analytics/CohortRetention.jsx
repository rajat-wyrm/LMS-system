import React from 'react';
import { motion } from 'framer-motion';
import { MdGridOn } from 'react-icons/md';
import { cohortRetentionData } from './analyticsData';

function retentionColor(pct) {
  if (pct == null) return 'var(--admin-progress-track)';
  if (pct >= 85) return 'rgba(16, 185, 129, 0.85)';
  if (pct >= 70) return 'rgba(59, 130, 246, 0.75)';
  if (pct >= 55) return 'rgba(139, 92, 246, 0.65)';
  return 'rgba(245, 158, 11, 0.55)';
}

const CohortRetention = () => {
  const { weeks, cohorts } = cohortRetentionData;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.35 }}
      whileHover={{ y: -4 }}
      className="rounded-2xl border p-5 shadow-[var(--admin-shadow-card)] bg-[var(--admin-surface)] h-full transition-all duration-300 overflow-x-auto"
      style={{ borderColor: 'var(--admin-border)' }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shrink-0"
          style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)' }}
        >
          <MdGridOn size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold admin-text-primary">Cohort Retention</h3>
          <p className="text-[11px] admin-text-secondary mt-0.5">
            Weekly retention % by signup cohort
          </p>
        </div>
      </div>

      <table className="w-full min-w-[320px] text-xs border-collapse">
        <thead>
          <tr>
            <th className="text-left py-2 pr-2 admin-text-secondary font-semibold">Cohort</th>
            {weeks.map((w) => (
              <th key={w} className="text-center py-2 px-1 admin-text-secondary font-semibold">
                {w}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((row) => (
            <tr key={row.label}>
              <td className="py-2 pr-2 font-medium admin-text-primary whitespace-nowrap">
                {row.label}
              </td>
              {row.values.map((pct, i) => (
                <td key={`${row.label}-${weeks[i]}`} className="p-1">
                  <div
                    className="rounded-lg h-9 flex items-center justify-center font-bold tabular-nums"
                    style={{
                      background: retentionColor(pct),
                      color: pct != null ? '#fff' : 'var(--admin-text-muted)',
                      minWidth: 40,
                    }}
                    title={pct != null ? `${pct}% retained` : 'N/A'}
                  >
                    {pct != null ? `${pct}%` : '—'}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </motion.section>
  );
};

export default CohortRetention;
