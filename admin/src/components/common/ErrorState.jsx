import React from 'react';
import { motion } from 'framer-motion';
import { MdErrorOutline, MdRefresh, MdOutlineMailOutline } from 'react-icons/md';

/**
 * Reusable error-state block — used across the admin dashboard whenever
 * a page fails to load data (API/network failure), so we never show a
 * blank page or generic error to the admin.
 *
 * Implements issue #37: "Create Reusable ErrorState Component for
 * Admin Dashboard".
 *
 * Props:
 *  - title:          heading shown (default: "Unable to Load")
 *  - description:    explanation of what went wrong
 *  - onRetry:        click handler for the Retry button
 *  - supportLink:    href for the Contact Support link
 *                    (defaults to mailto:support@uptoskills.com)
 */
const ErrorState = ({
  title = 'Unable to Load',
  description = 'Something went wrong while fetching this data. Please try again.',
  onRetry,
  supportLink = 'mailto:support@uptoskills.com',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative z-10 flex flex-col items-center justify-center py-20 px-6 rounded-3xl text-center border"
      style={{
        background: 'var(--admin-surface)',
        borderColor: 'rgba(239, 68, 68, 0.35)',
      }}
    >
      <div
        className="flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
        style={{ background: 'rgba(239, 68, 68, 0.12)' }}
      >
        <MdErrorOutline size={32} className="text-red-400" />
      </div>

      <h3 className="text-xl font-bold admin-text-primary mb-2">{title}</h3>
      <p className="admin-text-secondary text-sm mb-6 max-w-sm">{description}</p>

      <div className="flex items-center gap-3 flex-wrap justify-center">
        {onRetry && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white border border-white/10"
            style={{
              background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
            }}
          >
            <MdRefresh size={20} />
            Retry
          </motion.button>
        )}

        <a
          href={supportLink}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm border transition-colors"
          style={{
            borderColor: 'var(--admin-border)',
            color: 'var(--admin-text-secondary)',
          }}
        >
          <MdOutlineMailOutline size={18} />
          Contact Support
        </a>
      </div>
    </motion.div>
  );
};

export default ErrorState;