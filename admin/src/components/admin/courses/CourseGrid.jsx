import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { MdLibraryBooks } from 'react-icons/md';
import CourseCard from './CourseCard';
import EmptyState from '../../common/EmptyState';

const CourseGrid = ({
  courses,
  onCreateCourse,
  onEdit,
  onClone,
  onAnalytics,
  onPreview,
  onDelete,
  hasFilters,
  onClearFilters,
}) => {
  if (courses.length === 0) {
    return hasFilters ? (
      <EmptyState
        icon={MdLibraryBooks}
        title="No Courses Found"
        description="No courses match your search or filters. Try adjusting your criteria."
        buttonText="Clear Filters"
        onButtonClick={onClearFilters}
      />
    ) : (
      <EmptyState
        icon={MdLibraryBooks}
        title="No Courses Found"
        description="Create your first course to start offering content."
        buttonText="+ Create Course"
        onButtonClick={onCreateCourse}
      />
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