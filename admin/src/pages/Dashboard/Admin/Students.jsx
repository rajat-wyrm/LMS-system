import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  MdSearch,
  MdOutlineCalendarToday,
  MdKeyboardArrowDown,
} from 'react-icons/md';
import { exportToCSV } from '../../../utils/export';

import StudentsHero from '../../../components/admin/students/StudentsHero';
import StudentAnalyticsCards from '../../../components/admin/students/StudentAnalyticsCards';
import StudentInsightsStrip from '../../../components/admin/students/StudentInsightsStrip';
import StudentTable from '../../../components/admin/students/StudentTable';
import StudentProfileDrawer from '../../../components/admin/students/StudentProfileDrawer';
import AddStudentDrawer from '../../../components/admin/students/AddStudentDrawer';
import NotificationModal from '../../../components/admin/students/NotificationModal';
import DeleteStudentModal from '../../../components/admin/students/DeleteStudentModal';

const initialStudents = [
  {
    id: 1,
    name: 'Deepika Mishra',
    email: 'dipmish9898@gmail.com',
    avatar: '/owl_avatar.png',
    enrolledCourse: 'DSA with Java',
    mentorName: 'MS Dhoni',
    progress: 72,
    status: 'Active',
    joinedDate: '2026-05-15',
    badge: 'Top Learner',
    phone: '+91 98765 43210',
    plan: 'Pro Plan',
    xp: 4200,
    lastActive: '2h ago',
    certificates: 3,
    streak: 14,
  },
  {
    id: 2,
    name: 'Rahul Mishra',
    email: 'rahul@gmail.com',
    avatar: null,
    enrolledCourse: 'MERN',
    mentorName: 'Alia Bhatt',
    progress: 48,
    status: 'Active',
    joinedDate: '2026-05-18',
    badge: 'Quiz Master',
    phone: '+91 87654 32109',
    plan: 'Premium Plan',
    xp: 3100,
    lastActive: '5h ago',
    certificates: 2,
    streak: 9,
  },
  {
    id: 3,
    name: 'john',
    email: 'john.doe@gmail.com',
    avatar: '/owl_avatar.png',
    enrolledCourse: 'DSA with Java',
    mentorName: 'Salman Khan',
    progress: 23,
    status: 'Completed',
    joinedDate: '2026-05-10',
    badge: 'Top Learner',
    phone: '+91 76543 21098',
    plan: 'Basic Plan',
    xp: 1800,
    lastActive: '1d ago',
    certificates: 1,
    streak: 4,
  },
  {
    id: 4,
    name: 'Anjali Verma',
    email: 'anjali.verma@gmail.com',
    avatar: null,
    enrolledCourse: 'Python Basics',
    mentorName: 'Katrina Kaif',
    progress: 12,
    status: 'Pending',
    joinedDate: '2026-04-20',
    badge: 'Quiz Master',
    phone: '+91 65432 10987',
    plan: 'Basic Plan',
    xp: 1200,
    lastActive: '8d ago',
    certificates: 0,
    streak: 1,
  },
];

const filterSelectClass =
  'w-full rounded-xl py-2.5 pl-4 pr-10 text-xs admin-text-primary focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all cursor-pointer appearance-none border bg-[var(--admin-surface)] border-[var(--admin-border)]';
const filterInputClass =
  'w-full rounded-xl py-2.5 pl-10 pr-4 text-xs admin-text-primary placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all border bg-[var(--admin-surface)] border-[var(--admin-border)]';

const Students = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const filter = searchParams.get('filter');

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('lms_students_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialStudents;
      }
    }
    return initialStudents;
  });

  React.useEffect(() => {
    localStorage.setItem('lms_students_data', JSON.stringify(students));
  }, [students]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [badgeFilter, setBadgeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const displayedStudents = useMemo(
    () =>
      students.filter((student) => {
        const matchesSearch =
          searchQuery === '' ||
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.enrolledCourse.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === '' || student.status === statusFilter;
        const matchesCourse =
          courseFilter === '' ||
          student.enrolledCourse.toLowerCase().includes(courseFilter.toLowerCase());
        const matchesTeacher = teacherFilter === '' || student.mentorName === teacherFilter;
        const matchesBadge = badgeFilter === '' || student.badge === badgeFilter;
        const matchesDate = dateFilter === '' || student.joinedDate.includes(dateFilter);

        let matchesRoute = true;
        if (filter === 'active') matchesRoute = student.status === 'Active';
        else if (filter === 'new') matchesRoute = student.joinedDate.includes('2026-05');
        else if (filter === 'analytics') matchesRoute = student.progress > 80;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesCourse &&
          matchesTeacher &&
          matchesBadge &&
          matchesDate &&
          matchesRoute
        );
      }),
    [
      students,
      searchQuery,
      statusFilter,
      courseFilter,
      teacherFilter,
      badgeFilter,
      dateFilter,
      filter,
    ]
  );

  const monthlyGrowth = useMemo(() => {
    const thisMonth = students.filter((s) => s.joinedDate?.includes('2026-05')).length;
    if (students.length === 0) return '0%';
    const pct = Math.round((thisMonth / students.length) * 100);
    return `+${pct}%`;
  }, [students]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToModify, setStudentToModify] = useState(null);

  const handleOpenDrawer = (student) => {
    setSelectedStudent(student);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedStudent(null), 300);
  };

  const handleOpenAddModal = () => setIsAddModalOpen(true);
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

  const handleDeleteStudent = (id) => {
    setStudents(students.filter((s) => s.id !== id));
    handleCloseDeleteModal();
    if (selectedStudent?.id === id) handleCloseDrawer();
  };

  const handleExport = () => {
    exportToCSV(
      displayedStudents,
      [
        'name',
        'email',
        'phone',
        'enrolledCourse',
        'mentorName',
        'plan',
        'status',
        'joinedDate',
        'progress',
        'xp',
        'lastActive',
        'certificates',
        'streak',
      ],
      'lms-students.csv'
    );
  };

  const handleGenerateReport = () => {
    const active = students.filter((s) => s.status === 'Active').length;
    const avgProgress =
      students.length > 0
        ? Math.round(students.reduce((sum, s) => sum + (s.progress ?? 0), 0) / students.length)
        : 0;
    const report = [
      {
        reportDate: new Date().toISOString().split('T')[0],
        totalStudents: students.length,
        activeStudents: active,
        averageCompletion: `${avgProgress}%`,
        filteredCount: displayedStudents.length,
      },
    ];
    exportToCSV(
      report,
      ['reportDate', 'totalStudents', 'activeStudents', 'averageCompletion', 'filteredCount'],
      'lms-students-report.csv'
    );
  };

  return (
    <div className="admin-page space-y-6 md:space-y-8 animate-fade-in relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
      <StudentsHero
        totalCount={students.length.toLocaleString()}
        monthlyGrowth={monthlyGrowth}
        onAddStudent={handleOpenAddModal}
        onExport={handleExport}
        onGenerateReport={handleGenerateReport}
      />

      <StudentAnalyticsCards students={students} />

      <StudentInsightsStrip students={students} />

      <div className="relative z-10 flex flex-wrap gap-3 items-center rounded-2xl p-4 border shadow-lg admin-surface border-[var(--admin-border)]">
        <div className="relative min-w-[200px] flex-1">
          <MdSearch
            className="absolute left-3.5 top-1/2 -translate-y-1/2 admin-text-secondary"
            size={18}
          />
          <input
            type="text"
            placeholder="Search students, email, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={filterInputClass}
          />
        </div>

        <div className="relative min-w-[110px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={filterSelectClass}
          >
            <option value="">Status</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>
          <MdKeyboardArrowDown
            className="absolute right-3 top-1/2 -translate-y-1/2 admin-text-secondary pointer-events-none"
            size={16}
          />
        </div>

        <div className="relative min-w-[120px]">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className={filterSelectClass}
          >
            <option value="">Course</option>
            <option value="DSA with Java">DSA with Java</option>
            <option value="MERN">MERN</option>
            <option value="Python">Python</option>
            <option value="C++">C++</option>
            <option value="HTML">HTML</option>
            <option value="CSS">CSS</option>
            <option value="JavaScript">JavaScript</option>
            <option value="ReactJS">ReactJS</option>
          </select>
          <MdKeyboardArrowDown
            className="absolute right-3 top-1/2 -translate-y-1/2 admin-text-secondary pointer-events-none"
            size={16}
          />
        </div>

        <div className="relative min-w-[120px]">
          <select
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
            className={filterSelectClass}
          >
            <option value="">Teacher</option>
            <option value="MS Dhoni">MS Dhoni</option>
            <option value="Alia Bhatt">Alia Bhatt</option>
            <option value="Salman Khan">Salman Khan</option>
            <option value="Katrina Kaif">Katrina Kaif</option>
            <option value="Anushka Sharma">Anushka Sharma</option>
            <option value="Virat Kohli">Virat Kohli</option>
            <option value="Sachin Tendulkar">Sachin Tendulkar</option>
          </select>
          <MdKeyboardArrowDown
            className="absolute right-3 top-1/2 -translate-y-1/2 admin-text-secondary pointer-events-none"
            size={16}
          />
        </div>

        <div className="relative min-w-[110px]">
          <select
            value={badgeFilter}
            onChange={(e) => setBadgeFilter(e.target.value)}
            className={filterSelectClass}
          >
            <option value="">Badge</option>
            <option value="Top Learner">Top Learner</option>
            <option value="Quiz Master">Quiz Master</option>
          </select>
          <MdKeyboardArrowDown
            className="absolute right-3 top-1/2 -translate-y-1/2 admin-text-secondary pointer-events-none"
            size={16}
          />
        </div>

        <div className="relative flex items-center rounded-xl px-3 py-2 text-xs admin-text-primary min-w-[160px] border admin-surface border-[var(--admin-border)]">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-transparent border-none w-full text-xs admin-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 rounded-md cursor-pointer [color-scheme:var(--color-scheme)]"
          />
          <MdOutlineCalendarToday
            className="admin-text-secondary ml-2 pointer-events-none shrink-0"
            size={16}
          />
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
      />

      <StudentProfileDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        student={selectedStudent}
      />

      <AddStudentDrawer
        isOpen={isAddModalOpen}
        onClose={() => {
          handleCloseAddModal();
          setStudentToModify(null);
        }}
        studentToEdit={studentToModify}
        onAdd={(newStudent) => {
          if (studentToModify) {
            setStudents(
              students.map((s) =>
                s.id === studentToModify.id ? { ...s, ...newStudent } : s
              )
            );
          } else {
            setStudents([
              {
                ...newStudent,
                id: Date.now(),
                lastActive: 'Just now',
                certificates: 0,
                streak: 1,
              },
              ...students,
            ]);
          }
          handleCloseAddModal();
          setStudentToModify(null);
        }}
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
