const express = require('express');
const {
  getDashboardStats,
  getAdminUsers,
  updateUserStatus,
  deleteAdminUser,
  getAdminCourses,
  updateCourseStatus,
<<<<<<< HEAD
  deleteAdminCourse
=======
  deleteAdminCourse,
  getSystemHealth
>>>>>>> 32b6107 (initial commit)
} = require('../../controllers/admin.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // All admin routes are admin only

// Stats
router.route('/stats').get(getDashboardStats);

<<<<<<< HEAD
=======
// System health (DB + Redis)
router.route('/health').get(getSystemHealth);

>>>>>>> 32b6107 (initial commit)
// User management
router.route('/users').get(getAdminUsers);
router.route('/users/:id').put(updateUserStatus).delete(deleteAdminUser);

// Course management
router.route('/courses').get(getAdminCourses);
router.route('/courses/:id').put(updateCourseStatus).delete(deleteAdminCourse);

// Certificate management
router.route('/certificates/pending').get(require('../../controllers/admin.controller').getPendingCertificates);
router.route('/certificates/approved').get(require('../../controllers/admin.controller').getApprovedCertificates);
router.route('/certificates/:id/approve').put(require('../../controllers/admin.controller').approveCertificate);

module.exports = router;
