import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdEmail, MdPhone, MdDateRange, MdStar, MdSchool, MdHistory, MdPlayCircleOutline, MdAssignmentTurnedIn, MdWorkspacePremium, MdAccessTime, MdCheckCircle, MdPerson } from 'react-icons/md';
import { useFocusTrap } from '../../../hooks/useFocusTrap';

const StudentProfileDrawer = ({ isOpen, onClose, student }) => {
  const panelRef = useFocusTrap(Boolean(isOpen && student), onClose);

  if (!student) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${student.name} profile`}
            tabIndex={-1}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#0a0f18] border-l border-white/10 z-50 shadow-2xl overflow-y-auto custom-scrollbar"
          >
            {/* Header / Profile Cover — NO overflow-hidden so avatar is never clipped */}
            <div className="relative">
              {/* Banner */}
              <div className="h-48 bg-gradient-to-br from-indigo-900 to-[#1e103c] relative">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
                >
                  <MdClose size={24} />
                </button>
              </div>

              {/* Avatar — sits OUTSIDE banner so it is never clipped */}
              <div className="absolute left-8 -bottom-14 z-20">
                <div className="relative">
                  {/* Glow ring */}
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 p-[3px] shadow-[0_0_30px_rgba(124,58,237,0.6)]">
                    <div className="w-full h-full rounded-[14px] bg-[#111827] flex items-center justify-center overflow-hidden">
                      {student.avatar ? (
                        <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl font-extrabold text-white select-none">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Level Badge */}
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border-2 border-[#0f141e] shadow-lg flex items-center gap-1">
                    <MdStar size={10} /> Lvl 12
                  </div>
                </div>
              </div>
            </div>

            {/* Content Body — extra top padding to clear the overlapping avatar */}
            <div className="pt-20 px-8 pb-8 space-y-8">
              
              {/* Basic Info */}
              <div>
                <h2 className="text-2xl font-bold text-white">{student.name}</h2>
                <div className="flex items-center gap-2 mt-1 mb-4">
                   <span className="text-sm text-cyan-400 font-medium bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">{student.plan}</span>
                   <span className={`text-sm font-medium px-2 py-0.5 rounded border ${student.status === 'Active' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                     {student.status}
                   </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-400 text-sm bg-white/5 p-2 rounded-lg border border-white/5">
                    <MdEmail size={18} className="text-gray-500" />
                    <span className="truncate">{student.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 text-sm bg-white/5 p-2 rounded-lg border border-white/5">
                    <MdPhone size={18} className="text-gray-500" />
                    <span className="truncate">{student.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 text-sm bg-white/5 p-2 rounded-lg border border-white/5">
                    <MdDateRange size={18} className="text-gray-500" />
                    <span className="truncate">Joined: {student.joinedDate}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 text-sm bg-white/5 p-2 rounded-lg border border-white/5">
                    <MdAccessTime size={18} className="text-gray-500" />
                    <span className="truncate">Active: {student.lastActive}</span>
                  </div>
                </div>
              </div>

              {/* Learning Analytics Widgets */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
                  <MdHistory size={18} className="text-blue-400" /> Learning Analytics
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="glass-card rounded-xl p-4 border border-white/10 bg-gradient-to-br from-indigo-500/10 to-transparent">
                     <p className="text-xs text-indigo-300 font-semibold mb-1">Overall Progress</p>
                     <p className="text-2xl font-bold text-white">{student.progress}%</p>
                   </div>
                   <div className="glass-card rounded-xl p-4 border border-white/10 bg-gradient-to-br from-emerald-500/10 to-transparent">
                     <p className="text-xs text-emerald-300 font-semibold mb-1">Attendance</p>
                     <p className="text-2xl font-bold text-white">94%</p>
                   </div>
                   <div className="glass-card rounded-xl p-4 border border-white/10 bg-gradient-to-br from-purple-500/10 to-transparent">
                     <p className="text-xs text-purple-300 font-semibold mb-1">Completed Lessons</p>
                     <p className="text-2xl font-bold text-white">28<span className="text-sm text-gray-500"> / 40</span></p>
                   </div>
                   <div className="glass-card rounded-xl p-4 border border-white/10 bg-gradient-to-br from-amber-500/10 to-transparent">
                     <p className="text-xs text-amber-300 font-semibold mb-1">Avg Quiz Score</p>
                     <p className="text-2xl font-bold text-white">88%</p>
                   </div>
                </div>
              </div>

              {/* Course Cards Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
                  <MdSchool size={18} className="text-purple-400" /> Enrolled Courses
                </h3>
                
                <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-purple-500/30 to-blue-500/30 overflow-hidden group">
                  <div className="bg-[#121826] rounded-2xl p-5 relative overflow-hidden z-10">
                     {/* Background glow in card */}
                     <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
                     
                     <div className="flex gap-4 relative z-10">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                          <MdSchool size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-bold text-base group-hover:text-purple-400 transition-colors">{student.enrolledCourse}</h4>
                          <div className="flex items-center gap-2 mt-1 mb-3">
                             <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                               <MdPerson size={10} className="text-cyan-400" />
                             </div>
                             <span className="text-xs text-gray-400">Mentor: <span className="text-gray-300 font-medium">{student.mentorName}</span></span>
                          </div>
                          
                          <div className="flex justify-between items-end mb-1">
                            <span className="text-xs text-gray-500">Lesson 28 of 40</span>
                            <span className="text-xs font-bold text-white">{student.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${student.progress}%` }}
                              transition={{ duration: 1, delay: 0.2 }}
                              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" 
                            />
                          </div>
                        </div>
                     </div>
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
                  <MdHistory size={18} className="text-emerald-400" /> Recent Activity
                </h3>
                
                <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500/30 before:via-blue-500/30 before:to-transparent">
                  
                  <div className="relative">
                    <div className="absolute -left-8 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center ring-4 ring-[#0a0f18] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    <div className="glass-card rounded-xl p-3 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                       <div className="flex items-center gap-2 text-white text-sm font-medium">
                         <MdPlayCircleOutline className="text-emerald-400" size={16} /> Completed Lesson 28: Typography Systems
                       </div>
                       <p className="text-xs text-gray-500 mt-1 pl-6">Today, 2 hours ago</p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-8 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center ring-4 ring-[#0a0f18] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    <div className="glass-card rounded-xl p-3 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                       <div className="flex items-center gap-2 text-white text-sm font-medium">
                         <MdAssignmentTurnedIn className="text-blue-400" size={16} /> Submitted Final Wireframes
                       </div>
                       <p className="text-xs text-gray-500 mt-1 pl-6">Yesterday, 4:30 PM • Graded: 92%</p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-8 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center ring-4 ring-[#0a0f18] shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                    <div className="glass-card rounded-xl p-3 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                       <div className="flex items-center gap-2 text-white text-sm font-medium">
                         <MdWorkspacePremium className="text-amber-400" size={16} /> Earned UX Principles Badge
                       </div>
                       <p className="text-xs text-gray-500 mt-1 pl-6">May 20, 2026</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StudentProfileDrawer;
