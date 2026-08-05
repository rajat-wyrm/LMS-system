import React from 'react';
import { AnimatePresence } from 'framer-motion';
import TeacherCard from './TeacherCard';

const TeacherGrid = ({ teachers, onView, onEdit, onDelete }) => {
  if (teachers.length === 0) {
    return (
      <div
        className="rounded-2xl border p-12 text-center admin-text-secondary"
        style={{
          borderColor: 'var(--admin-border)',
          background: 'var(--admin-surface)',
        }}
      >
        No mentors match your search or filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout">
        {teachers.map((teacher) => (
          <TeacherCard
            key={teacher.id}
            teacher={teacher}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TeacherGrid;
