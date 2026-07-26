import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose } from 'react-icons/md';
import CourseDrawer from '../../../components/admin/courses/CourseDrawer';
import CoursesHero from '../../../components/admin/courses/CoursesHero';
import CourseKpiRow from '../../../components/admin/courses/CourseKpiRow';
import TopPerformingCourses from '../../../components/admin/courses/TopPerformingCourses';
import CoursesFilters from '../../../components/admin/courses/CoursesFilters';
import CourseGrid from '../../../components/admin/courses/CourseGrid';
import {
  normalizeCourse,
  getCategories,
  computeRevenue,
} from '../../../utils/courseUtils';
import { exportToCSV } from '../../../utils/export';
import { apiRequest } from '../../../utils/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [notice, setNotice] = useState(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [courseResult, instructorResult] = await Promise.all([
        apiRequest('/v1/admin/courses?limit=1000'),
        apiRequest('/v1/admin/instructors?limit=1000'),
      ]);
      setCourses((courseResult.data || []).map(normalizeCourse));
      setInstructors(instructorResult.data || []);
    } catch (error) {
      console.error('Unable to load courses:', error);
      setCourses([]);
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(null), 3200);
    return () => clearTimeout(t);
  }, [notice]);

  const categories = useMemo(() => getCategories(courses), [courses]);

  const filtered = useMemo(
    () =>
      courses.filter((c) => {
        const q = searchQuery.toLowerCase();
        const matchQ =
          !q ||
          c.title.toLowerCase().includes(q) ||
          (c.category && c.category.toLowerCase().includes(q)) ||
          (c.teacher && c.teacher.toLowerCase().includes(q));
        const matchCat = !categoryFilter || c.category === categoryFilter;
        const matchLvl = !levelFilter || c.level === levelFilter;
        return matchQ && matchCat && matchLvl;
      }),
    [courses, searchQuery, categoryFilter, levelFilter]
  );

  const activeCount = courses.filter((c) => c.active).length;
  const totalRevenue = courses.reduce((sum, c) => sum + computeRevenue(c), 0);

  const showNotice = (message) => setNotice(message);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      await apiRequest(`/v1/admin/courses/${id}`, { method: 'DELETE' });
      setCourses((prev) => prev.filter((c) => c.id !== id));
      showNotice('Course deleted.');
    }
  };

  const handleOpenAddDrawer = () => {
    setSelectedCourse(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (course) => {
    setSelectedCourse(course);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setSelectedCourse(null);
    setIsDrawerOpen(false);
  };

  const handleSaveCourse = async (savedCourse) => {
    const payload = {
      title: savedCourse.title,
      description: savedCourse.fullDesc || savedCourse.shortDesc,
      category: savedCourse.category,
      level: savedCourse.level,
      duration: savedCourse.duration ? `${savedCourse.duration} Hrs` : null,
      price: savedCourse.price,
      thumbnail: savedCourse.avatar || savedCourse.thumbnail || null,
      instructorId: savedCourse.instructorId,
      status: savedCourse.active ? 'approved' : 'pending',
      xp: savedCourse.xp || null,
      gradient: savedCourse.gradient || null,
      icon: savedCourse.icon || null,
    };
    const result = selectedCourse
      ? await apiRequest(`/v1/admin/courses/${selectedCourse.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
      : await apiRequest('/v1/admin/courses', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
    const normalized = normalizeCourse(result.data);
    setCourses((prev) => {
      const exists = prev.some((c) => c.id === normalized.id);
      return exists ? prev.map((c) => (c.id === normalized.id ? normalized : c)) : [normalized, ...prev];
    });
    showNotice(selectedCourse ? 'Course updated.' : 'Course created.');
  };

  const handleClone = () => showNotice('Course cloning is disabled. Create courses through the admin form.');

  const handleExport = () => {
    exportToCSV(
      filtered,
      [
        'title',
        'slug',
        'level',
        'xp',
        'category',
        'lessons',
        'projects',
        'rating',
        'students',
        'completion',
        'hours',
        'active',
        'teacher',
        'price',
        'discountPrice',
        'revenue',
      ],
      'lms-courses.csv'
    );
    showNotice('Export started.');
  };

  const hasFilters = Boolean(searchQuery || categoryFilter || levelFilter);
  const handleClearFilters = () => {
  setSearchQuery('');
  setCategoryFilter('');
  setLevelFilter('');
};

  return (
    <div className="admin-page space-y-6 md:space-y-8 animate-fade-in relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
      <CoursesHero
        totalCount={loading ? '—' : courses.length.toLocaleString()}
        totalRevenue={totalRevenue}
        activeCount={activeCount}
        onCreateCourse={handleOpenAddDrawer}
        onExport={handleExport}
      />

      <CourseKpiRow courses={courses} />

      <TopPerformingCourses courses={courses} onEdit={handleOpenEditDrawer} />

      <CoursesFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        levelFilter={levelFilter}
        onLevelChange={setLevelFilter}
        categories={categories}
        resultCount={filtered.length}
      />

      <CourseGrid
        courses={filtered}
        onCreateCourse={handleOpenAddDrawer}
        onEdit={handleOpenEditDrawer}
        onClone={handleClone}
        onAnalytics={() => showNotice('Course analytics — opening soon.')}
        onPreview={() => showNotice('Course preview — opening soon.')}
        onDelete={handleDelete}
        hasFilters={hasFilters}
        onClearFilters={handleClearFilters}
      />

      <CourseDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onSave={handleSaveCourse}
        courseToEdit={selectedCourse}
        teachers={instructors}
      />

      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl border shadow-2xl text-sm font-medium admin-text-primary"
            style={{
              background: 'var(--admin-surface-raised)',
              borderColor: 'var(--admin-border)',
            }}
          >
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="admin-text-secondary hover:admin-text-primary"
              aria-label="Dismiss"
            >
              <MdClose size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Courses;
