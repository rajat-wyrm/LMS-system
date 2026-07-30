import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MdRefresh, MdSearch } from 'react-icons/md';
import { apiRequest } from '../../../utils/api';
import StudentsHero from '../../../components/admin/students/StudentsHero';
import StudentAnalyticsCards from '../../../components/admin/students/StudentAnalyticsCards';
import StudentInsightsStrip from '../../../components/admin/students/StudentInsightsStrip';
import StudentTable from '../../../components/admin/students/StudentTable';

const normalizeStudent = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatar: user.avatar || null,
  enrolledCourse: user.enrolledCourse || 'No enrollment',
  mentorName: user.mentorName || null,
  progress: Number(user.progress || 0),
  status: user.status === 'approved' ? 'Active' : user.status === 'pending' ? 'Pending' : user.status === 'suspended' ? 'Suspended' : 'Inactive',
  joinedDate: user.createdAt ? new Date(user.createdAt).toISOString().slice(0, 10) : '',
  certificates: Number(user.certificates || 0),
  enrollmentsCount: Number(user.enrollmentsCount || 0),
});

const Students = () => {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest('/v1/admin/users?role=user&limit=1000');
      setStudents((result.data || []).map(normalizeStudent));
    } catch (requestError) {
      setStudents([]);
      setError(requestError.message || 'Unable to load students from the database.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const visibleStudents = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return students;
    return students.filter((student) => `${student.name} ${student.email} ${student.enrolledCourse}`.toLowerCase().includes(term));
  }, [students, query]);

  const growth = useMemo(() => {
    if (!students.length) return '0%';
    const threshold = new Date(); threshold.setDate(threshold.getDate() - 30);
    return `${Math.round((students.filter((student) => new Date(student.joinedDate) >= threshold).length / students.length) * 100)}%`;
  }, [students]);

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 border border-border shadow-sm bg-card/60 backdrop-blur-xl font-body">
      <StudentsHero totalCount={students.length.toLocaleString()} monthlyGrowth={growth} onAddStudent={() => {}} onExport={() => {}} onGenerateReport={() => {}} />
      <StudentAnalyticsCards students={students} />
      <StudentInsightsStrip students={students} />
      <div className="flex gap-3 items-center rounded-2xl p-4 border border-border bg-card/70">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search students, email, or course..." className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm border border-border bg-input" />
        </div>
        <button type="button" onClick={loadStudents} className="p-2.5 rounded-xl border border-border" title="Refresh students"><MdRefresh className={loading ? 'animate-spin' : ''} /></button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <StudentTable students={visibleStudents} onViewProfile={() => {}} onNotify={() => {}} onEdit={() => {}} onDelete={() => {}} hasFilters={Boolean(query)} onClearFilters={() => setQuery('')} />
    </div>
  );
};

export default Students;
