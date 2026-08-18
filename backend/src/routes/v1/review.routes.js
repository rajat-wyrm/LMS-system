
const express = require("express");

const router = express.Router();

const {
  createReview,
  getCourseReviews,
  getReview,
  updateReview,
  deleteReview,
  respondToReview,
  deleteReviewResponse,
  reportReview,
  getReviewReports,
  updateReviewReport,
} = require("../../controllers/review.controller");

// ============================================================
// Course Reviews
// ============================================================

// Create review
router.post("/course/:courseId", createReview);

// Get all reviews for a course
router.get("/course/:courseId", getCourseReviews);

// ============================================================
// Review Reports
// ============================================================

// Get all reports - Admin
router.get("/reports", getReviewReports);

// Update report status - Admin
router.patch("/reports/:reportId", updateReviewReport);

// ============================================================
// Individual Review
// ============================================================

// Get single review
router.get("/:reviewId", getReview);

// Update own review
router.put("/:reviewId", updateReview);

// Delete own review
router.delete("/:reviewId", deleteReview);

// ============================================================
// Instructor Response
// ============================================================

// Add/update instructor response
router.post("/:reviewId/response", respondToReview);

// Delete instructor response
router.delete("/:reviewId/response", deleteReviewResponse);

// ============================================================
// Report Review
// ============================================================

// Report a review
router.post("/:reviewId/report", reportReview);

module.exports = router;

