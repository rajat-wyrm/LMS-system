import {
  MdLibraryBooks,
  MdGroups,
  MdSchool,
  MdSettingsSuggest,
} from 'react-icons/md';

export const CATEGORY_META = {
  course: {
    label: 'Course',
    icon: MdLibraryBooks,
    color: '#3B82F6',
    rgb: '59,130,246',
  },
  student: {
    label: 'Student',
    icon: MdGroups,
    color: '#06B6D4',
    rgb: '6,182,212',
  },
  teacher: {
    label: 'Teacher',
    icon: MdSchool,
    color: '#8B5CF6',
    rgb: '139,92,246',
  },
  system: {
    label: 'System',
    icon: MdSettingsSuggest,
    color: '#F97316',
    rgb: '249,115,22',
  },
};

export const FILTERS = ['All', 'Unread', 'Read', 'Course', 'Student', 'Teacher', 'System'];

export const initialNotifications = [
  {
    id: 1,
    category: 'course',
    title: 'New Course Published',
    desc: 'React Native Development by Anushka Sharma is now live and open for enrollment.',
    time: '5 minutes ago',
    read: false,
  },
  {
    id: 2,
    category: 'student',
    title: 'New Student Registered',
    desc: 'Priya Patel enrolled in Python Foundations.',
    time: '18 minutes ago',
    read: false,
  },
  {
    id: 3,
    category: 'teacher',
    title: 'Teacher Application Submitted',
    desc: 'Rahul Verma applied to teach Advanced JavaScript. Review required.',
    time: '32 minutes ago',
    read: false,
  },
  {
    id: 4,
    category: 'system',
    title: 'System Update Scheduled',
    desc: 'Platform maintenance window tonight from 02:00–04:00 IST.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 5,
    category: 'course',
    title: 'Course Review Alert',
    desc: 'A 1-star review was submitted for CSS & UI Design. Instructor notified.',
    time: '2 hours ago',
    read: true,
  },
  {
    id: 6,
    category: 'student',
    title: 'Course Completion Milestone',
    desc: '500th student completed Full Stack Web Development today.',
    time: '3 hours ago',
    read: true,
  },
  {
    id: 7,
    category: 'teacher',
    title: 'Teacher Profile Updated',
    desc: 'MS Dhoni updated their instructor bio and course curriculum.',
    time: '5 hours ago',
    read: true,
  },
  {
    id: 8,
    category: 'system',
    title: 'Backup Completed',
    desc: 'Daily database backup finished successfully. All services running normally.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 9,
    category: 'student',
    title: 'Bulk Enrollment',
    desc: '28 new students joined via corporate partnership with Infosys.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 10,
    category: 'course',
    title: 'Curriculum Update Approved',
    desc: 'Module 4 of DSA with Java has been updated and approved.',
    time: '2 days ago',
    read: true,
  },
];
export const initialNotifications = [];
