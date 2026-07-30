const express = require('express');
const {
  getDashboardStats,
  getTopPerformers,
  getRecentActivity,
  getDashboardNotifications,
  getStudentGrowth,
  getAnalytics,
  getInstructors,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  getAdminUsers,
  getAdminUser,
  updateUserStatus,
  deleteAdminUser,
  getAdminCourses,
  updateCourseStatus,
  deleteAdminCourse,
  createAdminCourse
} = require('../../controllers/admin.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // All admin routes are admin only

// Stats
router.route('/stats').get(getDashboardStats);
router.route('/analytics').get(getAnalytics);
router.route('/dashboard/top-performers').get(getTopPerformers);
router.route('/dashboard/recent-activity').get(getRecentActivity);
router.route('/dashboard/notifications').get(getDashboardNotifications);
router.route('/dashboard/student-growth').get(getStudentGrowth);

// User management
router.route('/users').get(getAdminUsers);
router.route('/users/:id').get(getAdminUser).put(updateUserStatus).delete(deleteAdminUser);
router.route('/instructors').get(getInstructors).post(createInstructor);
router.route('/instructors/:id').put(updateInstructor).delete(deleteInstructor);

// Course management
router.route('/courses').get(getAdminCourses).post(createAdminCourse);
router.route('/courses/:id').put(updateCourseStatus).delete(deleteAdminCourse);

// Certificate management
router.route('/certificates/pending').get(require('../../controllers/admin.controller').getPendingCertificates);
router.route('/certificates/approved').get(require('../../controllers/admin.controller').getApprovedCertificates);
router.route('/certificates/:id/approve').put(require('../../controllers/admin.controller').approveCertificate);

module.exports = router;
