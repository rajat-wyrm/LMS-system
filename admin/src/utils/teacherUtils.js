export const COLORS = [
  { label: 'Blue Indigo', value: 'from-blue-600 to-indigo-600' },
  { label: 'Red Orange', value: 'from-red-500 to-orange-500' },
  { label: 'Yellow Amber', value: 'from-yellow-400 to-amber-600' },
  { label: 'Pink Rose', value: 'from-pink-500 to-rose-500' },
  { label: 'Purple Pink', value: 'from-purple-500 to-pink-500' },
];

export const initialTeachers = [
  {
    id: 1,
    name: 'Salman Khan',
    style: 'Action-Packed & Fun',
    course: 'DSA with Java',
    courses: 4,
    enabled: true,
    color: 'from-blue-600 to-indigo-600',
    students: 1204,
    rating: 4.8,
    revenue: 84200,
    bio: 'Bhai of Bollywood bringing action-packed coding to your screens.',
    joinDate: 'Jan 12, 2024',
    email: 'salman@uptoskills.com',
    phone: '+91 9876543210',
    photo: 'https://i.pravatar.cc/150?u=salman',
    verified: true,
    featured: true,
    topMentor: false,
  },
  {
    id: 2,
    name: 'Virat Kohli',
    style: 'Aggressive & Performance',
    course: 'JavaScript Mastery',
    courses: 6,
    enabled: true,
    color: 'from-red-500 to-orange-500',
    students: 3402,
    rating: 4.9,
    revenue: 198500,
    bio: 'Master the pitch and the code with pure performance.',
    joinDate: 'Feb 10, 2024',
    email: 'virat@uptoskills.com',
    phone: '+91 9876543211',
    photo: 'https://i.pravatar.cc/150?u=virat',
    verified: true,
    featured: true,
    topMentor: true,
  },
  {
    id: 3,
    name: 'Sachin Tendulkar',
    style: 'Textbook Perfection',
    course: 'Python Foundations',
    courses: 5,
    enabled: true,
    color: 'from-yellow-400 to-amber-600',
    students: 5120,
    rating: 5.0,
    revenue: 312400,
    bio: 'God of cricket teaching the textbook perfection of Python.',
    joinDate: 'Mar 05, 2024',
    email: 'sachin@uptoskills.com',
    phone: '+91 9876543212',
    photo: 'https://i.pravatar.cc/150?u=sachin',
    verified: true,
    featured: true,
    topMentor: true,
  },
  {
    id: 4,
    name: 'Anushka Sharma',
    style: 'Charming & Expressive',
    course: 'ReactJS',
    courses: 3,
    enabled: true,
    color: 'from-pink-500 to-rose-500',
    students: 2310,
    rating: 4.7,
    revenue: 156800,
    bio: 'Bringing charm and expressiveness to frontend development.',
    joinDate: 'Apr 18, 2024',
    email: 'anushka@uptoskills.com',
    phone: '+91 9876543213',
    photo: 'https://i.pravatar.cc/150?u=anushka',
    verified: true,
    featured: false,
    topMentor: false,
  },
  {
    id: 5,
    name: 'Katrina Kaif',
    style: 'Graceful & Direct',
    course: 'CSS & UI Design',
    courses: 2,
    enabled: false,
    color: 'from-purple-500 to-pink-500',
    students: 1890,
    rating: 4.6,
    revenue: 98400,
    bio: 'Graceful UI design principles taught directly by Katrina.',
    joinDate: 'May 20, 2024',
    email: 'katrina@uptoskills.com',
    phone: '+91 9876543214',
    photo: 'https://i.pravatar.cc/150?u=katrina',
    verified: false,
    featured: false,
    topMentor: false,
  },
];

export function normalizeTeacher(t, index = 0) {
  const seed = initialTeachers[index % initialTeachers.length];
  return {
    ...seed,
    ...t,
    courses: t.courses ?? (t.course ? 1 : seed.courses),
    revenue: t.revenue ?? seed.revenue ?? 50000 + index * 12000,
    verified: t.verified ?? seed.verified ?? false,
    featured: t.featured ?? seed.featured ?? false,
    topMentor: t.topMentor ?? seed.topMentor ?? false,
  };
}

export function loadTeachers() {
  const saved = localStorage.getItem('lms_teachers_data');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((t, i) => normalizeTeacher(t, i));
    } catch {
      return initialTeachers;
    }
  }
  return initialTeachers;
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
