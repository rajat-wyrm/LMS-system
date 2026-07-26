import { apiRequest } from './api';

export const SEARCH_CATEGORIES = ['Students', 'Teachers', 'Courses'];

const ROUTES = {
  student: '/dashboard/admin/students',
  teacher: '/dashboard/admin/teachers',
  course: '/dashboard/admin/courses',
};

function makeResult({ id, type, category, title, subtitle, path }) {
  return { id: `${type}-${id}`, type, category, title, subtitle, path: path || ROUTES[type] };
}

export async function loadSearchSources() {
  const [students, teachers, courses] = await Promise.all([
    apiRequest('/v1/admin/users?role=user&limit=1000'),
    apiRequest('/v1/admin/instructors?limit=1000'),
    apiRequest('/v1/admin/courses?limit=1000'),
  ]);

  return {
    students: students.data || [],
    teachers: teachers.data || [],
    courses: courses.data || [],
  };
}

function matchesQuery(text, q) {
  return text.toLowerCase().includes(q);
}

export function searchGlobal(query, sources, limitPerCategory = 5) {
  const q = query.trim().toLowerCase();
  if (!q || !sources) return [];

  const results = [];

  (sources.students || []).forEach((student) => {
    const title = student.name || 'Student';
    const subtitle = student.email || student.enrolledCourse || '';
    if (matchesQuery(`${title} ${subtitle}`, q)) {
      results.push(makeResult({
        id: student.id,
        type: 'student',
        category: 'Students',
        title,
        subtitle,
      }));
    }
  });

  (sources.teachers || []).forEach((teacher) => {
    const title = teacher.name || 'Teacher';
    const subtitle = teacher.email || '';
    if (matchesQuery(`${title} ${subtitle}`, q)) {
      results.push(makeResult({
        id: teacher.id,
        type: 'teacher',
        category: 'Teachers',
        title,
        subtitle,
      }));
    }
  });

  (sources.courses || []).forEach((course) => {
    const title = course.title || course.name || 'Course';
    const subtitle = course.instructor?.name || course.teacher || course.category || '';
    if (matchesQuery(`${title} ${subtitle}`, q)) {
      results.push(makeResult({
        id: course.id,
        type: 'course',
        category: 'Courses',
        title,
        subtitle,
      }));
    }
  });

  return SEARCH_CATEGORIES.flatMap((category) =>
    results.filter((result) => result.category === category).slice(0, limitPerCategory),
  );
}

export function groupResultsByCategory(flatResults) {
  const map = {};
  SEARCH_CATEGORIES.forEach((category) => {
    map[category] = [];
  });
  flatResults.forEach((result) => {
    if (map[result.category]) map[result.category].push(result);
  });
  return map;
}
