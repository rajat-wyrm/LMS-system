const express = require('express');

const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  restoreCourse,
  addLesson,
  deleteLesson,
  getInstructorStats,
  getLearningPaths,
  generateLessonsAI
} = require('../../controllers/courses.controller');


const { protect, authorize } = require('../../middlewares/auth.middleware');

const { validate } = require('../../middlewares/validate.middleware');

const { courseSchema, lessonSchema } = require('../../validations/course.validation');

const { cacheMiddleware } = require('../../middlewares/cache.middleware');


const router = express.Router();


// ===============================
// Courses
// ===============================

router.route('/')

  // Get all approved non-deleted courses
  .get(cacheMiddleware(300), getCourses)

  // Create course (Admin only)
  .post(
    protect,
    authorize('admin'),
    validate(courseSchema),
    createCourse
  );



// ===============================
// Learning Paths
// ===============================

router.route('/learning-paths')

  .get(getLearningPaths);



// ===============================
// Instructor Statistics
// ===============================

router.route('/instructor/stats')

  .get(
    protect,
    authorize('instructor','admin'),
    getInstructorStats
  );



// ===============================
// Single Course
// ===============================

router.route('/:id')

  .get(getCourse)

  .put(
    protect,
    authorize('admin'),
    updateCourse
  )

  // Soft delete course
  .delete(
    protect,
    authorize('admin'),
    deleteCourse
  );



// ===============================
// Restore Deleted Course
// ===============================

router.route('/:id/restore')

  .patch(
    protect,
    authorize('admin'),
    restoreCourse
  );



// ===============================
// Lessons
// ===============================

router.route('/:courseId/lessons')

  .post(
    protect,
    authorize('admin'),
    validate(lessonSchema),
    addLesson
  );



// ===============================
// Generate AI Lessons
// ===============================

router.route('/:courseId/generate-lessons')

  .post(
    protect,
    authorize('admin'),
    generateLessonsAI
  );



// ===============================
// Delete Lesson
// ===============================

router.route('/:courseId/lessons/:lessonId')

  .delete(
    protect,
    authorize('admin'),
    deleteLesson
  );



module.exports = router;