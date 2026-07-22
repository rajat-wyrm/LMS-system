export const TEACHERS_SEED = [
  'Salman Khan',
  'Virat Kohli',
  'Sachin Tendulkar',
  'Anushka Sharma',
  'Katrina Kaif',
  'MS Dhoni',
  'Alia Bhatt',
];

export function parsePrice(price) {
  if (price == null || price === '') return 0;
  const n = parseFloat(String(price).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function computeRevenue(course) {
  if (course.revenue != null && course.revenue > 0) return course.revenue;
  const unit = parsePrice(course.discountPrice || course.price);
  const students = course.students || 0;
  return Math.round(unit * students * 0.42);
}

export function getCourseHealth(course) {
  const isActive = course.active ?? (course.status === 'approved' || course.status === 'Published');
  if (!isActive) return { label: 'Inactive', color: '#94A3B8', key: 'gray' };
  const pct = course.completion ?? 0;
  if (pct >= 80) return { label: 'Healthy', color: '#10B981', key: 'green' };
  if (pct >= 60) return { label: 'At Risk', color: '#F59E0B', key: 'yellow' };
  return { label: 'Needs Attention', color: '#EF4444', key: 'red' };
}

export function normalizeCourse(c, index = 0) {
  const merged = { ...c };
  const students = merged.students ?? merged._count?.enrollments ?? 0;
  const completion = merged.completion ?? 0;
  const rating = merged.rating ?? 4.5;
  const teacher = merged.teacher || merged.celebrityTeacher || merged.instructor?.name || TEACHERS_SEED[index % TEACHERS_SEED.length] || 'Unassigned';
  const revenue = computeRevenue({ ...merged, students });

  return {
    ...merged,
    students,
    completion,
    rating,
    teacher,
    revenue,
    thumbnail: merged.thumbnail ?? merged.avatar ?? null,
    gradient: merged.gradient || 'from-blue-600 via-blue-500 to-cyan-400',
    icon: merged.icon || '📚',
    active: merged.active ?? (merged.status === 'approved' || merged.status === 'Published'),
    status: merged.status || 'approved',
  };
}

export function loadCourses() {
  return [];
}

export function formatRevenue(n) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n}`;
}

export function formatStudents(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export function getCategories(courses) {
  return [...new Set(courses.map((c) => c.category).filter(Boolean))];
}
