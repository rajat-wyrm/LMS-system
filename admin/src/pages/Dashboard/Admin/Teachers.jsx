import React, { useState, useMemo, useEffect } from 'react';
import { exportToCSV } from '../../../utils/export';
import { apiRequest } from '../../../utils/api';

import TeachersHero from '../../../components/admin/teachers/TeachersHero';
import TeacherKpiRow from '../../../components/admin/teachers/TeacherKpiRow';
import TopMentorsSection from '../../../components/admin/teachers/TopMentorsSection';
import TeachersFilters from '../../../components/admin/teachers/TeachersFilters';
import TeacherGrid from '../../../components/admin/teachers/TeacherGrid';
import TeacherPerformanceAnalytics from '../../../components/admin/teachers/TeacherPerformanceAnalytics';
import TeacherDrawer from '../../../components/admin/teachers/TeacherDrawer';
import TeacherProfileView from '../../../components/admin/teachers/TeacherProfileView';
import { normalizeTeacher } from '../../../utils/teacherUtils';

const instructorRequest = async (path, options) => {
  try {
    return await apiRequest(`/v1/admin${path}`, options);
  } catch (error) {
    if (error?.status === 404) {
      return apiRequest(`/admin${path}`, options);
    }

    throw error;
  }
};

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const loadTeachers = async () => {
    try {
      setError('');
      const result = await instructorRequest('/instructors?limit=1000');
      setTeachers((result.data || []).map((teacher, index) => normalizeTeacher(teacher, index)));
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to load instructors.');
      setTeachers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const filteredTeachers = useMemo(
    () =>
      teachers.filter((teacher) => {
        const matchSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchFilter =
          filter === 'All' ? true : filter === 'Active' ? teacher.enabled : !teacher.enabled;

        return matchSearch && matchFilter;
      }),
    [teachers, searchQuery, filter]
  );

  const activeTeachers = teachers.filter((teacher) => teacher.enabled).length;

  const monthlyGrowth = useMemo(() => {
    const now = new Date();
    const createdThisMonth = teachers.filter((teacher) => {
      if (!teacher.joinDate || teacher.joinDate === 'N/A') return false;
      const joinedAt = new Date(teacher.joinDate);
      return joinedAt.getFullYear() === now.getFullYear() && joinedAt.getMonth() === now.getMonth();
    }).length;

    return String(createdThisMonth);
  }, [teachers]);

  const handleAddSave = async (form) => {
    await instructorRequest('/instructors', {
      method: 'POST',
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        bio: form.bio,
        avatar: form.avatar,
        status: form.enabled ? 'approved' : 'suspended',
      }),
    });
    setIsAddOpen(false);
    await loadTeachers();
  };

  const handleEditSave = async (form) => {
    await instructorRequest(`/instructors/${editTeacher.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password || undefined,
        bio: form.bio,
        avatar: form.avatar,
        status: form.enabled ? 'approved' : 'suspended',
      }),
    });
    setEditTeacher(null);
    await loadTeachers();
  };

  const handleDelete = async (id) => {
    await instructorRequest(`/instructors/${id}`, {
      method: 'DELETE',
    });
    if (selectedTeacher?.id === id) setSelectedTeacher(null);
    await loadTeachers();
  };

  const handleExport = () => {
    exportToCSV(
      filteredTeachers,
      ['name', 'email', 'status', 'students', 'rating', 'revenue', 'courses', 'joinDate', 'bio'],
      'lms-teachers.csv'
    );
  };

  if (selectedTeacher) {
    const liveTeacher = teachers.find((teacher) => teacher.id === selectedTeacher.id) || selectedTeacher;

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
          title="Edit Instructor"
          teacher={editTeacher}
          onSave={handleEditSave}
        />
      </>
    );
  }

  const emptyMessage =
    searchQuery || filter !== 'All'
      ? 'No instructors match your search or filters.'
      : 'No instructors found.';

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 border border-border shadow-sm bg-card/60 backdrop-blur-xl font-body">
      <TeachersHero
        totalCount={teachers.length.toLocaleString()}
        monthlyGrowth={monthlyGrowth}
        activeCount={activeTeachers}
        onAddTeacher={() => setIsAddOpen(true)}
        onExport={handleExport}
      />

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <TeacherKpiRow teachers={teachers} />

      <TopMentorsSection teachers={teachers} onViewProfile={setSelectedTeacher} />

      <TeachersFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={setFilter}
      />

      {isLoading ? (
        <div
          className="rounded-2xl border p-12 text-center admin-text-secondary"
          style={{
            borderColor: 'var(--admin-border)',
            background: 'var(--admin-surface)',
          }}
        >
          Loading instructors...
        </div>
      ) : (
        <TeacherGrid
          teachers={filteredTeachers}
          onView={setSelectedTeacher}
          onEdit={setEditTeacher}
          onDelete={handleDelete}
          emptyMessage={emptyMessage}
        />
      )}

      <TeacherPerformanceAnalytics teachers={teachers} />

      <TeacherDrawer
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Instructor"
        teacher={null}
        onSave={handleAddSave}
      />
      <TeacherDrawer
        isOpen={!!editTeacher}
        onClose={() => setEditTeacher(null)}
        title="Edit Instructor"
        teacher={editTeacher}
        onSave={handleEditSave}
      />
    </div>
  );
};

export default Teachers;
