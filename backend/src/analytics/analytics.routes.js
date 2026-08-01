const { Router } = require('express');
const analyticsController = require('./analytics.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');

const router = Router();

// GET /api/analytics/dashboard - Fetch dashboard summary analytics (Protected: Admin)
router.get('/dashboard', verifyToken, verifyAdmin, analyticsController.getDashboardSummary);

// GET /api/analytics/course/:courseId - Fetch course-specific analytics (Protected: Admin)
router.get('/course/:courseId', verifyToken, verifyAdmin, analyticsController.getCourseAnalytics);

// GET /api/analytics/user/:userId - Fetch user-specific analytics (Protected: Admin)
router.get('/user/:userId', verifyToken, verifyAdmin, analyticsController.getUserAnalytics);

// GET /api/analytics/export - Export CSV reports (Protected: Admin)
router.get('/export', verifyToken, verifyAdmin, analyticsController.exportReport);

module.exports = router;
