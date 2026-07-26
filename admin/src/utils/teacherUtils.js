export const COLORS = [
  { label: 'Blue Indigo', value: 'from-blue-600 to-indigo-600' },
  { label: 'Red Orange', value: 'from-red-500 to-orange-500' },
  { label: 'Yellow Amber', value: 'from-yellow-400 to-amber-600' },
  { label: 'Pink Rose', value: 'from-pink-500 to-rose-500' },
  { label: 'Purple Pink', value: 'from-purple-500 to-pink-500' },
];

export const initialTeachers = [];

export function normalizeTeacher(t, index = 0) {
  const color = t.color || COLORS[index % COLORS.length].value;
  return {
    ...t,
    style: t.style || t.bio || '',
    course: t.course || t.courses?.[0]?.title || '',
    courses: typeof t.courses === 'number' ? t.courses : t.courses?.length ?? 0,
    enabled: t.enabled ?? t.status === 'approved',
    color,
    students: t.students ?? 0,
    rating: t.rating ?? 0,
    revenue: t.revenue ?? 0,
    bio: t.bio || '',
    joinDate: t.joinDate || t.createdAt || '',
    photo: t.photo || t.avatar || null,
    verified: t.verified ?? t.status === 'approved',
    featured: t.featured ?? (t.students ?? 0) > 0,
    topMentor: t.topMentor ?? (t.students ?? 0) > 0,
  };
}

export function loadTeachers() {
  return [];
}

export function formatRevenue(n) {
  if (n >= 1000000) return `₹${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

export function formatStudents(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}
