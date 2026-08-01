/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Retrieve dashboard summary metrics
 *     description: Returns high-level metrics including user activity, course counts, and enrollment stats. Requires Admin privileges.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Dashboard analytics fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       example: 5
 *                     activeUsers:
 *                       type: integer
 *                       example: 4
 *                     totalCourses:
 *                       type: integer
 *                       example: 6
 *                     publishedCourses:
 *                       type: integer
 *                       example: 4
 *                     draftCourses:
 *                       type: integer
 *                       example: 2
 *                     totalLessons:
 *                       type: integer
 *                       example: 14
 *                     totalEnrollments:
 *                       type: integer
 *                       example: 8
 *                     completedCourses:
 *                       type: integer
 *                       example: 3
 *                     completionPercentage:
 *                       type: number
 *                       example: 37.5
 *                     recentlyAddedCourses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: crs-206
 *                           name:
 *                             type: string
 *                             example: Advanced Express.js
 *                           status:
 *                             type: string
 *                             example: Draft
 *                           createdAt:
 *                             type: string
 *                             example: "2026-06-25T13:00:00.000Z"
 *                     recentlyRegisteredUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: usr-105
 *                           name:
 *                             type: string
 *                             example: Evan Wright
 *                           email:
 *                             type: string
 *                             example: evan@example.com
 *                           registeredAt:
 *                             type: string
 *                             example: "2026-06-26T08:30:00.000Z"
 *       401:
 *         description: Unauthorized. Missing, expired, or invalid JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Access token is missing
 *                 errorCode:
 *                   type: string
 *                   example: AUTHENTICATION_ERROR
 *       403:
 *         description: Forbidden. Authenticated user does not have the Admin role.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Admin permission required
 *                 errorCode:
 *                   type: string
 *                   example: AUTHORIZATION_ERROR
 *       500:
 *         description: Internal Server Error
 *
 * /api/analytics/course/{courseId}:
 *   get:
 *     summary: Retrieve course analytics
 *     description: Returns detailed enrollment, learning, and progress stats for a specific course. Requires Admin privileges.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-zA-Z0-9-_]+$'
 *         description: The unique identifier of the course. Alphanumeric characters, hyphens, and underscores only.
 *     responses:
 *       200:
 *         description: Course analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Course analytics fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     courseName:
 *                       type: string
 *                       example: Introduction to React
 *                     totalStudents:
 *                       type: integer
 *                       example: 4
 *                     completedStudents:
 *                       type: integer
 *                       example: 1
 *                     completionPercentage:
 *                       type: number
 *                       example: 25
 *                     averageLearningTime:
 *                       type: number
 *                       example: 75
 *                     averageProgress:
 *                       type: number
 *                       example: 60
 *                     mostViewedLesson:
 *                       type: string
 *                       example: React Hooks Deep Dive
 *                     leastViewedLesson:
 *                       type: string
 *                       example: Webpack vs Vite
 *                     mostSkippedLesson:
 *                       type: string
 *                       example: Webpack vs Vite
 *                     enrollmentTrend:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: January
 *                           enrollments:
 *                             type: integer
 *                             example: 1
 *       400:
 *         description: Bad Request. Empty parameter or invalid ID format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid course ID
 *                 errorCode:
 *                   type: string
 *                   example: VALIDATION_ERROR
 *       401:
 *         description: Unauthorized. Missing or invalid token.
 *       403:
 *         description: Forbidden. Admin permissions required.
 *       404:
 *         description: Not Found. Course not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Resource not found
 *                 errorCode:
 *                   type: string
 *                   example: RESOURCE_NOT_FOUND
 *       500:
 *         description: Internal Server Error
 *
 * /api/analytics/user/{userId}:
 *   get:
 *     summary: Retrieve user learning analytics
 *     description: Returns aggregate courses, completed lessons, and study hours for a specific student/user. Requires Admin privileges.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-zA-Z0-9-_]+$'
 *         description: The unique identifier of the user. Alphanumeric characters, hyphens, and underscores only.
 *     responses:
 *       200:
 *         description: User analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User analytics fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     coursesEnrolled:
 *                       type: integer
 *                       example: 3
 *                     coursesCompleted:
 *                       type: integer
 *                       example: 1
 *                     completionRate:
 *                       type: number
 *                       example: 33.33
 *                     learningHours:
 *                       type: number
 *                       example: 3.5
 *                     lessonsCompleted:
 *                       type: integer
 *                       example: 7
 *                     currentActiveCourses:
 *                       type: integer
 *                       example: 1
 *                     lastLogin:
 *                       type: string
 *                       example: "2026-06-27T18:30:00.000Z"
 *                     averageDailyLearningTime:
 *                       type: number
 *                       example: 45
 *       400:
 *         description: Bad Request. Empty parameter or invalid ID format.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found. User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Resource not found
 *                 errorCode:
 *                   type: string
 *                   example: RESOURCE_NOT_FOUND
 *       500:
 *         description: Internal Server Error
 *
 * /api/analytics/export:
 *   get:
 *     summary: Export analytics CSV report
 *     description: Generates and downloads a CSV spreadsheet of the specified report type. Requires Admin privileges.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [dashboard, course, user, enrollment, progress]
 *         description: The report category to export.
 *     responses:
 *       200:
 *         description: Downloadable CSV report file
 *         headers:
 *           Content-Type:
 *             schema:
 *               type: string
 *               example: text/csv
 *           Content-Disposition:
 *             schema:
 *               type: string
 *               example: attachment; filename=dashboard_report.csv
 *           Cache-Control:
 *             schema:
 *               type: string
 *               example: no-store
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               example: "Metric,Value\nTotal Users,5\nActive Users,4\n"
 *       400:
 *         description: Bad Request. Missing or unsupported report type.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Report type is required. Allowed values are: dashboard, course, user, enrollment, progress"
 *                 errorCode:
 *                   type: string
 *                   example: VALIDATION_ERROR
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
