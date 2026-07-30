import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose } from 'react-icons/md';
import CourseDrawer from '../../../components/admin/courses/CourseDrawer';
import CoursesHero from '../../../components/admin/courses/CoursesHero';
import CourseKpiRow from '../../../components/admin/courses/CourseKpiRow';
import TopPerformingCourses from '../../../components/admin/courses/TopPerformingCourses';
import CoursesFilters from '../../../components/admin/courses/CoursesFilters';
import CourseGrid from '../../../components/admin/courses/CourseGrid';
import { apiFetch } from '../../../api/config';
import {
  normalizeCourse,
  getCategories,
  computeRevenue,
} from '../../../utils/courseUtils';
import { exportToCSV } from '../../../utils/export';
import { notifyCourseSync } from '../../../utils/courseSyncEvents';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [notice, setNotice] = useState(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const fetchCourses = useCallback(async () => {
    try {
      const payload = await apiFetch('/admin/courses');
      const list = Array.isArray(payload?.data) ? payload.data : [];
      setCourses(list.map((course) => normalizeCourse(course)));
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses([]);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

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
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      await apiFetch(`/courses/${id}`, { method: 'DELETE' });
      await fetchCourses();
      notifyCourseSync();
      showNotice('Course deleted.');
    } catch (error) {
      console.error('Failed to delete course:', error);
      showNotice('Unable to delete course.');
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
    try {
      const isEditing = Boolean(selectedCourse);
      const payload = {
        title: savedCourse.title,
        description: savedCourse.shortDesc || savedCourse.fullDesc || savedCourse.description || '',
        category: savedCourse.category,
        level: savedCourse.level,
        price: Number(savedCourse.price) || 0,
        thumbnail: savedCourse.thumbnail || savedCourse.avatar || '',
        celebrityTeacher: savedCourse.teacher || savedCourse.celebrityTeacher || '',
        duration: savedCourse.duration || savedCourse.hours || 'Self-paced',
        rating: Number(savedCourse.rating) || 4.5,
        outcomes: savedCourse.outcomes || [],
        xp: savedCourse.xp || '1000 XP',
        gradient: savedCourse.gradient || 'from-blue-600 via-blue-500 to-cyan-400',
        icon: savedCourse.icon || '📚',
        status: savedCourse.status === 'Published' ? 'approved' : (savedCourse.status || 'approved'),
      };

      if (isEditing) {
        await apiFetch(`/courses/${savedCourse.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/courses', { method: 'POST', body: JSON.stringify(payload) });
      }

      await fetchCourses();
      notifyCourseSync();
      showNotice(isEditing ? 'Course updated.' : 'Course created.');
    } catch (error) {
      console.error('Failed to save course:', error);
      showNotice('Unable to save course.');
    }
  };

  const handleClone = async (course) => {
    try {
      const clonePayload = {
        title: `${course.title} (Copy)`,
        description: course.description || course.shortDesc || 'Cloned course',
        category: course.category,
        level: course.level,
        price: Number(course.price) || 0,
        thumbnail: course.thumbnail || '',
        celebrityTeacher: course.teacher || course.celebrityTeacher || '',
        duration: course.duration || 'Self-paced',
        rating: Number(course.rating) || 4.5,
        outcomes: course.outcomes || [],
        xp: course.xp || '1000 XP',
        gradient: course.gradient || 'from-blue-600 via-blue-500 to-cyan-400',
        icon: course.icon || '📚',
        status: 'approved',
      };
      await apiFetch('/courses', { method: 'POST', body: JSON.stringify(clonePayload) });
      await fetchCourses();
      notifyCourseSync();
      showNotice('Course cloned as draft.');
    } catch (error) {
      console.error('Failed to clone course:', error);
      showNotice('Unable to clone course.');
    }
  };

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
        totalCount={courses.length.toLocaleString()}
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
