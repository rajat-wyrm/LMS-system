import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdMailOutline } from 'react-icons/md';
import { useFocusTrap } from '../../../hooks/useFocusTrap';

const InviteTeacherModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const panelRef = useFocusTrap(isOpen, onClose);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setEmail('');
      onClose();
    }, 1500);
  };

  const handleClose = () => {
    setEmail('');
    setSent(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            role="dialog"
            aria-modal="true"
            aria-label="Invite Teacher"
            tabIndex={-1}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[110] rounded-2xl border p-6 shadow-2xl"
            style={{
              background: 'var(--admin-surface-raised)',
              borderColor: 'var(--admin-border)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)' }}
                >
                  <MdMailOutline size={22} className="text-white" />
                </div>
                <h2 className="text-xl font-bold admin-text-primary">Invite Teacher</h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-full admin-text-secondary hover:bg-[var(--admin-surface-hover)]"
              >
                <MdClose size={22} />
              </button>
            </div>
            {sent ? (
              <p className="text-center py-8 text-[#10B981] font-semibold">
                Invitation sent to {email}
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm admin-text-secondary">
                  Send an invite link to onboard a new mentor to your celebrity faculty roster.
                </p>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mentor@uptoskills.com"
                  className="w-full rounded-xl px-4 py-3 text-sm admin-text-primary border focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/50 bg-[var(--admin-surface)] border-[var(--admin-border)]"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}
                >
                  Send Invitation
                </button>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InviteTeacherModal;
