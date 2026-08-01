import { motion } from 'framer-motion';
import { MdFilterAlt } from 'react-icons/md';

const FunnelAnalytics = ({ data = [], loading = false }) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3, duration: 0.35 }}
    whileHover={{ y: -4 }}
    className="rounded-2xl border p-5 shadow-[var(--admin-shadow-card)] bg-[var(--admin-surface)] h-full transition-all duration-300"
    style={{ borderColor: 'var(--admin-border)' }}
  >
    <div className="flex items-start gap-3 mb-5">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shrink-0"
        style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
      >
        <MdFilterAlt size={20} className="text-white" />
      </div>
      <div>
        <h3 className="text-base font-bold admin-text-primary">Funnel Analytics</h3>
        <p className="text-[11px] admin-text-secondary mt-0.5">
          Signup to enrollment to completion
        </p>
      </div>
    </div>

    <div className="space-y-3">
      {loading ? (
        <div className="h-32 rounded-xl animate-pulse bg-[var(--admin-surface-raised)]" />
      ) : data.map((stage, index) => {
        const widthPct = 100 - index * 14;
        return (
          <div key={stage.stage}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold admin-text-primary">{stage.stage}</span>
              <span className="admin-text-secondary tabular-nums">
                {stage.count.toLocaleString()} · {stage.pct}%
              </span>
            </div>
            <div
              className="h-10 rounded-xl flex items-center px-3 transition-all duration-300 mx-auto"
              style={{
                width: `${widthPct}%`,
                minWidth: '55%',
                background: `linear-gradient(90deg, ${stage.color}33 0%, ${stage.color}18 100%)`,
                border: `1px solid ${stage.color}55`,
                boxShadow: `0 4px 20px ${stage.color}22`,
              }}
            >
              <div
                className="h-1.5 rounded-full flex-1 max-w-[120px]"
                style={{ background: stage.color, width: `${stage.pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  </motion.section>
);

export default FunnelAnalytics;
