import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { exportToCSV } from '../../../utils/export';

import TeachersHero from '../../../components/admin/teachers/TeachersHero';
import TeacherKpiRow from '../../../components/admin/teachers/TeacherKpiRow';
import TopMentorsSection from '../../../components/admin/teachers/TopMentorsSection';
import TeachersFilters from '../../../components/admin/teachers/TeachersFilters';
import TeacherGrid from '../../../components/admin/teachers/TeacherGrid';
import TeacherPerformanceAnalytics from '../../../components/admin/teachers/TeacherPerformanceAnalytics';
import TeacherDrawer from '../../../components/admin/teachers/TeacherDrawer';
import TeacherProfileView from '../../../components/admin/teachers/TeacherProfileView';
import InviteTeacherModal from '../../../components/admin/teachers/InviteTeacherModal';
import { loadTeachers } from '../../../utils/teacherUtils';

const Teachers = () => {
  const [teachers, setTeachers] = useState(loadTeachers);

  useEffect(() => {
    localStorage.setItem('lms_teachers_data', JSON.stringify(teachers));
  }, [teachers]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const filteredTeachers = useMemo(
    () =>
      teachers.filter((t) => {
        const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchFilter =
          filter === 'All' ? true : filter === 'Active' ? t.enabled : !t.enabled;
        return matchSearch && matchFilter;
      }),
    [teachers, searchQuery, filter]
  );

  const activeTeachers = teachers.filter((t) => t.enabled).length;

  const monthlyGrowth = useMemo(() => {
    const recent = teachers.filter((t) => {
      const d = t.joinDate || '';
      return d.includes('2024') && (d.includes('May') || d.includes('Apr'));
    }).length;
    if (teachers.length === 0) return '0%';
    const pct = Math.max(8, Math.round((recent / teachers.length) * 100) + 12);
    return `+${pct}%`;
  }, [teachers]);

  const handleAddSave = (form) => {
    setTeachers((prev) => [
      {
        ...form,
        id: Date.now(),
        students: 0,
        rating: 0,
        revenue: 0,
        courses: 1,
        course: form.style,
        joinDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
        photo: form.avatar || null,
        verified: false,
        featured: false,
        topMentor: false,
      },
      ...prev,
    ]);
  };

  const handleEditSave = (form) => {
    setTeachers((prev) =>
      prev.map((t) =>
        t.id === editTeacher.id ? { ...t, ...form, photo: form.avatar || t.photo } : t
      )
    );
    if (selectedTeacher && selectedTeacher.id === editTeacher.id) {
      setSelectedTeacher((prev) => ({ ...prev, ...form, photo: form.avatar || prev.photo }));
    }
  };

  const handleDelete = (id) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    if (selectedTeacher?.id === id) setSelectedTeacher(null);
  };

  const handleExport = () => {
    exportToCSV(
      filteredTeachers,
      [
        'name',
        'style',
        'course',
        'enabled',
        'students',
        'rating',
        'revenue',
        'courses',
        'email',
        'phone',
        'joinDate',
        'bio',
      ],
      'lms-teachers.csv'
    );
  };

  if (selectedTeacher) {
    const liveTeacher = teachers.find((t) => t.id === selectedTeacher.id) || selectedTeacher;
    return (
      <>
        <TeacherProfileView
          teacher={liveTeacher}
          onBack={() => setSelectedTeacher(null)}
          onEdit={setEditTeacher}
          onDelete={handleDelete}
        />
        <TeacherDrawer
          isOpen={!!editTeacher}
          onClose={() => setEditTeacher(null)}
          title="Edit Teacher"
          teacher={editTeacher}
          onSave={handleEditSave}
        />
      </>
    );
  }

  return (
    <div className="admin-page space-y-6 md:space-y-8 animate-fade-in relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
      <TeachersHero
        totalCount={teachers.length.toLocaleString()}
        monthlyGrowth={monthlyGrowth}
        activeCount={activeTeachers}
        onAddTeacher={() => setIsAddOpen(true)}
        onInviteTeacher={() => setIsInviteOpen(true)}
        onExport={handleExport}
      />

      <TeacherKpiRow teachers={teachers} />

      <TopMentorsSection teachers={teachers} onViewProfile={setSelectedTeacher} />

      <TeachersFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={setFilter}
      />

      <TeacherGrid
        teachers={filteredTeachers}
        onView={setSelectedTeacher}
        onEdit={setEditTeacher}
        onDelete={handleDelete}
      />

      <TeacherPerformanceAnalytics teachers={teachers} />

      <TeacherDrawer
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Teacher"
        teacher={null}
        onSave={handleAddSave}
      />
      <TeacherDrawer
        isOpen={!!editTeacher}
        onClose={() => setEditTeacher(null)}
        title="Edit Teacher"
        teacher={editTeacher}
        onSave={handleEditSave}
      />

      <AnimatePresence>
        {isInviteOpen && (
          <InviteTeacherModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Teachers;
