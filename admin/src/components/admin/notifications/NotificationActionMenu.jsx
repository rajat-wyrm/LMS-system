import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdMoreVert, MdMarkEmailRead, MdDelete } from 'react-icons/md';

function NotificationActionMenu({ notif, onMarkRead, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const run = (fn) => (e) => {
    e.stopPropagation();
    setOpen(false);
    fn?.(notif.id);
  };

  return (
    <div ref={ref} className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        title="More actions"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors border admin-text-muted hover:admin-text-primary"
        style={{
          background: open ? 'var(--admin-surface-hover)' : 'transparent',
          borderColor: 'var(--admin-border)',
        }}
      >
        <MdMoreVert size={18} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-40 rounded-2xl shadow-2xl z-20 overflow-hidden border"
            style={{
              background: 'var(--admin-surface-raised)',
              borderColor: 'var(--admin-border)',
            }}
          >
            {!notif.read && (
              <button
                type="button"
                onClick={run(onMarkRead)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm admin-text-primary hover:bg-[var(--admin-surface-hover)] transition-colors"
              >
                <MdMarkEmailRead size={16} className="text-[#14B8A6]" />
                Mark as Read
              </button>
            )}
            <button
              type="button"
              onClick={run(onDelete)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <MdDelete size={16} />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationActionMenu;
