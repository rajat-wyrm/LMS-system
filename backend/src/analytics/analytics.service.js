const { prisma } = require('../config/db');
const pct = (value, total) => total ? Number(((value / total) * 100).toFixed(2)) : 0;

const getDashboardSummary = async () => {
  const [totalUsers, activeUsers, totalCourses, publishedCourses, totalLessons, totalEnrollments, completedCourses, courses, users] = await Promise.all([
    prisma.user.count(), prisma.user.count({ where: { status: 'approved' } }), prisma.course.count(),
    prisma.course.count({ where: { status: 'approved' } }), prisma.lesson.count(), prisma.enrollment.count(),
    prisma.enrollment.count({ where: { status: 'completed' } }),
    prisma.course.findMany({ take: 3, orderBy: { createdAt: 'desc' }, select: { id: true, title: true, status: true, createdAt: true } }),
    prisma.user.findMany({ take: 3, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, createdAt: true } }),
  ]);
  return { totalUsers, activeUsers, totalCourses, publishedCourses, draftCourses: totalCourses - publishedCourses, totalLessons, totalEnrollments, completedCourses, completionPercentage: pct(completedCourses, totalEnrollments), recentlyAddedCourses: courses.map(({ title, ...row }) => ({ ...row, name: title })), recentlyRegisteredUsers: users.map(({ createdAt, ...row }) => ({ ...row, registeredAt: createdAt })) };
};

const getCourseAnalytics = async (courseId) => {
  const course = await prisma.course.findUnique({ where: { id: courseId }, include: { lessons: true, enrollments: { include: { completedLessons: true } } } });
  if (!course) return null;
  const totalStudents = course.enrollments.length;
  const completedStudents = course.enrollments.filter((row) => row.status === 'completed').length;
  const completions = new Map(course.lessons.map((lesson) => [lesson.id, 0]));
  course.enrollments.forEach((row) => row.completedLessons.forEach((lesson) => completions.set(lesson.id, (completions.get(lesson.id) || 0) + 1)));
  const lessons = course.lessons.map((lesson) => ({ title: lesson.title, views: completions.get(lesson.id) || 0 })).sort((a, b) => b.views - a.views);
  return { courseName: course.title, totalStudents, completedStudents, completionPercentage: pct(completedStudents, totalStudents), averageLearningTime: 0, averageProgress: totalStudents ? Number((course.enrollments.reduce((sum, row) => sum + row.progress, 0) / totalStudents).toFixed(2)) : 0, mostViewedLesson: lessons[0]?.title || null, leastViewedLesson: lessons.at(-1)?.title || null, mostSkippedLesson: null, enrollmentTrend: [] };
};

const getUserAnalytics = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { enrollments: { include: { completedLessons: true } } } });
  if (!user) return null;
  const coursesCompleted = user.enrollments.filter((row) => row.status === 'completed').length;
  return { coursesEnrolled: user.enrollments.length, coursesCompleted, completionRate: pct(coursesCompleted, user.enrollments.length), learningHours: 0, lessonsCompleted: user.enrollments.reduce((sum, row) => sum + row.completedLessons.length, 0), currentActiveCourses: user.enrollments.filter((row) => row.status === 'active').length, lastLogin: null, averageDailyLearningTime: 0 };
};
const getAllCoursesReportData = async () => Promise.all((await prisma.course.findMany({ select: { id: true, title: true, status: true } })).map(async (row) => ({ id: row.id, name: row.title, status: row.status, ...await getCourseAnalytics(row.id) })));
const getAllUsersReportData = async () => Promise.all((await prisma.user.findMany({ select: { id: true, name: true, email: true, status: true } })).map(async (row) => ({ ...row, ...await getUserAnalytics(row.id) })));
const getAllEnrollmentsReportData = async () => (await prisma.enrollment.findMany({ include: { user: { select: { name: true } }, course: { select: { title: true } } } })).map((row) => ({ id: row.id, userName: row.user.name, courseName: row.course.title, progress: row.progress, status: row.status, learningTime: 0, enrolledAt: row.createdAt }));
const getAllProgressReportData = async () => (await prisma.enrollment.findMany({ include: { user: { select: { name: true } }, course: { include: { lessons: true } }, completedLessons: true } })).flatMap((row) => row.course.lessons.map((lesson) => ({ userName: row.user.name, courseName: row.course.title, lessonId: lesson.id, lessonTitle: lesson.title, completed: row.completedLessons.some((done) => done.id === lesson.id) ? 'Yes' : 'No', enrolledAt: row.createdAt })));
module.exports = { calculateCompletionPercentage: pct, calculateCompletionRate: pct, calculateAverageProgress: (items) => items?.length ? items.reduce((sum, item) => sum + item.progress, 0) / items.length : 0, calculateAverageLearningTime: () => 0, calculateActiveUsers: (users) => (users || []).filter((user) => user.status === 'approved').length, getDashboardSummary, getCourseAnalytics, getUserAnalytics, getAllCoursesReportData, getAllUsersReportData, getAllEnrollmentsReportData, getAllProgressReportData };
