
const express = require("express");

const {
  getDashboardStats,
  getTopPerformers,
  getRecentActivity,
  getDashboardNotifications,
  getStudentGrowth,
  getAnalytics,

  // Instructor management
  getInstructors,
  createInstructor,
  updateInstructor,
  deleteInstructor,

  // User management
  getAdminUsers,
  getAdminUser,
  updateUserStatus,
  deleteAdminUser,

  // Course management
  getAdminCourses,
  updateCourseStatus,
  deleteAdminCourse,
  createAdminCourse,

  // Certificate management
  getPendingCertificates,
  getApprovedCertificates,
  approveCertificate,
} = require("../../controllers/admin.controller");

const {
  protect,
  authorize,
} = require("../../middlewares/auth.middleware");

const {
  moderateReview,
  getAllReviewsForAdmin,
  getReviewReports,
  updateReviewReport,
} = require("../../controllers/review.controller");

const router = express.Router();

// =====================================================
// ADMIN AUTHENTICATION
// =====================================================

// Every admin route requires a valid JWT.
router.use(protect);

// Every admin route requires admin role.
router.use(authorize("admin"));

// =====================================================
// DASHBOARD / ANALYTICS
// =====================================================

router
  .route("/stats")
  .get(getDashboardStats);

router
  .route("/analytics")
  .get(getAnalytics);

router
  .route("/dashboard/top-performers")
  .get(getTopPerformers);

router
  .route("/dashboard/recent-activity")
  .get(getRecentActivity);

router
  .route("/dashboard/notifications")
  .get(getDashboardNotifications);

router
  .route("/dashboard/student-growth")
  .get(getStudentGrowth);

// =====================================================
// USER MANAGEMENT
// =====================================================

router
  .route("/users")
  .get(getAdminUsers);

router
  .route("/users/:id")
  .get(getAdminUser)
  .put(updateUserStatus)
  .delete(deleteAdminUser);

// =====================================================
// INSTRUCTOR MANAGEMENT
// =====================================================

router
  .route("/instructors")
  .get(getInstructors)
  .post(createInstructor);

router
  .route("/instructors/:id")
  .put(updateInstructor)
  .delete(deleteInstructor);

// =====================================================
// COURSE MANAGEMENT
// =====================================================

router
  .route("/courses")
  .get(getAdminCourses)
  .post(createAdminCourse);

router
  .route("/courses/:id")
  .put(updateCourseStatus)
  .delete(deleteAdminCourse);

// =====================================================
// CERTIFICATE MANAGEMENT
// =====================================================

router
  .route("/certificates/pending")
  .get(getPendingCertificates);

router
  .route("/certificates/approved")
  .get(getApprovedCertificates);

router
  .route("/certificates/:id/approve")
  .put(approveCertificate);

// =====================================================
// REVIEW MODERATION
// =====================================================
//
// Base URL:
// /api/v1/admin
//
// Therefore:
//
// GET   /api/v1/admin/reviews
// PATCH /api/v1/admin/reviews/:reviewId
//
// Optional:
// GET /api/v1/admin/reviews?status=pending
// GET /api/v1/admin/reviews?status=approved
// GET /api/v1/admin/reviews?status=rejected
//
// Body for PATCH:
//
// {
//   "status": "approved"
// }
//
// or
//
// {
//   "status": "rejected"
// }
//
// or
//
// {
//   "status": "pending"
// }
//
// These routes are already protected by:
//
// protect
// authorize("admin")
//
// =====================================================

router
  .route("/reviews")
  .get(getAllReviewsForAdmin);

router
  .route("/reviews/:reviewId")
  .patch(moderateReview);

// =====================================================
// REVIEW REPORT MANAGEMENT
// =====================================================
//
// GET:
// /api/v1/admin/reviews/reports
//
// PATCH:
// /api/v1/admin/reviews/reports/:reportId
//
// =====================================================

router
  .route("/reviews/reports")
  .get(getReviewReports);

router
  .route("/reviews/reports/:reportId")
  .patch(updateReviewReport);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;

