const express = require('express');
const {
  enrollInCourse,
  getMyEnrollments,
  getEnrollmentByCourse,
  completeLesson,
  unenroll,
  updateEnrollmentMentor,
  syncProgress
} = require('../../controllers/enrollment.controller');

const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(protect); // All enrollment routes require authentication

router.route('/')
  .get(getMyEnrollments);

router.route('/:courseId')
  .get(getEnrollmentByCourse)
  .post(enrollInCourse)
  .delete(unenroll);

router.route('/:courseId/mentor')
  .put(updateEnrollmentMentor);

router.route('/:courseId/lessons/:lessonId')
  .put(completeLesson);

router.route('/:courseId/sync')
  .put(syncProgress);

module.exports = router;
