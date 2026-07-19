/**
 * Helper function to escape CSV cell contents.
 * Wraps values containing commas, double quotes, or newlines in double quotes,
 * and escapes existing double quotes by doubling them.
 * @param {any} val
 * @returns {string}
 */
const escapeCSV = (val) => {
  if (val === null || val === undefined) return '';
  let str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }
  return str;
};

/**
 * Generates CSV string for Dashboard Analytics
 * @param {object} dashboardData
 * @returns {string}
 */
const generateDashboardReport = (dashboardData) => {
  let csv = 'Metric,Value\n';
  csv += `Total Users,${escapeCSV(dashboardData.totalUsers)}\n`;
  csv += `Active Users,${escapeCSV(dashboardData.activeUsers)}\n`;
  csv += `Total Courses,${escapeCSV(dashboardData.totalCourses)}\n`;
  csv += `Published Courses,${escapeCSV(dashboardData.publishedCourses)}\n`;
  csv += `Draft Courses,${escapeCSV(dashboardData.draftCourses)}\n`;
  csv += `Total Lessons,${escapeCSV(dashboardData.totalLessons)}\n`;
  csv += `Total Enrollments,${escapeCSV(dashboardData.totalEnrollments)}\n`;
  csv += `Completed Courses,${escapeCSV(dashboardData.completedCourses)}\n`;
  csv += `Completion Percentage,${escapeCSV(dashboardData.completionPercentage)}%\n`;
  return csv;
};

/**
 * Generates CSV string for Course Analytics
 * @param {Array<object>} coursesData
 * @returns {string}
 */
const generateCourseReport = (coursesData) => {
  let csv = 'Course ID,Course Name,Status,Total Students,Completed Students,Completion Percentage,Average Learning Time (mins),Average Progress\n';
  coursesData.forEach(c => {
    csv += `${escapeCSV(c.id)},`;
    csv += `${escapeCSV(c.name)},`;
    csv += `${escapeCSV(c.status)},`;
    csv += `${escapeCSV(c.totalStudents)},`;
    csv += `${escapeCSV(c.completedStudents)},`;
    csv += `${escapeCSV(c.completionPercentage)}%,`;
    csv += `${escapeCSV(c.averageLearningTime)},`;
    csv += `${escapeCSV(c.averageProgress)}%\n`;
  });
  return csv;
};

/**
 * Generates CSV string for User Analytics
 * @param {Array<object>} usersData
 * @returns {string}
 */
const generateUserReport = (usersData) => {
  let csv = 'User ID,User Name,Email,Status,Courses Enrolled,Courses Completed,Completion Rate,Learning Hours,Lessons Completed,Last Login\n';
  usersData.forEach(u => {
    csv += `${escapeCSV(u.id)},`;
    csv += `${escapeCSV(u.name)},`;
    csv += `${escapeCSV(u.email)},`;
    csv += `${escapeCSV(u.status)},`;
    csv += `${escapeCSV(u.coursesEnrolled)},`;
    csv += `${escapeCSV(u.coursesCompleted)},`;
    csv += `${escapeCSV(u.completionRate)}%,`;
    csv += `${escapeCSV(u.learningHours)},`;
    csv += `${escapeCSV(u.lessonsCompleted)},`;
    csv += `${escapeCSV(u.lastLogin)}\n`;
  });
  return csv;
};

/**
 * Generates CSV string for Enrollment Analytics
 * @param {Array<object>} enrollmentsData
 * @returns {string}
 */
const generateEnrollmentReport = (enrollmentsData) => {
  let csv = 'Enrollment ID,User Name,Course Name,Progress,Status,Learning Time (mins),Enrolled At\n';
  enrollmentsData.forEach(e => {
    csv += `${escapeCSV(e.id)},`;
    csv += `${escapeCSV(e.userName)},`;
    csv += `${escapeCSV(e.courseName)},`;
    csv += `${escapeCSV(e.progress)}%,`;
    csv += `${escapeCSV(e.status)},`;
    csv += `${escapeCSV(e.learningTime)},`;
    csv += `${escapeCSV(e.enrolledAt)}\n`;
  });
  return csv;
};

/**
 * Generates CSV string for Progress Analytics
 * @param {Array<object>} progressData
 * @returns {string}
 */
const generateProgressReport = (progressData) => {
  let csv = 'User Name,Course Name,Lesson ID,Lesson Title,Completed,Enrolled At\n';
  progressData.forEach(p => {
    csv += `${escapeCSV(p.userName)},`;
    csv += `${escapeCSV(p.courseName)},`;
    csv += `${escapeCSV(p.lessonId)},`;
    csv += `${escapeCSV(p.lessonTitle)},`;
    csv += `${escapeCSV(p.completed)},`;
    csv += `${escapeCSV(p.enrolledAt)}\n`;
  });
  return csv;
};

module.exports = {
  generateDashboardReport,
  generateCourseReport,
  generateUserReport,
  generateEnrollmentReport,
  generateProgressReport
};
