import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdClose, MdUploadFile, MdBook, MdTitle, MdDescription,
  MdLayers, MdCategory, MdTimer, MdLanguage, MdPerson,
  MdAttachMoney, MdLocalOffer, MdSchool, MdAssignment,
  MdCheckCircle, MdOutlineFiberManualRecord, MdSearch,
  MdRefresh, MdErrorOutline, MdInsertDriveFile, MdMovie
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

// Static fallback teachers
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
    status: 'Published',
    teacher: '',
    price: '',
    discountPrice: '',
    lessons: '',
    projects: '',
    certificate: true,
    visibility: 'Public',
    featured: false,
    avatar: null
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [teachers, setTeachers] = useState(DEFAULT_TEACHERS);
  const [searchTeacherQuery, setSearchTeacherQuery] = useState('');
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);
  const teacherDropdownRef = useRef(null);

  // ── GitHub Issue #105: Upload Progress Indicator & Retry State ──
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadFileType, setUploadFileType] = useState(''); // 'image', 'video', 'pdf'
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [lastSelectedFile, setLastSelectedFile] = useState(null);

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

  useEffect(() => {
    if (teachers.length > 0 && !courseToEdit && !form.teacher) {
      setForm(prev => ({ ...prev, teacher: teachers[0].name }));
    }
  }, [teachers, courseToEdit]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (teacherDropdownRef.current && !teacherDropdownRef.current.contains(e.target)) {
        setIsTeacherDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

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
    setUploadProgress(0);
    setIsUploading(false);
    setUploadError(null);
  }, [courseToEdit, isOpen, teachers]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleTitleChange = (e) => {
    const titleVal = e.target.value;
    const generatedSlug = titleVal
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    setForm(prev => ({
      ...prev,
      title: titleVal,
      slug: generatedSlug
    }));
  };

  // ── Simulated File Upload with Progress Bar & Retry logic ──
  const processFileUpload = (file) => {
    if (!file) return;

    setLastSelectedFile(file);
    setUploadedFileName(file.name);
    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(0);

    // Identify file type (Images, Videos, PDFs)
    if (file.type.startsWith('image/')) {
      setUploadFileType('image');
    } else if (file.type.startsWith('video/')) {
      setUploadFileType('video');
    } else if (file.type === 'application/pdf') {
      setUploadFileType('pdf');
    } else {
      setUploadFileType('file');
    }

    // Simulate progress event
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 20) + 10;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setIsUploading(false);

        // Read file if image
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setAvatarPreview(reader.result);
            setForm(prev => ({ ...prev, avatar: reader.result }));
          };
          reader.readAsDataURL(file);
        }
      }
      setUploadProgress(currentProgress);
    }, 200);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) { // Max 15MB for media/PDF
        setUploadError("File size exceeds 15MB limit.");
        return;
      }
      processFileUpload(file);
    }
  };

  // Retry function for issue #105 requirement
  const handleRetryUpload = () => {
    if (lastSelectedFile) {
      processFileUpload(lastSelectedFile);
    }
  };

  const handleSave = (statusOverride) => {
    if (!form.title || !form.shortDesc) {
      alert("Please fill in all required fields marked with *");
      return;
    }

    const submissionStatus = statusOverride || form.status;

    const gradients = [
      'from-blue-600 via-blue-500 to-cyan-400',
      'from-amber-500 via-orange-500 to-red-500',
      'from-emerald-500 via-teal-500 to-green-400',
      'from-purple-600 via-violet-500 to-pink-500'
    ];

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
      gradient: courseToEdit?.gradient || gradients[0],
      icon: courseToEdit?.icon || '📚',
      avatar: form.avatar,
      rating: courseToEdit?.rating || 4.8,
      students: courseToEdit?.students || 0,
      completion: courseToEdit?.completion || 0
    };

    onSave(savedCourse);
    onClose();
  };

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTeacherQuery.toLowerCase())
  );

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:bg-white/8 transition-all duration-300';
  const textareaCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:bg-white/8 transition-all duration-300 h-28 resize-none';
  const labelCls = 'text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          />

          <motion.div
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 200 }}
            role="dialog"
            aria-modal="true"
            className="fixed right-0 top-0 h-full w-full max-w-[520px] bg-[#070b16] border-l border-white/10 z-[110] shadow-2xl flex flex-col rounded-l-[32px] overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90 backdrop-blur-md px-8 py-6 flex-shrink-0 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20">
                  <MdBook size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">
                    {courseToEdit ? 'Edit Course Details' : 'Add New Course'}
                  </h2>
                  <p className="text-blue-100 text-xs mt-0.5">
                    {courseToEdit ? 'Update and refine course syllabus' : 'Create and publish a new learning course'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-black/20 hover:bg-white/10 text-white flex items-center justify-center transition-all"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-8 py-7 space-y-7 custom-scrollbar">
              
              {/* ── SECTION: MEDIA UPLOAD & PROGRESS INDICATOR (ISSUE #105 FIX) ── */}
              <div>
                <label className={labelCls}>Course Media / Attachment (Image, Video, PDF)</label>
                <div className="relative w-full rounded-2xl border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 bg-purple-500/5 p-4 flex flex-col items-center justify-center text-gray-400 transition-all">
                  
                  {/* Uploading Progress State */}
                  {isUploading ? (
                    <div className="w-full py-4 px-2 flex flex-col items-center">
                      <div className="flex items-center justify-between w-full text-xs text-purple-300 font-semibold mb-2">
                        <span className="truncate max-w-[200px]">{uploadedFileName}</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2.5 rounded-full transition-all duration-200" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-gray-400 mt-2">Uploading file... please wait.</span>
                    </div>
                  ) : uploadError ? (
                    /* Failure & Retry State */
                    <div className="flex flex-col items-center py-2 text-center">
                      <MdErrorOutline size={32} className="text-red-400 mb-1" />
                      <span className="text-xs text-red-400 font-bold">{uploadError}</span>
                      <button
                        type="button"
                        onClick={handleRetryUpload}
                        className="mt-3 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <MdRefresh size={16} /> Retry Upload
                      </button>
                    </div>
                  ) : avatarPreview ? (
                    /* Uploaded Image Preview */
                    <div className="w-full h-36 relative rounded-xl overflow-hidden group">
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-white font-medium">Click to replace</span>
                      </div>
                      <input type="file" accept="image/*,video/*,application/pdf" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  ) : (
                    /* Default Dropzone */
                    <label className="flex flex-col items-center justify-center cursor-pointer py-4 w-full">
                      <MdUploadFile size={36} className="text-purple-400/80 mb-2" />
                      <span className="text-sm font-bold text-white">Upload Image, Video, or PDF</span>
                      <span className="text-[11px] text-gray-500 mt-1">Shows live upload % with retry support</span>
                      <input type="file" accept="image/*,video/*,application/pdf" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </label>
                  )}
                </div>
              </div>

              {/* ── SECTION 1: BASIC INFO ── */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-purple-400 uppercase tracking-widest border-b border-white/5 pb-2">
                  1. Basic Information
                </h4>

                <div>
                  <label className={labelCls}>Course Name *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={handleTitleChange}
                    placeholder="e.g. Master Next.js and Server Actions"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Course Slug</label>
                  <input
                    type="text"
                    readOnly
                    value={form.slug}
                    className="w-full bg-white/5 border border-white/5 text-gray-500 rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className={labelCls}>Short Description *</label>
                  <textarea
                    required
                    value={form.shortDesc}
                    onChange={set('shortDesc')}
                    placeholder="Brief overview summarizing the syllabus"
                    className={`${textareaCls} h-20`}
                  />
                </div>
              </div>

              {/* ── SECTION 2: DETAILS ── */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-purple-400 uppercase tracking-widest border-b border-white/5 pb-2">
                  2. Course Details
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Level</label>
                    <select
                      value={form.level}
                      onChange={set('level')}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl py-3 px-3 text-sm text-white"
                    >
                      {LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Category</label>
                    <select
                      value={form.category}
                      onChange={set('category')}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl py-3 px-3 text-sm text-white"
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-[#0d1322] border-t border-white/10 px-8 py-5 flex items-center justify-between flex-shrink-0">
              <button
                type="button"
                onClick={() => handleSave('Draft')}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
              >
                Save Draft
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-gray-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('Published')}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold shadow-lg"
                >
                  {courseToEdit ? 'Save Changes' : 'Publish Course'}
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