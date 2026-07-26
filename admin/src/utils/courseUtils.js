export function parsePrice(price) {
  const value = Number(price);
  return Number.isFinite(value) ? value : 0;
}

export function computeRevenue(course) {
  return Number(course.revenue || 0);
}

export function getCourseHealth(course) {
  if (!course.active) return { label: 'Inactive', color: '#94A3B8', key: 'gray' };
  const completion = Number(course.completion || 0);
  if (completion >= 80) return { label: 'Healthy', color: '#10B981', key: 'green' };
  if (completion >= 60) return { label: 'At Risk', color: '#F59E0B', key: 'yellow' };
  return { label: 'Needs Attention', color: '#EF4444', key: 'red' };
}

// Maps the database response to the legacy presentation shape without inventing values.
export function normalizeCourse(course) {
  const students = Number(course.students ?? course._count?.enrollments ?? 0);
  return {
    ...course,
    shortDesc: course.shortDesc || course.description || '',
    fullDesc: course.fullDesc || course.description || '',
    teacher: course.teacher || course.instructor?.name || '',
    instructorId: course.instructorId || course.instructor?.id || '',
    lessons: Number(course.lessons ?? course._count?.lessons ?? 0),
    students,
    completion: Number(course.completion ?? 0),
    rating: Number(course.rating ?? 0),
    revenue: Number(course.revenue ?? 0),
    thumbnail: course.thumbnail || null,
    active: course.active ?? (course.status === 'approved' || course.status === 'Published'),
  };
}

// Local storage is not a data source. Kept only for legacy imports.
export const loadCourses = () => [];
export const getCategories = (courses) => [...new Set(courses.map((course) => course.category).filter(Boolean))];
export const formatRevenue = (value) => `$${Number(value || 0).toLocaleString()}`;
export const formatStudents = (value) => Number(value || 0).toLocaleString();
