import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdMoreVert,
  MdEdit,
  MdContentCopy,
  MdBarChart,
  MdVisibility,
  MdDelete,
} from 'react-icons/md';

const CourseActionMenu = forwardRef(function CourseActionMenu(
  { course, onEdit, onClone, onAnalytics, onPreview, onDelete },
  ref
) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const firstItemRef = useRef(null);
  const triggerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    openMenu: () => setOpen(true),
  }));

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      firstItemRef.current?.focus();
    }
  }, [open]);

  const handleMenuKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const run = (fn) => (e) => {
    e.stopPropagation();
    setOpen(false);
    fn?.(course);
  };

  return (
    <div ref={containerRef} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        ref={triggerRef}
        type="button"
        tabIndex={-1}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors border"
        style={{
          background: 'var(--admin-surface-hover)',
          borderColor: 'var(--admin-border)',
          color: 'var(--admin-text-primary)',
        }}
      >
        <MdMoreVert size={20} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -6 }}
            transition={{ duration: 0.15 }}
            onKeyDown={handleMenuKeyDown}
            className="absolute right-0 top-full mt-2 w-44 rounded-2xl shadow-2xl z-50 overflow-hidden border"
            style={{
              background: 'var(--admin-surface-raised)',
              borderColor: 'var(--admin-border)',
            }}
          >
            <button
              ref={firstItemRef}
              type="button"
              onClick={run(onEdit)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm admin-text-primary hover:bg-[var(--admin-surface-hover)] transition-colors"
            >
              <MdEdit size={16} className="text-[#3B82F6]" />
              Edit
            </button>
            <button
              type="button"
              onClick={run(onClone)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm admin-text-primary hover:bg-[var(--admin-surface-hover)] transition-colors"
            >
              <MdContentCopy size={16} className="text-[#8B5CF6]" />
              Clone
            </button>
            <button
              type="button"
              onClick={run(onAnalytics)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm admin-text-primary hover:bg-[var(--admin-surface-hover)] transition-colors"
            >
              <MdBarChart size={16} className="text-[#06B6D4]" />
              Analytics
            </button>
            <button
              type="button"
              onClick={run(onPreview)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm admin-text-primary hover:bg-[var(--admin-surface-hover)] transition-colors"
            >
              <MdVisibility size={16} className="text-[#10B981]" />
              Preview
            </button>
            <div className="h-px mx-3" style={{ background: 'var(--admin-border-subtle)' }} />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onDelete(course.id);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <MdDelete size={16} />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default CourseActionMenu;
