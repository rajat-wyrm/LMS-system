/**
 * Mock Database Datasets
 */

const users = [
  {
    id: 'usr-101',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    status: 'Active',
    registeredAt: '2026-01-10T09:00:00.000Z',
    lastLogin: '2026-06-27T18:30:00.000Z',
    averageDailyLearningTime: 45 // in minutes
  },
  {
    id: 'usr-102',
    name: 'Bob Smith',
    email: 'bob@example.com',
    status: 'Active',
    registeredAt: '2026-02-15T10:30:00.000Z',
    lastLogin: '2026-06-26T14:20:00.000Z',
    averageDailyLearningTime: 30
  },
  {
    id: 'usr-103',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    status: 'Inactive',
    registeredAt: '2026-03-20T11:15:00.000Z',
    lastLogin: '2026-05-15T08:00:00.000Z',
    averageDailyLearningTime: 0
  },
  {
    id: 'usr-104',
    name: 'Diana Prince',
    email: 'diana@example.com',
    status: 'Active',
    registeredAt: '2026-05-01T14:00:00.000Z',
    lastLogin: '2026-06-27T19:45:00.000Z',
    averageDailyLearningTime: 60
  },
  {
    id: 'usr-105',
    name: 'Evan Wright',
    email: 'evan@example.com',
    status: 'Active',
    registeredAt: '2026-06-26T08:30:00.000Z',
    lastLogin: '2026-06-27T11:00:00.000Z',
    averageDailyLearningTime: 20
  }
];

const courses = [
  {
    id: 'crs-201',
    name: 'Introduction to React',
    status: 'Published',
    createdAt: '2026-01-05T08:00:00.000Z',
    lessons: [
      { id: 'les-301', title: 'React Basics', duration: 15 },
      { id: 'les-302', title: 'Components and Props', duration: 20 },
      { id: 'les-303', title: 'State and Lifecycle', duration: 25 },
      { id: 'les-304', title: 'React Hooks Deep Dive', duration: 30 },
      { id: 'les-305', title: 'Webpack vs Vite', duration: 15 }
    ]
  },
  {
    id: 'crs-202',
    name: 'Advanced Node.js',
    status: 'Published',
    createdAt: '2026-02-10T09:00:00.000Z',
    lessons: [
      { id: 'les-306', title: 'Event Loop Explained', duration: 30 },
      { id: 'les-307', title: 'Streams and Buffers', duration: 25 },
      { id: 'les-308', title: 'Clustering and Child Processes', duration: 35 }
    ]
  },
  {
    id: 'crs-203',
    name: 'CSS Grid & Flexbox Masterclass',
    status: 'Published',
    createdAt: '2026-03-15T10:00:00.000Z',
    lessons: [
      { id: 'les-309', title: 'Flexbox Fundamentals', duration: 20 },
      { id: 'les-310', title: 'Grid Layout Basics', duration: 25 }
    ]
  },
  {
    id: 'crs-204',
    name: 'Database Design & SQL',
    status: 'Published',
    createdAt: '2026-04-20T11:00:00.000Z',
    lessons: [
      { id: 'les-311', title: 'Relational Model', duration: 15 },
      { id: 'les-312', title: 'Normal Forms', duration: 20 }
    ]
  },
  {
    id: 'crs-205',
    name: 'Introduction to Python',
    status: 'Draft',
    createdAt: '2026-05-10T12:00:00.000Z',
    lessons: [
      { id: 'les-313', title: 'Python Syntax', duration: 10 }
    ]
  },
  {
    id: 'crs-206',
    name: 'Advanced Express.js',
    status: 'Draft',
    createdAt: '2026-06-25T13:00:00.000Z',
    lessons: [
      { id: 'les-314', title: 'Middlewares', duration: 15 }
    ]
  }
];

const enrollments = [
  {
    id: 'enr-401',
    userId: 'usr-101',
    courseId: 'crs-201',
    progress: 100,
    status: 'Completed',
    learningTime: 120, // in minutes
    completedLessons: ['les-301', 'les-302', 'les-303', 'les-304', 'les-305'],
    enrolledAt: '2026-01-12T09:00:00.000Z'
  },
  {
    id: 'enr-402',
    userId: 'usr-101',
    courseId: 'crs-202',
    progress: 66,
    status: 'In Progress',
    learningTime: 90,
    completedLessons: ['les-306', 'les-307'],
    enrolledAt: '2026-02-18T10:00:00.000Z'
  },
  {
    id: 'enr-403',
    userId: 'usr-101',
    courseId: 'crs-203',
    progress: 0,
    status: 'Enrolled',
    learningTime: 0,
    completedLessons: [],
    enrolledAt: '2026-03-22T11:00:00.000Z'
  },
  {
    id: 'enr-404',
    userId: 'usr-102',
    courseId: 'crs-201',
    progress: 40,
    status: 'In Progress',
    learningTime: 50,
    completedLessons: ['les-301', 'les-302'],
    enrolledAt: '2026-02-01T09:30:00.000Z'
  },
  {
    id: 'enr-405',
    userId: 'usr-102',
    courseId: 'crs-204',
    progress: 100,
    status: 'Completed',
    learningTime: 80,
    completedLessons: ['les-311', 'les-312'],
    enrolledAt: '2026-04-22T14:00:00.000Z'
  },
  {
    id: 'enr-406',
    userId: 'usr-104',
    courseId: 'crs-201',
    progress: 80,
    status: 'In Progress',
    learningTime: 100,
    completedLessons: ['les-301', 'les-302', 'les-303', 'les-304'],
    enrolledAt: '2026-05-05T10:00:00.000Z'
  },
  {
    id: 'enr-407',
    userId: 'usr-104',
    courseId: 'crs-202',
    progress: 100,
    status: 'Completed',
    learningTime: 150,
    completedLessons: ['les-306', 'les-307', 'les-308'],
    enrolledAt: '2026-05-10T11:00:00.000Z'
  },
  {
    id: 'enr-408',
    userId: 'usr-105',
    courseId: 'crs-201',
    progress: 20,
    status: 'In Progress',
    learningTime: 30,
    completedLessons: ['les-301'],
    enrolledAt: '2026-06-26T09:00:00.000Z'
  }
];

const lessonStatistics = [
  { lessonId: 'les-301', views: 25, skips: 0 },
  { lessonId: 'les-302', views: 20, skips: 1 },
  { lessonId: 'les-303', views: 18, skips: 2 },
  { lessonId: 'les-304', views: 30, skips: 0 },
  { lessonId: 'les-305', views: 5, skips: 12 },
  { lessonId: 'les-306', views: 15, skips: 1 },
  { lessonId: 'les-307', views: 12, skips: 2 },
  { lessonId: 'les-308', views: 8, skips: 3 },
  { lessonId: 'les-309', views: 10, skips: 0 },
  { lessonId: 'les-310', views: 6, skips: 1 },
  { lessonId: 'les-311', views: 14, skips: 0 },
  { lessonId: 'les-312', views: 9, skips: 2 },
  { lessonId: 'les-313', views: 2, skips: 0 },
  { lessonId: 'les-314', views: 0, skips: 0 }
];

/**
 * Reusable Helper Functions
 */

const calculateCompletionPercentage = (completed, total) => {
  if (total <= 0) return 0;
  const pct = (completed / total) * 100;
  return parseFloat(pct.toFixed(2));
};

const calculateCompletionRate = (completed, total) => {
  return calculateCompletionPercentage(completed, total);
};

const calculateAverageProgress = (enrollmentsList) => {
  if (!enrollmentsList || enrollmentsList.length === 0) return 0;
  const sum = enrollmentsList.reduce((acc, curr) => acc + curr.progress, 0);
  const avg = sum / enrollmentsList.length;
  return parseFloat(avg.toFixed(2));
};

const calculateAverageLearningTime = (enrollmentsList) => {
  if (!enrollmentsList || enrollmentsList.length === 0) return 0;
  const sum = enrollmentsList.reduce((acc, curr) => acc + curr.learningTime, 0);
  const avg = sum / enrollmentsList.length;
  return parseFloat(avg.toFixed(2));
};

const calculateActiveUsers = (usersList) => {
  if (!usersList) return 0;
  return usersList.filter(u => u.status === 'Active').length;
};

/**
 * Service Methods
 */

const getDashboardSummary = async () => {
  const totalUsers = users.length;
  const activeUsers = calculateActiveUsers(users);
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(c => c.status === 'Published').length;
  const draftCourses = courses.filter(c => c.status === 'Draft').length;
  const totalLessons = courses.reduce((acc, curr) => acc + (curr.lessons ? curr.lessons.length : 0), 0);
  const totalEnrollments = enrollments.length;
  const completedCourses = enrollments.filter(e => e.status === 'Completed').length;
  const completionPercentage = calculateCompletionPercentage(completedCourses, totalEnrollments);

  // Recently added courses (sorted by createdAt desc, limit to 3)
  const recentlyAddedCourses = [...courses]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)
    .map(c => ({
      id: c.id,
      name: c.name,
      status: c.status,
      createdAt: c.createdAt
    }));

  // Recently registered users (sorted by registeredAt desc, limit to 3)
  const recentlyRegisteredUsers = [...users]
    .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
    .slice(0, 3)
    .map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      registeredAt: u.registeredAt
    }));

  return {
    totalUsers,
    activeUsers,
    totalCourses,
    publishedCourses,
    draftCourses,
    totalLessons,
    totalEnrollments,
    completedCourses,
    completionPercentage,
    recentlyAddedCourses,
    recentlyRegisteredUsers
  };
};

const getCourseAnalytics = async (courseId) => {
  const course = courses.find(c => c.id === courseId);
  if (!course) return null;

  const enrollmentsForCourse = enrollments.filter(e => e.courseId === courseId);
  const totalStudents = enrollmentsForCourse.length;
  const completedStudents = enrollmentsForCourse.filter(e => e.status === 'Completed').length;
  const completionPercentage = calculateCompletionPercentage(completedStudents, totalStudents);
  const averageLearningTime = calculateAverageLearningTime(enrollmentsForCourse);
  const averageProgress = calculateAverageProgress(enrollmentsForCourse);

  // Determine lesson stats
  const courseLessons = course.lessons || [];
  let mostViewedLesson = 'N/A';
  let leastViewedLesson = 'N/A';
  let mostSkippedLesson = 'N/A';

  if (courseLessons.length > 0) {
    let maxViews = -1;
    let minViews = Infinity;
    let maxSkips = -1;

    courseLessons.forEach(lesson => {
      const stats = lessonStatistics.find(s => s.lessonId === lesson.id) || { views: 0, skips: 0 };
      if (stats.views > maxViews) {
        maxViews = stats.views;
        mostViewedLesson = lesson.title;
      }
      if (stats.views < minViews) {
        minViews = stats.views;
        leastViewedLesson = lesson.title;
      }
      if (stats.skips > maxSkips) {
        maxSkips = stats.skips;
        mostSkippedLesson = lesson.title;
      }
    });
  }

  // Enrollment Trend (grouped by last 6 calendar months: Jan to Jun)
  const months = ['January', 'February', 'March', 'April', 'May', 'June'];
  const enrollmentTrend = months.map((month, index) => {
    const count = enrollmentsForCourse.filter(e => {
      const date = new Date(e.enrolledAt);
      return date.getMonth() === index;
    }).length;
    return { month, enrollments: count };
  });

  return {
    courseName: course.name,
    totalStudents,
    completedStudents,
    completionPercentage,
    averageLearningTime,
    averageProgress,
    mostViewedLesson,
    leastViewedLesson,
    mostSkippedLesson,
    enrollmentTrend
  };
};

const getUserAnalytics = async (userId) => {
  const user = users.find(u => u.id === userId);
  if (!user) return null;

  const userEnrollments = enrollments.filter(e => e.userId === userId);
  const coursesEnrolled = userEnrollments.length;
  const coursesCompleted = userEnrollments.filter(e => e.status === 'Completed').length;
  const completionRate = calculateCompletionRate(coursesCompleted, coursesEnrolled);
  
  const totalMinutes = userEnrollments.reduce((acc, curr) => acc + curr.learningTime, 0);
  const learningHours = parseFloat((totalMinutes / 60).toFixed(2));
  
  const lessonsCompleted = userEnrollments.reduce((acc, curr) => acc + (curr.completedLessons ? curr.completedLessons.length : 0), 0);
  const currentActiveCourses = userEnrollments.filter(e => e.status === 'In Progress').length;

  return {
    coursesEnrolled,
    coursesCompleted,
    completionRate,
    learningHours,
    lessonsCompleted,
    currentActiveCourses,
    lastLogin: user.lastLogin,
    averageDailyLearningTime: user.averageDailyLearningTime
  };
};

const getAllCoursesReportData = async () => {
  const reportData = [];
  for (const course of courses) {
    const analytics = await getCourseAnalytics(course.id);
    reportData.push({
      id: course.id,
      name: course.name,
      status: course.status,
      ...analytics
    });
  }
  return reportData;
};

const getAllUsersReportData = async () => {
  const reportData = [];
  for (const user of users) {
    const analytics = await getUserAnalytics(user.id);
    reportData.push({
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      ...analytics
    });
  }
  return reportData;
};

const getAllEnrollmentsReportData = async () => {
  return enrollments.map(e => {
    const user = users.find(u => u.id === e.userId);
    const course = courses.find(c => c.id === e.courseId);
    return {
      id: e.id,
      userName: user ? user.name : 'Unknown User',
      courseName: course ? course.name : 'Unknown Course',
      progress: e.progress,
      status: e.status,
      learningTime: e.learningTime,
      enrolledAt: e.enrolledAt
    };
  });
};

const getAllProgressReportData = async () => {
  const progressData = [];
  for (const e of enrollments) {
    const user = users.find(u => u.id === e.userId);
    const course = courses.find(c => c.id === e.courseId);
    if (!course) continue;

    const userName = user ? user.name : 'Unknown User';
    const courseName = course.name;

    const courseLessons = course.lessons || [];
    courseLessons.forEach(lesson => {
      const isCompleted = e.completedLessons.includes(lesson.id);
      progressData.push({
        userName,
        courseName,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        completed: isCompleted ? 'Yes' : 'No',
        enrolledAt: e.enrolledAt
      });
    });
  }
  return progressData;
};

module.exports = {
  calculateCompletionPercentage,
  calculateCompletionRate,
  calculateAverageProgress,
  calculateAverageLearningTime,
  calculateActiveUsers,
  getDashboardSummary,
  getCourseAnalytics,
  getUserAnalytics,
  getAllCoursesReportData,
  getAllUsersReportData,
  getAllEnrollmentsReportData,
  getAllProgressReportData
};
