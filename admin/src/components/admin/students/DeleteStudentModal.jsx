import React from 'react';
import { motion } from 'framer-motion';
import { MdWarningAmber, MdDeleteForever } from 'react-icons/md';
import { useFocusTrap } from '../../../hooks/useFocusTrap';

const DeleteStudentModal = ({ student, onClose, onConfirm }) => {
  const panelRef = useFocusTrap(Boolean(student), onClose);

  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div 
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        role="alertdialog"
        aria-modal="true"
        aria-label="Delete Student?"
        tabIndex={-1}
        className="relative w-full max-w-sm glass-card border border-red-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)] bg-[#0f141e]/90 text-center"
      >
        <div className="p-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"></div>
            <MdWarningAmber size={48} className="text-red-500 relative z-10" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Delete Student?</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Are you sure you want to permanently delete <span className="text-white font-semibold">"{student.name}"</span>? 
            This action cannot be undone and will remove all their course progress and data.
          </p>

          <div className="flex flex-col gap-3">
            <button 
              onClick={onConfirm}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all transform hover:-translate-y-0.5"
            >
              <MdDeleteForever size={20} /> Yes, Delete
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
            >
              Cancel, Keep Student
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteStudentModal;
