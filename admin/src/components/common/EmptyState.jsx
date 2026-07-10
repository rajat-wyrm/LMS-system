import React from 'react';
import { motion } from 'framer-motion';
import { MdInbox } from 'react-icons/md';

const EmptyState = ({
  icon: Icon = MdInbox,
  title = 'Nothing Here Yet',
  description = 'There\u2019s no data to show right now.',
  buttonText,
  onButtonClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative z-10 flex flex-col items-center justify-center py-20 px-6 rounded-3xl text-center border"
      style={{
        background: 'var(--admin-surface)',
        borderColor: 'var(--admin-border)',
      }}
    >
      <div
        className="flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
        style={{ background: 'var(--admin-surface-raised)' }}
      >
        <Icon size={32} className="admin-text-muted" />
      </div>

      <h3 className="text-xl font-bold admin-text-primary mb-2">{title}</h3>
      <p className="admin-text-secondary text-sm mb-6 max-w-sm">{description}</p>

      {buttonText && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onButtonClick}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white border border-white/10"
          style={{
            background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
          }}
        >
          {buttonText}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;