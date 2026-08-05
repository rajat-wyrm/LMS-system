export const TEACHERS_SEED = [
  'Salman Khan',
  'Virat Kohli',
  'Sachin Tendulkar',
  'Anushka Sharma',
  'Katrina Kaif',
  'MS Dhoni',
  'Alia Bhatt',
];

export const initialCourses = [
  {
    id: 1,
    title: 'Advanced React Patterns',
    level: 'Intermediate',
    xp: '1500 XP',
    category: 'Web Development',
    lessons: 12,
    rating: 4.9,
    students: 1240,
    completion: 87,
    hours: 32,
    active: true,
    teacher: 'Anushka Sharma',
    price: '499',
    revenue: 186200,
    thumbnail: null,
    gradient: 'from-blue-600 via-blue-500 to-cyan-400',
    icon: '⚛️',
  },
  {
    id: 2,
    title: 'Python for Machine Learning',
    level: 'Advanced',
    xp: '2500 XP',
    category: 'AI & ML',
    lessons: 24,
    rating: 4.8,
    students: 3420,
    completion: 73,
    hours: 58,
    active: true,
    teacher: 'Sachin Tendulkar',
    price: '799',
    revenue: 412800,
    thumbnail: null,
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    icon: '🐍',
  },
  {
    id: 3,
    title: 'Fullstack MERN Guide',
    level: 'Beginner',
    xp: '1000 XP',
    category: 'Web Development',
    lessons: 15,
    rating: 4.7,
    students: 2100,
    completion: 91,
    hours: 24,
    active: true,
    teacher: 'Virat Kohli',
    price: '399',
    revenue: 251300,
    thumbnail: null,
    gradient: 'from-emerald-500 via-teal-500 to-green-400',
    icon: '🌐',
  },
  {
    id: 4,
    title: 'Data Structures in Java',
    level: 'Advanced',
    xp: '3000 XP',
    category: 'DSA',
    lessons: 30,
    rating: 4.9,
    students: 5100,
    completion: 65,
    hours: 72,
    active: true,
    teacher: 'Salman Khan',
    price: '599',
    revenue: 528900,
    thumbnail: null,
    gradient: 'from-purple-600 via-violet-500 to-pink-500',
    icon: '🔢',
  },
  {
    id: 5,
    title: 'UI/UX Design Systems',
    level: 'Beginner',
    xp: '800 XP',
    category: 'Design',
    lessons: 8,
    rating: 4.6,
    students: 980,
    completion: 94,
    hours: 16,
    active: false,
    teacher: 'Katrina Kaif',
    price: '299',
    revenue: 88200,
    thumbnail: null,
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    icon: '🎨',
  },
  {
    id: 6,
    title: 'Mastering Next.js 14',
    level: 'Intermediate',
    xp: '1800 XP',
    category: 'Web Development',
    lessons: 18,
    rating: 4.9,
    students: 1890,
    completion: 78,
    hours: 40,
    active: true,
    teacher: 'Anushka Sharma',
    price: '549',
    revenue: 198450,
    thumbnail: null,
    gradient: 'from-slate-600 via-slate-500 to-gray-400',
    icon: '▲',
  },
  {
    id: 7,
    title: 'CSS & Tailwind Mastery',
    level: 'Beginner',
    xp: '900 XP',
    category: 'Design',
    lessons: 10,
    rating: 4.7,
    students: 1560,
    completion: 88,
    hours: 20,
    active: true,
    teacher: 'Katrina Kaif',
    price: '349',
    revenue: 163800,
    thumbnail: null,
    gradient: 'from-cyan-500 via-sky-500 to-blue-500',
    icon: '💅',
  },
  {
    id: 8,
    title: 'Cloud & DevOps Essentials',
    level: 'Expert',
    xp: '4000 XP',
    category: 'DevOps',
    lessons: 36,
    rating: 4.8,
    students: 720,
    completion: 55,
    hours: 90,
    active: true,
    teacher: 'Virat Kohli',
    price: '899',
    revenue: 194400,
    thumbnail: null,
    gradient: 'from-indigo-600 via-purple-600 to-blue-500',
    icon: '☁️',
  },
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
  if (!course.active) return { label: 'Inactive', color: '#94A3B8', key: 'gray' };
  const pct = course.completion ?? 0;
  if (pct >= 80) return { label: 'Healthy', color: '#10B981', key: 'green' };
  if (pct >= 60) return { label: 'At Risk', color: '#F59E0B', key: 'yellow' };
  return { label: 'Needs Attention', color: '#EF4444', key: 'red' };
}

export function normalizeCourse(c, index = 0) {
  const seed = initialCourses[index % initialCourses.length];
  const merged = { ...seed, ...c };
  const students = merged.students ?? seed.students ?? 0;
  const completion = merged.completion ?? seed.completion ?? 0;
  const rating = merged.rating ?? seed.rating ?? 4.5;
  const teacher =
    merged.teacher || TEACHERS_SEED[index % TEACHERS_SEED.length] || 'Unassigned';
  const revenue = computeRevenue({ ...merged, students });

  return {
    ...merged,
    students,
    completion,
    rating,
    teacher,
    revenue,
    thumbnail: merged.thumbnail ?? merged.avatar ?? null,
    gradient: merged.gradient || seed.gradient,
    icon: merged.icon || seed.icon,
    active: merged.active ?? merged.status === 'Published',
  };
}

export function loadCourses() {
  try {
    const stored = localStorage.getItem('lms_courses_data');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((c, i) => normalizeCourse(c, i));
      }
    }
  } catch (e) {
    console.error('Failed to load courses from localStorage:', e);
  }
  return initialCourses.map((c, i) => normalizeCourse(c, i));
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
