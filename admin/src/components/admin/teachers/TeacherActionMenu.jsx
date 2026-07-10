import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdMoreVert, MdVisibility, MdEdit, MdDelete } from 'react-icons/md';

const TeacherActionMenu = forwardRef(function TeacherActionMenu(
  { teacher, onView, onEdit, onDelete },
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
              onClick={() => {
                setOpen(false);
                onView(teacher);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm admin-text-primary hover:bg-[var(--admin-surface-hover)] transition-colors"
            >
              <MdVisibility size={16} className="text-[#06B6D4]" />
              View Profile
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit(teacher);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm admin-text-primary hover:bg-[var(--admin-surface-hover)] transition-colors"
            >
              <MdEdit size={16} className="text-[#8B5CF6]" />
              Edit Teacher
            </button>
            <div className="h-px mx-3" style={{ background: 'var(--admin-border-subtle)' }} />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onDelete(teacher.id);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <MdDelete size={16} />
              Delete Teacher
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default TeacherActionMenu;
