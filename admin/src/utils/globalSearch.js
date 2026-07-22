import { initialTeachers } from './teacherUtils';
import { loadCourses } from './courseUtils';

const STUDENTS_KEY = 'lms_students_data';
const TEACHERS_KEY = 'lms_teachers_data';

const FALLBACK_STUDENTS = [
  { id: 1, name: 'Deepika Mishra', email: 'dipmish9898@gmail.com' },
  { id: 2, name: 'Rahul Sharma', email: 'rahul@gmail.com' },
];

export const SEARCH_CATEGORIES = ['Students', 'Teachers', 'Courses', 'Payments'];

const ROUTES = {
  student: '/dashboard/admin/students',
  teacher: '/dashboard/admin/teachers',
  course: '/dashboard/admin/courses',
  enrollment: '/dashboard/admin/students',
  certificate: '/dashboard/admin/analytics',
  payment: '/dashboard/admin/settings?tab=billing',
};

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function loadSearchSources() {
  const students = loadJson(STUDENTS_KEY, FALLBACK_STUDENTS);
  const teachers = loadJson(TEACHERS_KEY, initialTeachers);
  const courses = loadCourses();

  return {
    students,
    teachers,
    courses,
    enrollments: [],
    certificates: [],
    payments: [],
  };
}

function matchesQuery(text, q) {
  return text.toLowerCase().includes(q);
}

function makeResult({ id, type, category, title, subtitle, path }) {
  return { id: `${type}-${id}`, type, category, title, subtitle, path: path || ROUTES[type] };
}

export function searchGlobal(query, sources, limitPerCategory = 5) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results = [];

  sources.students.forEach((s) => {
    const title = s.name || s.fullName || 'Student';
    const subtitle = s.email || s.enrolledCourse || '';
    if (matchesQuery(`${title} ${subtitle}`, q)) {
      results.push(
        makeResult({
          id: s.id,
          type: 'student',
          category: 'Students',
          title,
          subtitle,
        })
      );
    }
  });

  sources.teachers.forEach((t) => {
    const title = t.name || 'Teacher';
    const subtitle = t.course || t.email || '';
    if (matchesQuery(`${title} ${subtitle} ${t.style || ''}`, q)) {
      results.push(
        makeResult({
          id: t.id,
          type: 'teacher',
          category: 'Teachers',
          title,
          subtitle,
        })
      );
    }
  });

  sources.courses.forEach((c) => {
    const title = c.title || c.name || 'Course';
    const subtitle = c.teacher || c.category || '';
    if (matchesQuery(`${title} ${subtitle}`, q)) {
      results.push(
        makeResult({
          id: c.id,
          type: 'course',
          category: 'Courses',
          title,
          subtitle,
        })
      );
    }
  });

  sources.enrollments.forEach((e) => {
    const title = `${e.studentName} → ${e.course}`;
    if (matchesQuery(title, q)) {
      results.push(
        makeResult({
          id: e.id,
          type: 'enrollment',
          category: 'Students',
          title: e.studentName,
          subtitle: `Enrolled in ${e.course}`,
        })
      );
    }
  });

  sources.certificates.forEach((c) => {
    const title = `Certificate — ${c.studentName}`;
    if (matchesQuery(`${title} ${c.course}`, q)) {
      results.push(
        makeResult({
          id: c.id,
          type: 'certificate',
          category: 'Courses',
          title: c.studentName,
          subtitle: `Certified: ${c.course}`,
          path: ROUTES.certificate,
        })
      );
    }
  });

  sources.payments.forEach((p) => {
    const title = p.name;
    const subtitle = `${p.amount} · ${p.status}`;
    if (matchesQuery(`${title} ${subtitle}`, q)) {
      results.push(
        makeResult({
          id: p.id,
          type: 'payment',
          category: 'Payments',
          title,
          subtitle,
        })
      );
    }
  });

  const grouped = {};
  SEARCH_CATEGORIES.forEach((cat) => {
    grouped[cat] = results.filter((r) => r.category === cat).slice(0, limitPerCategory);
  });

  return SEARCH_CATEGORIES.flatMap((cat) => grouped[cat]);
}

export function groupResultsByCategory(flatResults) {
  const map = {};
  SEARCH_CATEGORIES.forEach((cat) => {
    map[cat] = [];
  });
  flatResults.forEach((r) => {
    if (map[r.category]) map[r.category].push(r);
  });
  return map;
}
