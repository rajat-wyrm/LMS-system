import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdClose, MdUploadFile, MdBook, MdTitle, MdDescription,
  MdLayers, MdCategory, MdTimer, MdLanguage, MdPerson,
  MdAttachMoney, MdLocalOffer, MdSchool, MdAssignment,
  MdCheckCircle, MdOutlineFiberManualRecord, MdSearch
} from 'react-icons/md';
import { useFocusTrap } from '../../../hooks/useFocusTrap';

// Category Options
const CATEGORIES = [
  'DSA',
  'Web Development',
  'Mobile Development',
  'AI/ML',
  'DevOps',
  'Programming Languages'
];

// Level Options
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

// Static fallback teachers in case local storage is not populated
const DEFAULT_TEACHERS = [
  { id: 1, name: 'Salman Khan' },
  { id: 2, name: 'Virat Kohli' },
  { id: 3, name: 'Sachin Tendulkar' },
  { id: 4, name: 'Anushka Sharma' },
  { id: 5, name: 'Katrina Kaif' }
];

const CourseDrawer = ({ isOpen, onClose, onSave, courseToEdit }) => {
  const panelRef = useFocusTrap(isOpen, onClose);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    shortDesc: '',
    fullDesc: '',
    level: 'Beginner',
    category: 'Web Development',
    duration: '',
    language: 'English',
    status: 'Published', // Draft, Published, Archived
    teacher: '',
    price: '',
    discountPrice: '',
    lessons: '',
    projects: '',
    certificate: true,
    visibility: 'Public', // Public, Private
    featured: false,
    avatar: null
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [teachers, setTeachers] = useState(DEFAULT_TEACHERS);
  const [searchTeacherQuery, setSearchTeacherQuery] = useState('');
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);
  const teacherDropdownRef = useRef(null);

  // Load actual teachers from local storage if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lms_teachers_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTeachers(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load teachers for course dropdown:", e);
    }
  }, [isOpen]);

  // Set default teacher if not editing
  useEffect(() => {
    if (teachers.length > 0 && !courseToEdit && !form.teacher) {
      setForm(prev => ({ ...prev, teacher: teachers[0].name }));
    }
  }, [teachers, courseToEdit]);

  // Handle outside click to close searchable teacher dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (teacherDropdownRef.current && !teacherDropdownRef.current.contains(e.target)) {
        setIsTeacherDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Prepopulate if editing
  useEffect(() => {
    if (courseToEdit) {
      setForm({
        title: courseToEdit.title || '',
        slug: courseToEdit.slug || (courseToEdit.title ? courseToEdit.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''),
        shortDesc: courseToEdit.shortDesc || 'Learn advanced concepts and real-world techniques.',
        fullDesc: courseToEdit.fullDesc || 'Detailed curriculum covering all fundamentals and best practices.',
        level: courseToEdit.level || 'Beginner',
        category: courseToEdit.category || 'Web Development',
        duration: courseToEdit.hours || courseToEdit.duration || '30',
        language: courseToEdit.language || 'English',
        status: courseToEdit.status || (courseToEdit.active ? 'Published' : 'Draft'),
        teacher: courseToEdit.teacher || (courseToEdit.mentorName || 'Salman Khan'),
        price: courseToEdit.price || '499',
        discountPrice: courseToEdit.discountPrice || '299',
        lessons: courseToEdit.lessons || '15',
        projects: courseToEdit.projects || '3',
        certificate: courseToEdit.certificate !== undefined ? courseToEdit.certificate : true,
        visibility: courseToEdit.visibility || 'Public',
        featured: courseToEdit.featured !== undefined ? courseToEdit.featured : false,
        avatar: courseToEdit.avatar || null
      });
      setAvatarPreview(courseToEdit.avatar || null);
    } else {
      // Reset form
      setForm({
        title: '',
        slug: '',
        shortDesc: '',
        fullDesc: '',
        level: 'Beginner',
        category: 'Web Development',
        duration: '',
        language: 'English',
        status: 'Published',
        teacher: teachers[0]?.name || '',
        price: '',
        discountPrice: '',
        lessons: '',
        projects: '',
        certificate: true,
        visibility: 'Public',
        featured: false,
        avatar: null
      });
      setAvatarPreview(null);
    }
  }, [courseToEdit, isOpen, teachers]);

  // Handle ESC key close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-generate Slug from Title
  const handleTitleChange = (e) => {
    const titleVal = e.target.value;
    const generatedSlug = titleVal
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
      .replace(/\s+/g, '-'); // collapse spaces to hyphens

    setForm(prev => ({
      ...prev,
      title: titleVal,
      slug: generatedSlug
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setForm(prev => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (statusOverride) => {
    if (!form.title || !form.shortDesc) {
      alert("Please fill in all required fields marked with *");
      return;
    }

    const submissionStatus = statusOverride || form.status;

    // Create random or custom gradient if adding new
    const gradients = [
      'from-blue-600 via-blue-500 to-cyan-400',
      'from-amber-500 via-orange-500 to-red-500',
      'from-emerald-500 via-teal-500 to-green-400',
      'from-purple-600 via-violet-500 to-pink-500',
      'from-rose-500 via-pink-500 to-fuchsia-500',
      'from-slate-600 via-slate-500 to-gray-400',
      'from-cyan-500 via-sky-500 to-blue-500',
      'from-indigo-600 via-purple-600 to-blue-500'
    ];

    const categoryIcons = {
      'DSA': '🔢',
      'Web Development': '⚛️',
      'Mobile Development': '📱',
      'AI/ML': '🧠',
      'DevOps': '☁️',
      'Programming Languages': '💻'
    };

    const gradient = courseToEdit?.gradient || gradients[Math.floor(Math.random() * gradients.length)];
    const icon = courseToEdit?.icon || categoryIcons[form.category] || '📚';

    const savedCourse = {
      ...courseToEdit,
      id: courseToEdit ? courseToEdit.id : Date.now(),
      title: form.title,
      slug: form.slug,
      shortDesc: form.shortDesc,
      fullDesc: form.fullDesc,
      level: form.level,
      category: form.category,
      lessons: parseInt(form.lessons) || 12,
      projects: parseInt(form.projects) || 2,
      certificate: form.certificate,
      visibility: form.visibility,
      featured: form.featured,
      duration: form.duration || '30',
      hours: parseInt(form.duration) || 30,
      language: form.language,
      status: submissionStatus,
      active: submissionStatus === 'Published',
      teacher: form.teacher,
      price: form.price || '499',
      discountPrice: form.discountPrice || '299',
      gradient,
      icon,
      avatar: form.avatar,
      rating: courseToEdit?.rating || 4.8,
      students: courseToEdit?.students || 0,
      completion: courseToEdit?.completion || 0
    };

    onSave(savedCourse);
    onClose();
  };

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  // Filtered teachers list based on search
  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTeacherQuery.toLowerCase())
  );

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:bg-white/8 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300';
  const textareaCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:bg-white/8 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 h-28 resize-none';
  const labelCls = 'text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          />

          {/* Side Drawer */}
          <motion.div
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 200 }}
            role="dialog"
            aria-modal="true"
            aria-label={courseToEdit ? 'Edit Course Details' : 'Add New Course'}
            tabIndex={-1}
            className="fixed right-0 top-0 h-full w-full max-w-[520px] bg-[#070b16] border-l border-white/10 z-[110] shadow-[-24px_0_60px_rgba(0,0,0,0.7)] flex flex-col rounded-l-[32px] overflow-hidden"
          >
            {/* Ambient Background Glow Inside Drawer */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

            {/* ── STICKY HEADER ── */}
            <div className="relative bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90 backdrop-blur-md px-8 py-6 flex-shrink-0 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-md">
                  <MdBook size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight">
                    {courseToEdit ? 'Edit Course Details' : 'Add New Course'}
                  </h2>
                  <p className="text-blue-100 text-xs mt-0.5">
                    {courseToEdit ? 'Update and refine course syllabus' : 'Create and publish a new learning course'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-black/20 hover:bg-white/10 text-white flex items-center justify-center transition-all hover:rotate-90 duration-300 border border-white/10"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* ── SCROLLABLE FORM BODY ── */}
            <div className="flex-1 overflow-y-auto px-8 py-7 space-y-7 custom-scrollbar relative z-10">
              
              {/* Animation Group Wrapper */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05
                    }
                  }
                }}
                className="space-y-7"
              >
                
                {/* ── SECTION 1: COURSE THUMBNAIL ── */}
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                  <label className={labelCls}>Course Thumbnail</label>
                  <label className="relative w-full h-44 rounded-2xl border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 bg-purple-500/5 flex flex-col items-center justify-center text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-300 cursor-pointer group overflow-hidden shadow-lg shadow-purple-500/5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[#FF6B35] has-[:focus-visible]:outline-offset-2">
                    {avatarPreview ? (
                      <div className="w-full h-full relative">
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <MdUploadFile size={32} className="text-white" />
                          <span className="text-xs text-white ml-2 font-semibold">Change Image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center">
                        <MdUploadFile size={36} className="text-purple-400/80 mb-2 group-hover:-translate-y-1.5 transition-transform duration-300" />
                        <span className="text-sm font-bold text-white">Drag & drop or browse</span>
                        <span className="text-[11px] text-gray-500 mt-1">Supports PNG, JPG (Max 2MB)</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </label>
                </motion.div>

                {/* ── SECTION 2: BASIC INFORMATION ── */}
                <motion.div 
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  className="space-y-5"
                >
                  <h4 className="text-xs font-extrabold text-purple-400 uppercase tracking-widest border-b border-white/5 pb-2">
                    1. Basic Information
                  </h4>

                  {/* Course Name */}
                  <div>
                    <label className={labelCls}>Course Name *</label>
                    <div className="relative">
                      <MdTitle className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="text"
                        required
                        value={form.title}
                        onChange={handleTitleChange}
                        placeholder="e.g. Master Next.js and Server Actions"
                        className={`${inputCls} pl-11`}
                      />
                    </div>
                  </div>

                  {/* Course Slug */}
                  <div>
                    <label className={labelCls}>Course Slug (Auto-Generated)</label>
                    <div className="relative">
                      <MdAssignment className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="text"
                        readOnly
                        value={form.slug}
                        placeholder="e.g. master-nextjs-and-server-actions"
                        className="w-full bg-white/5 border border-white/5 text-gray-500 rounded-xl px-4 py-3 pl-11 text-sm focus:outline-none cursor-not-allowed select-none"
                      />
                    </div>
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className={labelCls}>Short Description *</label>
                    <div className="relative">
                      <MdDescription className="absolute left-3.5 top-5 text-gray-500" size={18} />
                      <textarea
                        required
                        value={form.shortDesc}
                        onChange={set('shortDesc')}
                        placeholder="Brief overview summarizing the syllabus and core learning target (max 150 chars)."
                        maxLength={150}
                        className={`${textareaCls} pl-11 pt-4 h-20`}
                      />
                    </div>
                  </div>

                  {/* Full Description */}
                  <div>
                    <label className={labelCls}>Full Description</label>
                    <textarea
                      value={form.fullDesc}
                      onChange={set('fullDesc')}
                      placeholder="Comprehensive curriculum breakdown, pre-requisites, outcomes, and deep explanation of lessons."
                      className={textareaCls}
                    />
                  </div>
                </motion.div>

                {/* ── SECTION 3: COURSE DETAILS ── */}
                <motion.div 
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  className="space-y-5"
                >
                  <h4 className="text-xs font-extrabold text-purple-400 uppercase tracking-widest border-b border-white/5 pb-2">
                    2. Course Details
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Level */}
                    <div>
                      <label className={labelCls}>Level *</label>
                      <div className="relative">
                        <MdLayers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <select
                          value={form.level}
                          onChange={set('level')}
                          className="w-full bg-[#111827] border border-white/10 rounded-xl py-3 pl-11 pr-10 text-sm text-white focus:outline-none focus:border-purple-500 focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b16] transition-all cursor-pointer appearance-none"
                        >
                          {LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                        </select>
                        <MdOutlineFiberManualRecord className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={10} />
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className={labelCls}>Category *</label>
                      <div className="relative">
                        <MdCategory className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <select
                          value={form.category}
                          onChange={set('category')}
                          className="w-full bg-[#111827] border border-white/10 rounded-xl py-3 pl-11 pr-10 text-sm text-white focus:outline-none focus:border-purple-500 focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b16] transition-all cursor-pointer appearance-none"
                        >
                          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <MdOutlineFiberManualRecord className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={10} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Duration */}
                    <div>
                      <label className={labelCls}>Duration (Hours)</label>
                      <div className="relative">
                        <MdTimer className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          type="number"
                          value={form.duration}
                          onChange={set('duration')}
                          placeholder="e.g. 32"
                          className={`${inputCls} pl-11`}
                        />
                      </div>
                    </div>

                    {/* Language */}
                    <div>
                      <label className={labelCls}>Language</label>
                      <div className="relative">
                        <MdLanguage className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          type="text"
                          value={form.language}
                          onChange={set('language')}
                          placeholder="e.g. English"
                          className={`${inputCls} pl-11`}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* ── SECTION 4: TEACHER ASSIGNMENT ── */}
                <motion.div 
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  className="space-y-4"
                >
                  <h4 className="text-xs font-extrabold text-purple-400 uppercase tracking-widest border-b border-white/5 pb-2">
                    3. Teacher Assignment
                  </h4>

                  {/* Searchable Dropdown */}
                  <div>
                    <label className={labelCls}>Select Celebrity Teacher</label>
                    <div ref={teacherDropdownRef} className="relative">
                      <div className="relative">
                        <MdPerson className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          type="text"
                          value={isTeacherDropdownOpen ? searchTeacherQuery : form.teacher}
                          onFocus={() => {
                            setSearchTeacherQuery('');
                            setIsTeacherDropdownOpen(true);
                          }}
                          onChange={(e) => {
                            setSearchTeacherQuery(e.target.value);
                            setIsTeacherDropdownOpen(true);
                          }}
                          placeholder="Search celebrity mentors..."
                          className={`${inputCls} pl-11 pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setIsTeacherDropdownOpen(!isTeacherDropdownOpen)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          <MdSearch size={18} />
                        </button>
                      </div>

                      {/* Dropdown Options */}
                      <AnimatePresence>
                        {isTeacherDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute z-50 left-0 right-0 mt-1 bg-[#101726] border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-48 overflow-y-auto custom-scrollbar"
                          >
                            {filteredTeachers.length > 0 ? (
                              filteredTeachers.map((t) => (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => {
                                    setForm(prev => ({ ...prev, teacher: t.name }));
                                    setIsTeacherDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-4 py-3 text-xs text-white hover:bg-purple-600/20 hover:text-purple-300 transition-all border-b border-white/5 flex items-center justify-between"
                                >
                                  <span>{t.name}</span>
                                  {form.teacher === t.name && <MdCheckCircle size={14} className="text-purple-400" />}
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-xs text-gray-500 text-center">
                                No mentors match "{searchTeacherQuery}"
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>

                {/* ── SECTION 5: PRICING ── */}
                <motion.div 
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  className="space-y-5"
                >
                  <h4 className="text-xs font-extrabold text-purple-400 uppercase tracking-widest border-b border-white/5 pb-2">
                    4. Pricing
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Price */}
                    <div>
                      <label className={labelCls}>Course Price (₹)</label>
                      <div className="relative">
                        <MdAttachMoney className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          type="number"
                          value={form.price}
                          onChange={set('price')}
                          placeholder="e.g. 499"
                          className={`${inputCls} pl-11`}
                        />
                      </div>
                    </div>

                    {/* Discount Price */}
                    <div>
                      <label className={labelCls}>Discount Price (₹)</label>
                      <div className="relative">
                        <MdLocalOffer className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          type="number"
                          value={form.discountPrice}
                          onChange={set('discountPrice')}
                          placeholder="e.g. 299"
                          className={`${inputCls} pl-11`}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* ── SECTION 6: COURSE STATISTICS & STATUS ── */}
                <motion.div 
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  className="space-y-5"
                >
                  <h4 className="text-xs font-extrabold text-purple-400 uppercase tracking-widest border-b border-white/5 pb-2">
                    5. Statistics & Visibility
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Lessons */}
                    <div>
                      <label className={labelCls}>Total Lessons</label>
                      <div className="relative">
                        <MdSchool className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          type="number"
                          value={form.lessons}
                          onChange={set('lessons')}
                          placeholder="e.g. 15"
                          className={`${inputCls} pl-11`}
                        />
                      </div>
                    </div>

                    {/* Projects */}
                    <div>
                      <label className={labelCls}>Total Projects</label>
                      <div className="relative">
                        <MdAssignment className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          type="number"
                          value={form.projects}
                          onChange={set('projects')}
                          placeholder="e.g. 3"
                          className={`${inputCls} pl-11`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Certificate available */}
                  <div className="flex items-center justify-between bg-white/5 px-5 py-3.5 rounded-xl border border-white/5 hover:bg-white/8 transition-all">
                    <div>
                      <span className="text-sm font-bold text-white block">Certificate Available</span>
                      <span className="text-[10px] text-gray-500">Provide verified completion certificate</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.certificate}
                        onChange={(e) => setForm(prev => ({ ...prev, certificate: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[#FF6B35] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--admin-surface-raised)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
                    </label>
                  </div>

                  {/* Featured Course toggle */}
                  <div className="flex items-center justify-between bg-white/5 px-5 py-3.5 rounded-xl border border-white/5 hover:bg-white/8 transition-all">
                    <div>
                      <span className="text-sm font-bold text-white block">Featured Course</span>
                      <span className="text-[10px] text-gray-500">Display prominently on student dashboard homepage</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) => setForm(prev => ({ ...prev, featured: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[#FF6B35] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--admin-surface-raised)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
                    </label>
                  </div>

                  {/* Visibility Toggles */}
                  <div>
                    <label className={labelCls}>Visibility State</label>
                    <div className="flex gap-3">
                      {['Public', 'Private'].map(state => (
                        <button
                          key={state}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, visibility: state }))}
                          className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all duration-300 ${
                            form.visibility === state
                              ? 'bg-purple-600/20 border-purple-500/50 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                          }`}
                        >
                          {state}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Options */}
                  <div>
                    <label className={labelCls}>Publication Status</label>
                    <div className="flex gap-3">
                      {['Draft', 'Published', 'Archived'].map(state => {
                        const styleMap = {
                          Draft: 'peer-checked:bg-yellow-500/20 peer-checked:border-yellow-500/50 peer-checked:text-yellow-300',
                          Published: 'peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500/50 peer-checked:text-emerald-300',
                          Archived: 'peer-checked:bg-gray-500/20 peer-checked:border-gray-500/50 peer-checked:text-gray-300'
                        };
                        return (
                          <button
                            key={state}
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, status: state }))}
                            className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all duration-300 ${
                              form.status === state
                                ? styleMap[state] + ' shadow-[0_0_12px_rgba(168,85,247,0.1)]'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                            }`}
                          >
                            {state}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </motion.div>

              </motion.div>
            </div>

            {/* ── STICKY FOOTER ACTIONS ── */}
            <div className="flex-shrink-0 px-8 py-5 border-t border-white/10 bg-[#070b16]/95 backdrop-blur-md flex items-center justify-between gap-3 relative z-20">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-semibold transition-all duration-300 text-xs shadow-md"
              >
                Cancel
              </button>

              <div className="flex items-center gap-3 flex-1 justify-end">
                {/* Save Draft */}
                <button
                  type="button"
                  onClick={() => handleSave('Draft')}
                  className="px-5 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-300 hover:text-white font-bold transition-all duration-300 text-xs shadow-md"
                >
                  Save Draft
                </button>

                {/* Publish */}
                <button
                  type="button"
                  onClick={() => handleSave('Published')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-xs hover:shadow-[0_0_24px_rgba(139,92,246,0.6)] transition-all hover:-translate-y-0.5 active:scale-95 border border-white/20"
                >
                  {courseToEdit ? 'Publish Updates' : 'Publish Course'}
                </button>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CourseDrawer;
