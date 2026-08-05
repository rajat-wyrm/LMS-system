import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdUploadFile, MdPerson, MdEmail, MdPhone, MdLock, MdSchool, MdCheckCircle, MdBlock, MdEvent } from 'react-icons/md';
import { useFocusTrap } from '../../../hooks/useFocusTrap';

const AddStudentModal = ({ onClose, onAdd, studentToEdit }) => {
  const panelRef = useFocusTrap(true, onClose);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    course: 'DSA with Java',
    plan: 'Pro Plan',
    status: 'Active',
    teacher: 'Salman Khan',
    joinedDate: new Date().toISOString().split('T')[0],
    avatar: null,
  });

  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        name: studentToEdit.name || '',
        email: studentToEdit.email || '',
        phone: studentToEdit.phone || '',
        password: '', // Keep empty unless updating
        course: studentToEdit.enrolledCourse || 'DSA with Java',
        plan: studentToEdit.plan || 'Pro Plan',
        status: studentToEdit.status || 'Active',
        teacher: studentToEdit.mentorName || 'Salman Khan',
        joinedDate: studentToEdit.joinedDate || new Date().toISOString().split('T')[0],
        avatar: studentToEdit.avatar || null,
      });
      setAvatarPreview(studentToEdit.avatar || null);
    }
  }, [studentToEdit]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...formData,
      enrolledCourse: formData.course,
      mentorName: formData.teacher,
      progress: studentToEdit ? studentToEdit.progress : 0,
      joinedDate: formData.joinedDate,
      lastActive: studentToEdit ? studentToEdit.lastActive : 'Just now',
      xp: studentToEdit ? studentToEdit.xp : 0,
      avatar: formData.avatar,
    });
  };

  const isEditMode = !!studentToEdit;

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

      {/* Modal Container */}
      <motion.div 
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        role="dialog"
        aria-modal="true"
        aria-label={isEditMode ? 'Edit Student' : 'Add New Student'}
        tabIndex={-1}
        className="relative w-full max-w-[900px] border border-white/10 rounded-[24px] overflow-hidden bg-gradient-to-b from-[#0B1020] to-[#050814] shadow-[0_20px_60px_rgba(0,0,0,0.6),_0_0_40px_rgba(124,58,237,0.15)] flex flex-col max-h-[95vh]"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#A855F7] px-8 py-8 flex justify-between items-center relative overflow-hidden flex-shrink-0">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
           <div>
             <h2 className="text-[40px] font-bold text-white relative z-10 leading-none mb-2 tracking-tight">
               {isEditMode ? 'Edit Student' : 'Add New Student'}
             </h2>
             <p className="text-gray-200 text-base relative z-10">
               {isEditMode ? 'Update this learner\'s information on the platform.' : 'Enroll a new learner into the UpToSkills platform.'}
             </p>
           </div>
           <button 
             onClick={onClose}
             className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all relative z-10 backdrop-blur-sm shadow-lg hover:rotate-90 duration-300"
           >
             <MdClose size={24} />
           </button>
        </div>

        {/* Form Body - scrollable */}
        <div className="p-8 overflow-y-auto custom-scrollbar relative">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#7C3AED]/5 rounded-full blur-[100px] pointer-events-none"></div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left: Avatar Upload */}
              <div className="flex-shrink-0 flex flex-col items-center gap-3">
                <div className="w-40 h-40 rounded-[24px] border-2 border-dashed border-white/20 bg-white/5 backdrop-blur-[12px] flex flex-col items-center justify-center text-gray-400 hover:border-[#8B5CF6] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:text-[#8B5CF6] transition-all duration-250 cursor-pointer group relative overflow-hidden has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[#FF6B35] has-[:focus-visible]:outline-offset-2">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <MdUploadFile size={40} className="group-hover:-translate-y-1 transition-transform duration-250 mb-2" />
                      <span className="text-sm font-semibold tracking-wide text-white/70">Upload Photo</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </div>
              </div>

              {/* Right: Form Fields Grid */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                 
                 <div className="space-y-2">
                   <label className="text-xs font-semibold text-white/70 uppercase tracking-[1px] block">Full Name</label>
                   <div className="relative group">
                     <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8B5CF6] transition-colors duration-250" size={20} />
                     <input 
                       type="text" required
                       value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                       className="w-full h-14 bg-white/5 backdrop-blur-[12px] border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder-white/45 focus:outline-none focus:border-[#8B5CF6] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.15)] transition-all duration-250"
                       placeholder="e.g. John Doe"
                     />
                   </div>
                 </div>
                 
                 <div className="space-y-2">
                   <label className="text-xs font-semibold text-white/70 uppercase tracking-[1px] block">Email Address</label>
                   <div className="relative group">
                     <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8B5CF6] transition-colors duration-250" size={20} />
                     <input 
                       type="email" required
                       value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                       className="w-full h-14 bg-white/5 backdrop-blur-[12px] border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder-white/45 focus:outline-none focus:border-[#8B5CF6] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.15)] transition-all duration-250"
                       placeholder="john@example.com"
                     />
                   </div>
                 </div>
                 
                 <div className="space-y-2">
                   <label className="text-xs font-semibold text-white/70 uppercase tracking-[1px] block">Phone Number</label>
                   <div className="relative group">
                     <MdPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8B5CF6] transition-colors duration-250" size={20} />
                     <input 
                       type="tel"
                       value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                       className="w-full h-14 bg-white/5 backdrop-blur-[12px] border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder-white/45 focus:outline-none focus:border-[#8B5CF6] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.15)] transition-all duration-250"
                       placeholder="+91 98765 43210"
                     />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-xs font-semibold text-white/70 uppercase tracking-[1px] block">Password</label>
                   <div className="relative group">
                     <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8B5CF6] transition-colors duration-250" size={20} />
                     <input 
                       type="password" required={!isEditMode}
                       value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                       className="w-full h-14 bg-white/5 backdrop-blur-[12px] border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder-white/45 focus:outline-none focus:border-[#8B5CF6] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.15)] transition-all duration-250"
                       placeholder={isEditMode ? '•••••••• (unchanged)' : '••••••••'}
                     />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-xs font-semibold text-white/70 uppercase tracking-[1px] block">Plan</label>
                   <select 
                     value={formData.plan} onChange={(e) => setFormData({...formData, plan: e.target.value})}
                     className="w-full h-14 bg-[#111827] backdrop-blur-[12px] border border-white/10 rounded-2xl px-4 text-white focus:outline-none focus:border-[#8B5CF6] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.15)] transition-all duration-250 appearance-none cursor-pointer"
                   >
                     <option value="Basic Plan">Basic Plan</option>
                     <option value="Pro Plan">Pro Plan</option>
                     <option value="Premium Plan">Premium Plan</option>
                   </select>
                 </div>

                 <div className="space-y-2">
                   <label className="text-xs font-semibold text-white/70 uppercase tracking-[1px] block">Status</label>
                   <select 
                     value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                     className="w-full h-14 bg-[#111827] backdrop-blur-[12px] border border-white/10 rounded-2xl px-4 text-white focus:outline-none focus:border-[#8B5CF6] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.15)] transition-all duration-250 appearance-none cursor-pointer"
                   >
                     <option value="Active">Active</option>
                     <option value="Inactive">Inactive</option>
                     <option value="Suspended">Suspended</option>
                   </select>
                 </div>

                 <div className="space-y-2">
                   <label className="text-xs font-semibold text-white/70 uppercase tracking-[1px] flex items-center gap-2">
                      <MdSchool size={16}/> Course Enrolled
                   </label>
                   <select 
                     value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})}
                     className="w-full h-14 bg-[#111827] backdrop-blur-[12px] border border-white/10 rounded-2xl px-4 text-white focus:outline-none focus:border-[#8B5CF6] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.15)] transition-all duration-250 appearance-none cursor-pointer"
                   >
                     <option value="DSA with Java">DSA with Java</option>
                     <option value="Python">Python</option>
                     <option value="C++">C++</option>
                     <option value="HTML">HTML</option>
                     <option value="CSS">CSS</option>
                     <option value="JavaScript">JavaScript</option>
                     <option value="MERN">MERN</option>
                     <option value="ReactJS">ReactJS</option>
                   </select>
                 </div>

                 <div className="space-y-2">
                   <label className="text-xs font-semibold text-white/70 uppercase tracking-[1px] flex items-center gap-2">
                      <MdPerson size={16}/> Assigned Teacher
                   </label>
                   <select 
                     value={formData.teacher} onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                     className="w-full h-14 bg-[#111827] backdrop-blur-[12px] border border-white/10 rounded-2xl px-4 text-white focus:outline-none focus:border-[#8B5CF6] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.15)] transition-all duration-250 appearance-none cursor-pointer"
                   >
                     <option value="Salman Khan">Salman Khan</option>
                     <option value="Anushka Sharma">Anushka Sharma</option>
                     <option value="Katrina Kaif">Katrina Kaif</option>
                     <option value="Shahrukh Khan">Shahrukh Khan</option>
                     <option value="Hrithik Roshan">Hrithik Roshan</option>
                     <option value="Virat Kohli">Virat Kohli</option>
                     <option value="Sachin Tendulkar">Sachin Tendulkar</option>
                     <option value="MS Dhoni">MS Dhoni</option>
                     <option value="Smriti Mandhana">Smriti Mandhana</option>
                     <option value="Narendra Modi">Narendra Modi</option>
                     <option value="Deepika Padukone">Deepika Padukone</option>
                     <option value="Ranbir Kapoor">Ranbir Kapoor</option>
                     <option value="Alia Bhatt">Alia Bhatt</option>
                     <option value="Aamir Khan">Aamir Khan</option>
                   </select>
                 </div>
              </div>
            </div>

            {/* Bottom Full Width: Date */}
            <div className="space-y-2 mt-2 pt-6 border-t border-white/10">
              <label className="text-xs font-semibold text-white/70 uppercase tracking-[1px] flex items-center gap-2">
                 <MdEvent size={16}/> Joining Date
              </label>
              <input 
                type="date"
                value={formData.joinedDate} onChange={(e) => setFormData({...formData, joinedDate: e.target.value})}
                className="w-full h-14 bg-[#111827] backdrop-blur-[12px] border border-white/10 rounded-2xl px-4 text-white focus:outline-none focus:border-[#8B5CF6] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.15)] transition-all duration-250 cursor-pointer [color-scheme:dark]"
              />
            </div>

            <div className="flex justify-end gap-4 pt-6 mt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="px-8 h-14 rounded-2xl text-gray-300 bg-transparent hover:bg-white/5 hover:text-white transition-all duration-250 font-bold tracking-wide"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-10 h-14 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white font-bold tracking-wide hover:shadow-[0_10px_30px_rgba(139,92,246,0.4)] transition-all duration-300 transform hover:-translate-y-0.5"
              >
                {isEditMode ? 'Save Changes' : 'Add Student'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AddStudentModal;
