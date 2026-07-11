import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdSend, MdEmail, MdSms, MdNotificationsActive } from 'react-icons/md';
import { useFocusTrap } from '../../../hooks/useFocusTrap';

const NotificationModal = ({ student, onClose }) => {
  const [method, setMethod] = useState('in-app');
  const [type, setType] = useState('course-reminder');
  const [message, setMessage] = useState('');
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
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div 
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        role="dialog"
        aria-modal="true"
        aria-label="Send Notification"
        tabIndex={-1}
        className="relative w-full max-w-lg glass-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl bg-[#0f141e]/90"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-5 flex justify-between items-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
           <div>
             <h2 className="text-xl font-bold text-white relative z-10 flex items-center gap-2">
               <MdNotificationsActive /> Send Notification
             </h2>
             <p className="text-blue-100 text-sm mt-1 relative z-10">To: <span className="font-semibold text-white">{student.name}</span></p>
           </div>
           <button 
             onClick={onClose}
             className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors relative z-10"
           >
             <MdClose size={18} />
           </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          
          {/* Methods */}
          <div className="flex gap-2">
            {[
              { id: 'in-app', icon: <MdNotificationsActive size={16} />, label: 'In-App' },
              { id: 'email', icon: <MdEmail size={16} />, label: 'Email' },
              { id: 'sms', icon: <MdSms size={16} />, label: 'SMS' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                  method === m.id 
                    ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-blue-400' 
                    : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
                }`}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
             <div className="space-y-1">
               <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Template</label>
               <select 
                 value={type} onChange={(e) => setType(e.target.value)}
                 className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
               >
                 <option value="course-reminder" className="bg-[#111827]">📚 Course Reminder</option>
                 <option value="low-progress" className="bg-[#111827]">⚠️ Low Progress Warning</option>
                 <option value="congratulations" className="bg-[#111827]">🎉 Congratulations</option>
               </select>
             </div>

             <div className="space-y-1">
               <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Message</label>
               <textarea 
                 rows={4}
                 value={message}
                 onChange={(e) => setMessage(e.target.value)}
                 className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all custom-scrollbar resize-none"
                 placeholder="Type your message here..."
               />
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button 
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-gray-300 hover:bg-white/5 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:-translate-y-0.5 text-sm"
            >
              <MdSend size={16} /> Send Now
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotificationModal;
