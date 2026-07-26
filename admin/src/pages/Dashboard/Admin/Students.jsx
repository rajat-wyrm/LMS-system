import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  MdSearch,
  MdOutlineCalendarToday,
  MdKeyboardArrowDown,
  MdRefresh,
} from 'react-icons/md';
import { exportToCSV } from '../../../utils/export';
import { apiRequest, clearAdminAuth } from '../../../utils/api';

import StudentsHero from '../../../components/admin/students/StudentsHero';
import StudentAnalyticsCards from '../../../components/admin/students/StudentAnalyticsCards';
import StudentInsightsStrip from '../../../components/admin/students/StudentInsightsStrip';
import StudentTable from '../../../components/admin/students/StudentTable';
import StudentProfileDrawer from '../../../components/admin/students/StudentProfileDrawer';
import AddStudentDrawer from '../../../components/admin/students/AddStudentDrawer';
import NotificationModal from '../../../components/admin/students/NotificationModal';
import DeleteStudentModal from '../../../components/admin/students/DeleteStudentModal';

const filterSelectClass =
  'w-full rounded-xl py-2.5 pl-4 pr-10 text-xs admin-text-primary focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all cursor-pointer appearance-none border bg-[var(--admin-surface)] border-[var(--admin-border)]';
const filterInputClass =
  'w-full rounded-xl py-2.5 pl-10 pr-4 text-xs admin-text-primary placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all border bg-[var(--admin-surface)] border-[var(--admin-border)]';

const STATUS_TO_UI = {
  approved: 'Active',
  pending: 'Pending',
  rejected: 'Inactive',
  suspended: 'Suspended',
  active: 'Active',
  completed: 'Completed',
};

const UI_TO_STATUS = {
  Active: 'approved',
  Pending: 'pending',
  Inactive: 'rejected',
  Suspended: 'suspended',
  Completed: 'approved',
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toISOString().slice(0, 10);
};

const normalizeStudent = (user) => ({
  id: user.id,
  name: user.name || 'Unnamed student',
  email: user.email || '',
  avatar: user.avatar || null,
  enrolledCourse: user.enrolledCourse || null,
  mentorName: user.mentorName || null,
  progress: Number.isFinite(user.progress) ? user.progress : 0,
  status: STATUS_TO_UI[user.status] || user.status || 'Pending',
  joinedDate: formatDate(user.createdAt),
  badge: null,
  phone: null,
  plan: null,
  xp: null,
  lastActive: null,
  certificates: user.certificates ?? 0,
  streak: null,
  rawStatus: user.status,
  enrollmentsCount: user.enrollmentsCount ?? user.enrollments?.length ?? 0,
});

const Students = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const filter = searchParams.get('filter');

  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToModify, setStudentToModify] = useState(null);

  const loadStudents = async ({ silent = false } = {}) => {
    if (silent) setIsRefreshing(true);
    else setIsLoading(true);
    setError('');

    try {
      const result = await apiRequest('/v1/admin/users?role=user&limit=1000');
      setStudents((result.data || []).map(normalizeStudent));
    } catch (requestError) {
      if (requestError.status === 401 || requestError.status === 403) {
        clearAdminAuth();
      }
      setError(requestError.message || 'Unable to load students from the database.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const courseOptions = useMemo(
    () => [...new Set(students.map((student) => student.enrolledCourse).filter(Boolean))],
    [students],
  );
  const teacherOptions = useMemo(
    () => [...new Set(students.map((student) => student.mentorName).filter(Boolean))],
    [students],
  );

  const hasFilters = Boolean(searchQuery || statusFilter || courseFilter || teacherFilter || dateFilter);

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setCourseFilter('');
    setTeacherFilter('');
    setDateFilter('');
  };

  const displayedStudents = useMemo(
    () =>
      students.filter((student) => {
        const searchable = [
          student.name,
          student.email,
          student.enrolledCourse,
          student.mentorName,
        ].filter(Boolean).join(' ').toLowerCase();

        const matchesSearch = searchQuery === '' || searchable.includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === '' || student.status === statusFilter;
        const matchesCourse = courseFilter === '' || student.enrolledCourse === courseFilter;
        const matchesTeacher = teacherFilter === '' || student.mentorName === teacherFilter;
        const matchesDate = dateFilter === '' || student.joinedDate === dateFilter;

        let matchesRoute = true;
        if (filter === 'active') matchesRoute = student.status === 'Active';
        else if (filter === 'new') {
          const joined = new Date(student.joinedDate);
          const monthAgo = new Date();
          monthAgo.setDate(monthAgo.getDate() - 30);
          matchesRoute = !Number.isNaN(joined.getTime()) && joined >= monthAgo;
        } else if (filter === 'analytics') {
          matchesRoute = student.progress > 80;
        }

        return matchesSearch && matchesStatus && matchesCourse && matchesTeacher && matchesDate && matchesRoute;
      }),
    [students, searchQuery, statusFilter, courseFilter, teacherFilter, dateFilter, filter],
  );

  const monthlyGrowth = useMemo(() => {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const recent = students.filter((student) => {
      const joined = new Date(student.joinedDate);
      return !Number.isNaN(joined.getTime()) && joined >= monthAgo;
    }).length;
    if (students.length === 0) return '0%';
    return `+${Math.round((recent / students.length) * 100)}%`;
  }, [students]);

  const handleOpenDrawer = (student) => {
    setSelectedStudent(student);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedStudent(null), 300);
  };

  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleOpenNotifyModal = (student) => {
    setStudentToModify(student);
    setIsNotifyModalOpen(true);
  };

  const handleCloseNotifyModal = () => {
    setIsNotifyModalOpen(false);
    setTimeout(() => setStudentToModify(null), 300);
  };

  const handleOpenDeleteModal = (student) => {
    setStudentToModify(student);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTimeout(() => setStudentToModify(null), 300);
  };

  const handleDeleteStudent = async (id) => {
    setError('');
    try {
      await apiRequest(`/v1/admin/users/${id}`, { method: 'DELETE' });
      setStudents((current) => current.filter((student) => student.id !== id));
      handleCloseDeleteModal();
      if (selectedStudent?.id === id) handleCloseDrawer();
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete student.');
    }
  };

  const handleSaveStudent = async (studentForm) => {
    setError('');
    try {
      const payload = {
        name: studentForm.name,
        email: studentForm.email,
        avatar: studentForm.avatar || null,
        status: UI_TO_STATUS[studentForm.status] || 'approved',
      };

      const result = studentToModify
        ? await apiRequest(`/v1/admin/users/${studentToModify.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          })
        : await apiRequest('/v1/admin/users', {
            method: 'POST',
            body: JSON.stringify({
              ...payload,
              password: studentForm.password,
              role: 'user',
            }),
          });

      const normalized = normalizeStudent(result.data);
      setStudents((current) =>
        studentToModify
          ? current.map((student) => (student.id === studentToModify.id ? normalized : student))
          : [normalized, ...current],
      );
      handleCloseAddModal();
      setStudentToModify(null);
    } catch (requestError) {
      setError(requestError.message || 'Unable to save student.');
    }
  };

  const handleExport = () => {
    exportToCSV(
      displayedStudents,
      ['name', 'email', 'enrolledCourse', 'mentorName', 'status', 'joinedDate', 'progress', 'certificates'],
      'lms-students.csv',
    );
  };

  const handleGenerateReport = () => {
    const active = students.filter((student) => student.status === 'Active').length;
    const avgProgress =
      students.length > 0
        ? Math.round(students.reduce((sum, student) => sum + (student.progress ?? 0), 0) / students.length)
        : 0;
    exportToCSV(
      [{
        reportDate: new Date().toISOString().split('T')[0],
        totalStudents: students.length,
        activeStudents: active,
        averageCompletion: `${avgProgress}%`,
        filteredCount: displayedStudents.length,
      }],
      ['reportDate', 'totalStudents', 'activeStudents', 'averageCompletion', 'filteredCount'],
      'lms-students-report.csv',
    );
  };

  return (
    <div className="admin-page space-y-6 md:space-y-8 animate-fade-in relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
      <StudentsHero
        totalCount={students.length.toLocaleString()}
        monthlyGrowth={monthlyGrowth}
        onAddStudent={() => setIsAddModalOpen(true)}
        onExport={handleExport}
        onGenerateReport={handleGenerateReport}
      />

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <StudentAnalyticsCards students={students} />
      <StudentInsightsStrip students={students} />

      <div className="relative z-10 flex flex-wrap gap-3 items-center rounded-2xl p-4 border shadow-lg admin-surface border-[var(--admin-border)]">
        <div className="relative min-w-[200px] flex-1">
          <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 admin-text-secondary" size={18} />
          <input
            type="text"
            placeholder="Search students, email, course, or mentor..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className={filterInputClass}
          />
        </div>

        {isRefreshing && <MdRefresh className="text-cyan-400 animate-spin" size={18} />}

        <div className="relative min-w-[110px]">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={filterSelectClass}>
            <option value="">Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
          <MdKeyboardArrowDown className="absolute right-3 top-1/2 -translate-y-1/2 admin-text-secondary pointer-events-none" size={16} />
        </div>

        <div className="relative min-w-[120px]">
          <select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} className={filterSelectClass}>
            <option value="">Course</option>
            {courseOptions.map((course) => <option key={course} value={course}>{course}</option>)}
          </select>
          <MdKeyboardArrowDown className="absolute right-3 top-1/2 -translate-y-1/2 admin-text-secondary pointer-events-none" size={16} />
        </div>

        <div className="relative min-w-[120px]">
          <select value={teacherFilter} onChange={(event) => setTeacherFilter(event.target.value)} className={filterSelectClass}>
            <option value="">Teacher</option>
            {teacherOptions.map((teacher) => <option key={teacher} value={teacher}>{teacher}</option>)}
          </select>
          <MdKeyboardArrowDown className="absolute right-3 top-1/2 -translate-y-1/2 admin-text-secondary pointer-events-none" size={16} />
        </div>

        <div className="relative flex items-center rounded-xl px-3 py-2 text-xs admin-text-primary min-w-[160px] border admin-surface border-[var(--admin-border)]">
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="bg-transparent border-none w-full text-xs admin-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 rounded-md cursor-pointer [color-scheme:var(--color-scheme)]"
          />
          <MdOutlineCalendarToday className="admin-text-secondary ml-2 pointer-events-none shrink-0" size={16} />
        </div>
      </div>

      <StudentTable
        students={displayedStudents}
        onViewProfile={handleOpenDrawer}
        onNotify={handleOpenNotifyModal}
        onEdit={(student) => {
          setStudentToModify(student);
          setIsAddModalOpen(true);
        }}
        onDelete={handleOpenDeleteModal}
        hasFilters={hasFilters}
        onClearFilters={handleClearFilters}
        isLoading={isLoading}
      />

      <StudentProfileDrawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} student={selectedStudent} />

      <AddStudentDrawer
        isOpen={isAddModalOpen}
        onClose={() => {
          handleCloseAddModal();
          setStudentToModify(null);
        }}
        studentToEdit={studentToModify}
        onAdd={handleSaveStudent}
      />

      <AnimatePresence>
        {isNotifyModalOpen && (
          <NotificationModal student={studentToModify} onClose={handleCloseNotifyModal} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteModalOpen && (
          <DeleteStudentModal
            student={studentToModify}
            onClose={handleCloseDeleteModal}
            onConfirm={() => handleDeleteStudent(studentToModify.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Students;
