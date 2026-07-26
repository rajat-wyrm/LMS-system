export const TEACHERS_SEED = [];
export const initialCourses = [];

export function parsePrice(price) {
  if (price == null || price === '') return 0;
  const n = parseFloat(String(price).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function computeRevenue(course) {
  if (course.revenue != null) return course.revenue;
  const unit = parsePrice(course.discountPrice || course.price);
  const students = course.students || 0;
  return Math.round(unit * students);
}

export function getCourseHealth(course) {
  if (!course.active) return { label: 'Inactive', color: '#94A3B8', key: 'gray' };
  const pct = course.completion ?? 0;
  if (pct >= 80) return { label: 'Healthy', color: '#10B981', key: 'green' };
  if (pct >= 60) return { label: 'At Risk', color: '#F59E0B', key: 'yellow' };
  return { label: 'Needs Attention', color: '#EF4444', key: 'red' };
}

export function normalizeCourse(c) {
  const students = c.students ?? c._count?.enrollments ?? 0;
  const lessons = Array.isArray(c.lessons) ? c.lessons.length : c.lessons ?? c._count?.lessons ?? 0;
  const completed = c.enrollments?.filter((enrollment) => enrollment.status === 'completed').length ?? 0;
  const completion = students > 0 ? Math.round((completed / students) * 100) : c.completion ?? 0;
  const status = c.status === 'approved' ? 'Published' : c.status === 'pending' ? 'Draft' : 'Archived';

  return {
    ...c,
    lessons,
    students,
    completion,
    rating: c.rating ?? 0,
    teacher: c.instructor?.name || c.teacher || '',
    instructorId: c.instructorId || c.instructor?.id || '',
    revenue: computeRevenue({ ...c, students }),
    thumbnail: c.thumbnail ?? c.avatar ?? null,
    gradient: c.gradient || 'from-slate-700 via-slate-600 to-slate-500',
    icon: c.icon || '📚',
    active: c.active ?? c.status === 'approved',
    status,
    shortDesc: c.shortDesc || c.description || '',
    fullDesc: c.fullDesc || c.description || '',
    hours: parseInt(c.duration, 10) || 0,
    price: c.price ?? 0,
  };
}

export function loadCourses() {
  return [];
}

export function formatRevenue(n) {
  if (n >= 1000000) return `₹${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

export function formatStudents(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export function getCategories(courses) {
  return [...new Set(courses.map((c) => c.category).filter(Boolean))];
}
