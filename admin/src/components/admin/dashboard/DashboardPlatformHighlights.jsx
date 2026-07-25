import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MdLibraryBooks,
  MdSchool,
  MdPerson,
  MdWorkspacePremium,
} from 'react-icons/md';
import { apiFetch } from '../../../api/config';

const ICONS = {
  course: MdLibraryBooks,
  teacher: MdSchool,
  student: MdPerson,
  certificate: MdWorkspacePremium,
};

const FALLBACK_ITEMS = [
  {
    label: 'Platform Status',
    value: 'Live data enabled',
    sub: 'Dashboard cards now use backend metrics',
    iconKey: 'certificate',
    accent: '#F59E0B',
  },
];

const DashboardPlatformHighlights = () => {
  const [items, setItems] = useState(FALLBACK_ITEMS);

  const fetchHighlights = useCallback(async () => {
    try {
      const { data } = await apiFetch('/admin/dashboard/top-performers');
      const nextItems = [];

      if (data?.topCourse) {
        nextItems.push({
          label: 'Top Course',
          value: data.topCourse.name,
          sub: `${data.topCourse.enrollments.toLocaleString()} enrollments`,
          iconKey: 'course',
          accent: '#3B82F6',
        });
      }

      if (data?.topInstructor) {
        nextItems.push({
          label: 'Top Teacher',
          value: data.topInstructor.name,
          sub: `${data.topInstructor.students.toLocaleString()} learners · ${data.topInstructor.rating ?? 0}★`,
          iconKey: 'teacher',
          accent: '#10B981',
        });
      }

      if (data?.topStudent) {
        nextItems.push({
          label: 'Top Student',
          value: data.topStudent.name,
          sub: `${data.topStudent.progress}% progress · ${data.topStudent.course}`,
          iconKey: 'student',
          accent: '#8B5CF6',
        });
      }

      setItems(nextItems.length > 0 ? nextItems : FALLBACK_ITEMS);
    } catch (error) {
      console.error('Platform highlights fetch failed:', error);
    }
  }, []);

  useEffect(() => {
    fetchHighlights();
  }, [fetchHighlights]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((item, index) => {
        const Icon = ICONS[item.iconKey];
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4, boxShadow: `0 12px 28px ${item.accent}33` }}
            className="rounded-xl px-3 py-3 border transition-all duration-300 bg-[var(--admin-surface-raised)] shadow-[var(--admin-shadow-card)] flex items-center gap-3"
            style={{ borderColor: `${item.accent}35` }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-md"
              style={{ background: item.accent }}
            >
              <Icon size={20} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-semibold uppercase tracking-wider admin-text-secondary leading-none mb-1">
                {item.label}
              </p>
              <p className="text-xs font-bold admin-text-primary truncate" title={item.value}>
                {item.value}
              </p>
              <p className="text-[10px] admin-text-muted truncate">{item.sub}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default DashboardPlatformHighlights;
