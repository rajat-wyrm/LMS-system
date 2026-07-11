import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdClose, MdUploadFile, MdPerson, MdEmail, MdPhone,
  MdLock, MdSchool, MdCheckCircle, MdCancel, MdEvent,
  MdStar
} from 'react-icons/md';
import { useFocusTrap } from '../../../hooks/useFocusTrap';

const COURSES = [
  'DSA with Java', 'Python', 'C++', 'HTML', 'CSS',
  'JavaScript', 'MERN', 'ReactJS',
];

const TEACHERS = [
  'Salman Khan', 'Anushka Sharma', 'Katrina Kaif', 'Shahrukh Khan',
  'Hrithik Roshan', 'Virat Kohli', 'Sachin Tendulkar', 'MS Dhoni',
  'Smriti Mandhana', 'Narendra Modi', 'Deepika Padukone',
  'Ranbir Kapoor', 'Alia Bhatt', 'Aamir Khan',
];

const PLANS = ['Basic Plan', 'Pro Plan', 'Premium Plan'];

const defaultForm = {
  name: '', email: '', phone: '', password: '',
  course: 'DSA with Java', plan: 'Pro Plan',
  status: 'Active', teacher: 'Salman Khan',
  joinedDate: new Date().toISOString().split('T')[0],
  avatar: null,
};

const AddStudentDrawer = ({ isOpen, onClose, onAdd, studentToEdit }) => {
  const [form, setForm]             = useState(defaultForm);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const isEdit = !!studentToEdit;
  const panelRef = useFocusTrap(isOpen, onClose);

  /* Pre-fill when editing */
  useEffect(() => {
    if (studentToEdit) {
      setForm({
        name:       studentToEdit.name        || '',
        email:      studentToEdit.email       || '',
        phone:      studentToEdit.phone       || '',
        password:   '',
        course:     studentToEdit.enrolledCourse || 'DSA with Java',
        plan:       studentToEdit.plan        || 'Pro Plan',
        status:     studentToEdit.status      || 'Active',
        teacher:    studentToEdit.mentorName  || 'Salman Khan',
        joinedDate: studentToEdit.joinedDate  || defaultForm.joinedDate,
        avatar:     studentToEdit.avatar      || null,
      });
      setAvatarPreview(studentToEdit.avatar || null);
    } else {
      setForm(defaultForm);
      setAvatarPreview(null);
    }
  }, [studentToEdit, isOpen]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setForm(f => ({ ...f, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...form,
      enrolledCourse: form.course,
      mentorName:     form.teacher,
      progress:       studentToEdit ? studentToEdit.progress : 0,
      lastActive:     studentToEdit ? studentToEdit.lastActive : 'Just now',
      xp:             studentToEdit ? studentToEdit.xp        : 0,
    });
    onClose();
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  /* ── Input style helper ── */
  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:bg-white/8 transition-all';
  const selectCls = 'w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-all cursor-pointer appearance-none';
  const labelCls  = 'text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            ref={panelRef}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 200 }}
            role="dialog"
            aria-modal="true"
            aria-label={isEdit ? 'Edit Student' : 'Add New Student'}
            tabIndex={-1}
            className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-[#0B1120] border-l border-white/10 z-[110] shadow-[-24px_0_60px_rgba(0,0,0,0.6)] flex flex-col"
          >
            {/* ── Drawer Header ── */}
            <div className="relative bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#A855F7] px-8 py-7 flex-shrink-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {isEdit ? 'Edit Student' : 'Add New Student'}
                </h2>
                <p className="text-purple-200 text-sm">
                  {isEdit
                    ? "Update this learner's information."
                    : 'Enroll a new learner into the platform.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all hover:rotate-90 duration-300 z-10"
              >
                <MdClose size={22} />
              </button>
            </div>

            {/* ── Scrollable Form Body ── */}
            <div className="flex-1 overflow-y-auto px-8 py-7 space-y-6 custom-scrollbar">

              {/* Avatar Upload */}
              <div className="flex justify-center">
                <label className="relative w-28 h-28 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center text-gray-500 hover:text-purple-400 hover:border-purple-500 hover:bg-purple-500/10 transition-all cursor-pointer group overflow-hidden has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[#FF6B35] has-[:focus-visible]:outline-offset-2">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <MdUploadFile size={32} className="mb-1 group-hover:-translate-y-1 transition-transform" />
                      <span className="text-xs font-medium">Upload Photo</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </label>
              </div>

              {/* Full Name */}
              <div>
                <label className={labelCls}>Full Name</label>
                <div className="relative">
                  <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="text" required value={form.name} onChange={set('name')} placeholder="e.g. Rahul Kumar" className={`${inputCls} pl-10`} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={labelCls}>Email Address</label>
                <div className="relative">
                  <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="email" required value={form.email} onChange={set('email')} placeholder="rahul@example.com" className={`${inputCls} pl-10`} />
                </div>
              </div>

              {/* Phone + Password side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Phone</label>
                  <div className="relative">
                    <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 XXXXX XXXXX" className={`${inputCls} pl-10`} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Password</label>
                  <div className="relative">
                    <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="password" required={!isEdit}
                      value={form.password} onChange={set('password')}
                      placeholder={isEdit ? '(unchanged)' : '••••••••'}
                      className={`${inputCls} pl-10`}
                    />
                  </div>
                </div>
              </div>

              {/* Course + Teacher side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`${labelCls} flex items-center gap-1`}><MdSchool size={13} /> Course</label>
                  <select value={form.course} onChange={set('course')} className={selectCls}>
                    {COURSES.map(c => <option key={c} value={c} className="bg-[#0f172a]">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`${labelCls} flex items-center gap-1`}><MdPerson size={13} /> Teacher</label>
                  <select value={form.teacher} onChange={set('teacher')} className={selectCls}>
                    {TEACHERS.map(t => <option key={t} value={t} className="bg-[#0f172a]">{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Plan */}
              <div>
                <label className={`${labelCls} flex items-center gap-1`}><MdStar size={13} /> Plan</label>
                <select value={form.plan} onChange={set('plan')} className={selectCls}>
                  {PLANS.map(p => <option key={p} value={p} className="bg-[#0f172a]">{p}</option>)}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className={labelCls}>Status</label>
                <div className="flex gap-3">
                  {['Active', 'Inactive', 'Suspended'].map(s => {
                    const colors = {
                      Active:    { on: 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300',    off: 'border-white/10 bg-white/5 text-gray-500 hover:border-emerald-500/30 hover:text-emerald-400' },
                      Inactive:  { on: 'border-red-500/60 bg-red-500/20 text-red-300',                off: 'border-white/10 bg-white/5 text-gray-500 hover:border-red-500/30 hover:text-red-400' },
                      Suspended: { on: 'border-amber-500/60 bg-amber-500/20 text-amber-300',          off: 'border-white/10 bg-white/5 text-gray-500 hover:border-amber-500/30 hover:text-amber-400' },
                    };
                    return (
                      <button
                        key={s} type="button"
                        onClick={() => setForm(f => ({ ...f, status: s }))}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          form.status === s ? colors[s].on : colors[s].off
                        }`}
                      >
                        {s === 'Active' ? <MdCheckCircle size={14} /> : <MdCancel size={14} />}
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Joining Date */}
              <div>
                <label className={`${labelCls} flex items-center gap-1`}><MdEvent size={13} /> Joining Date</label>
                <input
                  type="date" value={form.joinedDate} onChange={set('joinedDate')}
                  className={`${inputCls} [color-scheme:dark]`}
                />
              </div>

            </div>

            {/* ── Footer Actions ── */}
            <div className="flex-shrink-0 px-8 py-5 border-t border-white/10 flex gap-4 bg-[#0B1120]">
              <button
                type="button" onClick={onClose}
                className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-semibold transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-bold text-sm hover:shadow-[0_0_24px_rgba(139,92,246,0.5)] transition-all hover:-translate-y-0.5 active:scale-95"
              >
                {isEdit ? 'Save Changes' : 'Add Student'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddStudentDrawer;
