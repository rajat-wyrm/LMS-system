const { prisma } = require('../config/db');
const { clearCache } = require('../middlewares/cache.middleware');

// @desc    Enroll in a course
// @route   POST /api/enrollments/:courseId
// @access  Private
exports.enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({ success: false, error: 'Already enrolled in this course' });
    }

    // Prevent instructor from enrolling in their own course
    if (course.instructorId === userId) {
      return res.status(400).json({ success: false, error: 'Instructor cannot enroll in their own course' });
    }

    const { mentor } = req.body;

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        mentor: mentor || null
      }
    });

    // Invalidate course cache to update enrollment counts
    await clearCache(`cache:/api/courses`);

    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's enrolled courses
// @route   GET /api/enrollments
// @access  Private
exports.getMyEnrollments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, status } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where = { userId: req.user.id };

    if (status) where.status = status;

    if (search) {
      where.course = {
        title: { contains: search, mode: 'insensitive' }
      };
    }

    const orderBy = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    }

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        include: {
          course: {
            include: {
              instructor: { select: { name: true } },
              _count: { select: { lessons: true } }
            }
          },
          completedLessons: { select: { id: true } }
        },
        skip,
        take: limitNumber,
        orderBy
      }),
      prisma.enrollment.count({ where })
    ]);

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark lesson as completed
// @route   PUT /api/enrollments/:courseId/lessons/:lessonId
// @access  Private
exports.completeLesson = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.id;

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      },
      include: {
        completedLessons: true,
        course: {
          include: { lessons: { select: { id: true } } }
        }
      }
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, error: 'Enrollment not found' });
    }

    // Check if already completed this lesson
    const alreadyCompleted = enrollment.completedLessons.some(l => l.id === lessonId);
    if (!alreadyCompleted) {
      // Connect lesson to completed lessons
      const updatedEnrollment = await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          completedLessons: {
            connect: { id: lessonId }
          }
        },
        include: {
          completedLessons: true
        }
      });

      // Calculate progress
      const totalLessons = enrollment.course.lessons.length;
      let newProgress = 0;
      if (totalLessons > 0) {
        newProgress = Math.round((updatedEnrollment.completedLessons.length / totalLessons) * 100);
        if (newProgress > 100) newProgress = 100;
      }

      // Update progress in DB
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { 
          progress: newProgress,
          status: newProgress === 100 ? 'completed' : 'active'
        }
      });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Unenroll from a course
// @route   DELETE /api/enrollments/:courseId
// @access  Private
exports.unenroll = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    });

    if (!existingEnrollment) {
      return res.status(404).json({ success: false, error: 'Enrollment not found' });
    }

    await prisma.enrollment.delete({
      where: {
        userId_courseId: { userId, courseId }
      }
    });

    // Invalidate course cache to update enrollment counts
    await clearCache(`cache:/api/courses`);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific enrollment by course ID
// @route   GET /api/enrollments/:courseId
// @access  Private
exports.getEnrollmentByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      },
      include: {
        user: {
          select: { name: true, email: true }
        },
        course: {
          include: {
            instructor: { select: { name: true } },
            _count: { select: { lessons: true } }
          }
        },
        completedLessons: {
          select: { id: true }
        }
      }
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, error: 'Enrollment not found' });
    }

    res.status(200).json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update enrollment mentor
// @route   PUT /api/enrollments/:courseId/mentor
// @access  Private
exports.updateEnrollmentMentor = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { mentor } = req.body;
    const userId = req.user.id;

    if (!mentor) {
      return res.status(400).json({ success: false, error: 'Mentor name is required' });
    }

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, error: 'Enrollment not found' });
    }

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { mentor }
    });

    res.status(200).json({ success: true, data: updatedEnrollment });
  } catch (error) {
    next(error);
  }
};
