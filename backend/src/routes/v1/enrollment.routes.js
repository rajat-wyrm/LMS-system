const express = require('express');
const {
  enrollInCourse, getMyEnrollments, getEnrollmentByCourse,
  completeLesson, unenroll, updateEnrollmentMentor
} = require('../../controllers/enrollment.controller');

const { protect } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { enrollParamsSchema, lessonParamsSchema, mentorSchema } = require('../../validations/enrollment.validation');

const router = express.Router();
router.use(protect);

router.route('/').get(getMyEnrollments);

router.route('/:courseId')
  .get(validate(enrollParamsSchema), getEnrollmentByCourse)
  .post(validate(enrollParamsSchema), enrollInCourse)
  .delete(validate(enrollParamsSchema), unenroll);

router.route('/:courseId/mentor')
  .put(validate(mentorSchema), updateEnrollmentMentor);

router.route('/:courseId/lessons/:lessonId')
  .put(validate(lessonParamsSchema), completeLesson);

module.exports = router;