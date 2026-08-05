import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd } from 'react-icons/md';
import CourseCard from './CourseCard';

const CourseGrid = ({
  courses,
  onCreateCourse,
  onEdit,
  onClone,
  onAnalytics,
  onPreview,
  onDelete,
  hasFilters,
}) => {
  if (courses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 flex flex-col items-center justify-center py-20 rounded-3xl text-center border"
        style={{
          background: 'var(--admin-surface)',
          borderColor: 'var(--admin-border)',
        }}
      >
        <div className="text-5xl mb-4">📚</div>
        <h3 className="text-xl font-bold admin-text-primary mb-2">No Courses Found</h3>
        <p className="admin-text-secondary text-sm mb-6 max-w-xs">
          {hasFilters
            ? 'Try adjusting your search or filter criteria.'
            : 'Create your first course and start teaching students.'}
        </p>
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateCourse}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white border border-white/10"
          style={{
            background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
          }}
        >
          <MdAdd size={20} />
          Create Course
        </motion.button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="popLayout">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {courses.map((course, index) => (
          <CourseCard
            key={course.id}
            course={course}
            index={index}
            onEdit={onEdit}
            onClone={onClone}
            onAnalytics={onAnalytics}
            onPreview={onPreview}
            onDelete={onDelete}
          />
        ))}
      </div>
    </AnimatePresence>
  );
};

export default CourseGrid;
