const { prisma } = require('../config/db');

const percentage = (numerator, denominator) =>
  denominator ? Number(((numerator / denominator) * 100).toFixed(2)) : 0;

const monthSeries = (records, dateField, valueField, months = 6) => {
  const start = new Date();
  start.setMonth(start.getMonth() - (months - 1), 1);
  start.setHours(0, 0, 0, 0);
  const buckets = new Map();
  for (let index = 0; index < months; index += 1) {
    const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
    buckets.set(`${date.getFullYear()}-${date.getMonth()}`, {
      month: date.toLocaleString('en-US', { month: 'long' }),
      enrollments: 0,
      value: 0,
    });
  }
  records.forEach((record) => {
    const date = new Date(record[dateField]);
    const bucket = buckets.get(`${date.getFullYear()}-${date.getMonth()}`);
    if (bucket) {
      bucket.enrollments += 1;
      bucket.value += Number(valueField ? record[valueField] || 0 : 0);
    }
  });
  return [...buckets.values()];
};

const getDashboardSummary = async () => {
  const [totalUsers, activeUsers, totalCourses, publishedCourses, totalLessons, totalEnrollments,
    completedCourses, recentCourses, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'approved' } }),
    prisma.course.count(),
    prisma.course.count({ where: { status: 'approved' } }),
    prisma.lesson.count(),
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { status: 'completed' } }),
    prisma.course.findMany({ orderBy: { createdAt: 'desc' }, take: 3, select: { id: true, title: true, status: true, createdAt: true } }),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 3, select: { id: true, name: true, email: true, createdAt: true } }),
  ]);

  return {
    totalUsers, activeUsers, totalCourses, publishedCourses,
    draftCourses: totalCourses - publishedCourses,
    totalLessons, totalEnrollments, completedCourses,
    completionPercentage: percentage(completedCourses, totalEnrollments),
    recentlyAddedCourses: recentCourses.map(({ title, ...course }) => ({ ...course, name: title })),
    recentlyRegisteredUsers: recentUsers.map(({ createdAt, ...user }) => ({ ...user, registeredAt: createdAt })),
  };
};

const getCourseAnalytics = async (courseId) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { lessons: { orderBy: { order: 'asc' } }, enrollments: { include: { completedLessons: { select: { id: true } } } } },
  });
  if (!course) return null;
  const totalStudents = course.enrollments.length;
  const completedStudents = course.enrollments.filter((item) => item.status === 'completed').length;
  const completionCounts = new Map(course.lessons.map((lesson) => [lesson.id, 0]));
  course.enrollments.forEach((enrollment) => enrollment.completedLessons.forEach((lesson) => {
    completionCounts.set(lesson.id, (completionCounts.get(lesson.id) || 0) + 1);
  }));
  const ranked = course.lessons.map((lesson) => ({ lesson, views: completionCounts.get(lesson.id) || 0 }));
  const most = ranked.length ? [...ranked].sort((a, b) => b.views - a.views)[0] : null;
  const least = ranked.length ? [...ranked].sort((a, b) => a.views - b.views)[0] : null;
  return {
    courseName: course.title,
    totalStudents,
    completedStudents,
    completionPercentage: percentage(completedStudents, totalStudents),
    averageLearningTime: 0,
    averageProgress: totalStudents ? Number((course.enrollments.reduce((sum, item) => sum + item.progress, 0) / totalStudents).toFixed(2)) : 0,
    mostViewedLesson: most?.lesson.title || null,
    leastViewedLesson: least?.lesson.title || null,
    mostSkippedLesson: null,
    enrollmentTrend: monthSeries(course.enrollments, 'createdAt').map(({ month, enrollments }) => ({ month, enrollments })),
  };
};

const getUserAnalytics = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { enrollments: { include: { completedLessons: true } } } });
  if (!user) return null;
  const enrollments = user.enrollments;
  const coursesCompleted = enrollments.filter((item) => item.status === 'completed').length;
  return {
    coursesEnrolled: enrollments.length,
    coursesCompleted,
    completionRate: percentage(coursesCompleted, enrollments.length),
    learningHours: 0,
    lessonsCompleted: enrollments.reduce((sum, item) => sum + item.completedLessons.length, 0),
    currentActiveCourses: enrollments.filter((item) => item.status === 'active').length,
    lastLogin: null,
    averageDailyLearningTime: 0,
  };
};

const getAllCoursesReportData = async () => {
  const courses = await prisma.course.findMany({ select: { id: true, title: true, status: true } });
  return Promise.all(courses.map(async (course) => ({ id: course.id, name: course.title, status: course.status, ...await getCourseAnalytics(course.id) })));
};

const getAllUsersReportData = async () => {
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, status: true } });
  return Promise.all(users.map(async (user) => ({ ...user, ...await getUserAnalytics(user.id) })));
};

const getAllEnrollmentsReportData = async () => {
  const rows = await prisma.enrollment.findMany({ include: { user: { select: { name: true } }, course: { select: { title: true } } } });
  return rows.map((item) => ({ id: item.id, userName: item.user.name, courseName: item.course.title, progress: item.progress, status: item.status, learningTime: 0, enrolledAt: item.createdAt }));
};

const getAllProgressReportData = async () => {
  const rows = await prisma.enrollment.findMany({ include: { user: { select: { name: true } }, course: { include: { lessons: true } }, completedLessons: { select: { id: true } } } });
  return rows.flatMap((item) => item.course.lessons.map((lesson) => ({ userName: item.user.name, courseName: item.course.title, lessonId: lesson.id, lessonTitle: lesson.title, completed: item.completedLessons.some((done) => done.id === lesson.id) ? 'Yes' : 'No', enrolledAt: item.createdAt })));
};

const calculateAverageProgress = (items) => items?.length
  ? Number((items.reduce((sum, item) => sum + Number(item.progress || 0), 0) / items.length).toFixed(2))
  : 0;

const calculateAverageLearningTime = (items) => items?.length
  ? Number((items.reduce((sum, item) => sum + Number(item.learningTime || 0), 0) / items.length).toFixed(2))
  : 0;

const calculateActiveUsers = (users) => (users || []).filter((user) => user.status === 'approved').length;

module.exports = { calculateCompletionPercentage: percentage, calculateCompletionRate: percentage, calculateAverageProgress, calculateAverageLearningTime, calculateActiveUsers, getDashboardSummary, getCourseAnalytics, getUserAnalytics, getAllCoursesReportData, getAllUsersReportData, getAllEnrollmentsReportData, getAllProgressReportData };
