export const COLORS = [
  { label: 'Blue Indigo', value: 'from-blue-600 to-indigo-600' },
  { label: 'Red Orange', value: 'from-red-500 to-orange-500' },
  { label: 'Yellow Amber', value: 'from-yellow-400 to-amber-600' },
  { label: 'Pink Rose', value: 'from-pink-500 to-rose-500' },
  { label: 'Purple Pink', value: 'from-purple-500 to-pink-500' },
];

export function normalizeTeacher(teacher, index = 0) {
  const color = COLORS[index % COLORS.length]?.value || COLORS[0].value;

  return {
    id: teacher.id,
    name: teacher.name || '',
    email: teacher.email || '',
    bio: teacher.bio || '',
    style: teacher.bio || 'Instructor profile',
    status: teacher.status || 'pending',
    enabled: teacher.status === 'approved',
    avatar: teacher.avatar || null,
    photo: teacher.avatar || null,
    joinDate: teacher.joinDate
      ? new Date(teacher.joinDate).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        })
      : 'N/A',
    courses: Number(teacher.courses || 0),
    activeCourses: Number(teacher.activeCourses || 0),
    students: Number(teacher.students || 0),
    revenue: Number(teacher.revenue || 0),
    rating: Number(teacher.rating || 0).toFixed(1),
    verified: teacher.status === 'approved',
    featured: false,
    topMentor: false,
    color,
  };
}

export function formatRevenue(n) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

export function formatStudents(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}
