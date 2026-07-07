const express = require('express');
const {
  getDashboardStats,
  getTopPerformers,
  getRecentActivity,
  getStudentGrowth,
  getAnalytics,
  getAdminUsers,
  getAdminUser,
  updateUserStatus,
  deleteAdminUser,
  getAdminCourses,
  updateCourseStatus,
  deleteAdminCourse,
  getPendingCertificates,
  getApprovedCertificates,
  approveCertificate,
  createAdminUser
} = require('../../controllers/admin.controller');

const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // All admin routes are admin only

// Dashboard
router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/dashboard/top-performers', getTopPerformers);
router.get('/dashboard/recent-activity', getRecentActivity);
router.get('/dashboard/student-growth', getStudentGrowth);

// User Management
router
  .route('/users')
  .get(getAdminUsers)
  .post(createAdminUser);

router
  .route('/users/:id')
  .get(getAdminUser)
  .put(updateUserStatus)
  .delete(deleteAdminUser);

// Course Management
router
  .route('/courses')
  .get(getAdminCourses);

router
  .route('/courses/:id')
  .put(updateCourseStatus)
  .delete(deleteAdminCourse);

// Certificate Management
router.get('/certificates/pending', getPendingCertificates);
router.get('/certificates/approved', getApprovedCertificates);
router.put('/certificates/:id/approve', approveCertificate);

module.exports = router;