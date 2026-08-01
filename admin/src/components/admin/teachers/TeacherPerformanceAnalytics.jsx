import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MdShowChart } from 'react-icons/md';

const TeacherPerformanceAnalytics = ({ teachers = [] }) => {
  const metrics = useMemo(() => {
    const activeCount = teachers.filter((teacher) => teacher.enabled).length;
    const topInstructor = [...teachers].sort((a, b) => (b.students || 0) - (a.students || 0))[0];
    const averageRating = teachers.length
      ? (
          teachers.reduce((sum, teacher) => sum + Number(teacher.rating || 0), 0) /
          teachers.length
        ).toFixed(1)
      : '0.0';

    return [
      { label: 'Active Instructors', value: String(activeCount), accent: '#10B981' },
      { label: 'Average Rating', value: averageRating, accent: '#8B5CF6' },
      { label: 'Top Instructor', value: topInstructor?.name || 'No instructors found', accent: '#F59E0B' },
      {
        label: 'Published Courses',
        value: String(
          teachers.reduce((sum, teacher) => sum + Number(teacher.activeCourses || 0), 0)
        ),
        accent: '#3B82F6',
      },
    ];
  }, [teachers]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl border p-5 md:p-6 shadow-[var(--admin-shadow-card)] bg-[var(--admin-surface)]"
      style={{ borderColor: 'var(--admin-border)' }}
    >
      <div className="absolute -top-20 right-0 w-64 h-64 rounded-full pointer-events-none opacity-25 blur-[80px] bg-[#8B5CF6]" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-start gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)' }}
            >
              <MdShowChart size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold admin-text-primary">Instructor Performance</h2>
              <p className="text-xs admin-text-secondary mt-0.5">
                Live instructor metrics calculated from current course and enrollment records.
              </p>
            </div>
          </div>

          <div
            className="rounded-2xl border p-5 min-h-[200px] flex items-center"
            style={{
              background: 'var(--admin-surface-raised)',
              borderColor: 'var(--admin-border-subtle)',
            }}
          >
            <p className="text-sm admin-text-secondary leading-7">
              {teachers.length === 0
                ? 'No instructors found. Create an instructor to populate performance insights.'
                : 'These values update from the instructor list, published courses, and enrolled learners without relying on placeholder charts or seeded trends.'}
            </p>
          </div>
        </div>

        <div className="lg:w-64 shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl px-4 py-3 border"
              style={{
                background: 'var(--admin-surface-raised)',
                borderColor: 'var(--admin-border-subtle)',
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider admin-text-secondary">
                {metric.label}
              </p>
              <p className="text-xl font-extrabold admin-text-primary" style={{ color: metric.accent }}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default TeacherPerformanceAnalytics;
