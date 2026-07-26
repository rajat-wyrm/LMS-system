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
import { apiRequest } from '../../../utils/api';
import { normalizeTeacher } from '../../../utils/teacherUtils';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTeachers = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiRequest('/v1/admin/instructors?limit=1000');
      setTeachers((result.data || []).map(normalizeTeacher));
    } catch (error) {
      console.error('Unable to load instructors:', error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

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
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const recent = teachers.filter((t) => {
      const date = new Date(t.joinDate);
      return !Number.isNaN(date.getTime()) && date >= monthStart;
    }).length;
    if (teachers.length === 0) return '0%';
    const pct = Math.round((recent / teachers.length) * 100);
    return `+${pct}%`;
  }, [teachers]);

  const handleAddSave = async (form) => {
    const result = await apiRequest('/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        role: 'instructor',
        status: form.enabled ? 'approved' : 'pending',
        bio: form.bio || form.style || '',
        avatar: form.avatar || null,
      }),
    });
    setTeachers((prev) => [normalizeTeacher(result.data), ...prev]);
  };

  const handleEditSave = async (form) => {
    const result = await apiRequest(`/v1/admin/users/${editTeacher.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        status: form.enabled ? 'approved' : 'pending',
        bio: form.bio || form.style || '',
        avatar: form.avatar || editTeacher.avatar || null,
      }),
    });
    const updated = normalizeTeacher({ ...editTeacher, ...result.data, bio: form.bio || form.style || '', avatar: form.avatar || editTeacher.avatar });
    setTeachers((prev) => prev.map((t) => (t.id === editTeacher.id ? updated : t)));
    if (selectedTeacher && selectedTeacher.id === editTeacher.id) {
      setSelectedTeacher((prev) => ({ ...prev, ...updated }));
    }
  };

  const handleDelete = async (id) => {
    await apiRequest(`/v1/admin/users/${id}`, { method: 'DELETE' });
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
        totalCount={loading ? '—' : teachers.length.toLocaleString()}
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
