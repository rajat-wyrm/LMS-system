const express = require('express');
const {
  getCourses,
  getTrendingCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  addLesson,
  deleteLesson,
  getInstructorStats,
  getLearningPaths,
  generateLessonsAI,
  getCourseTimeline,
} = require('../../controllers/courses.controller');

const { protect, authorize } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { courseSchema, lessonSchema } = require('../../validations/course.validation');
const { cacheMiddleware } = require('../../middlewares/cache.middleware');

const router = express.Router();

router.route('/')
  .get(cacheMiddleware(300), getCourses)
  .post(protect, authorize('admin', 'instructor'), validate(courseSchema), createCourse);

  //route trending courses
router.route('/trending')
  .get(getTrendingCourses);

router.route('/learning-paths')
  .get(getLearningPaths);

router.route('/instructor/stats')
  .get(protect, authorize('admin', 'instructor'), getInstructorStats);

router.route('/:id')
  .get(getCourse)
  .put(protect, authorize('admin', 'instructor'), updateCourse)
  .delete(protect, authorize('admin', 'instructor'), deleteCourse);

router.route('/:id/timeline')
  .get(protect, getCourseTimeline);

router.route('/:courseId/lessons')
  .post(protect, authorize('admin', 'instructor'), validate(lessonSchema), addLesson);

router.route('/:courseId/generate-lessons')
  .post(protect, authorize('admin', 'instructor'), generateLessonsAI);

router.route('/:courseId/lessons/:lessonId')
  .delete(protect, authorize('admin', 'instructor'), deleteLesson);

module.exports = router;
