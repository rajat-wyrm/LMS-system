const { prisma } = require('../config/db');
const { clearCache } = require('../middlewares/cache.middleware');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, category, level } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where = { status: 'approved' };

    if (category) where.category = category;
    if (level) where.level = level;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { celebrityTeacher: { contains: search, mode: 'insensitive' } }
      ];
    }

    const orderBy = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          instructor: { select: { id: true, name: true, email: true } },
          lessons: true,
          _count: { select: { enrollments: true } }
        },
        skip,
        take: limitNumber,
        orderBy
      }),
      prisma.course.count({ where })
    ]);

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
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

// @desc    Get trending courses by enrollment count
// @route   GET /api/courses/trending
// @access  Public
exports.getTrendingCourses = async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      where: { status: 'approved' },
      include: {
        instructor: {
          select: { id: true, name: true, email: true }
        },
        lessons: true,
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: [
        {
          enrollments: {
            _count: 'desc'
          }
        },
        {
          createdAt: 'desc'
        }
      ],
      take: 3
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        lessons: { orderBy: { order: 'asc' } },
        _count: { select: { enrollments: true } }
      }
    });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    // Only admins and the course instructor can view non-approved courses
    if (course.status !== 'approved') {
      const isOwner = req.user && course.instructorId === req.user.id;
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(404).json({ success: false, error: 'Course not found' });
      }
    }
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Admin/Instructor)
exports.createCourse = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admins can create and generate courses' });
    }
    const { title, description, category, level, thumbnail, celebrityTeacher, price, duration, rating, outcomes, xp, gradient, icon, status, generateAI } = req.body;
    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        level,
        thumbnail,
        celebrityTeacher,
        price: price ? parseFloat(price) : 0,
        duration: duration || 'Self-paced',
        rating: rating ? parseFloat(rating) : 4.5,
        outcomes: outcomes || [],
        xp: xp || '1000 XP',
        gradient: gradient || 'from-blue-600 via-blue-500 to-cyan-400',
        icon: icon || '🤖',
        status: status || 'approved',
        instructorId: req.user.id
      }
    });

    if (generateAI) {
      const { generateLessonsForCourse } = require('../utils/aiGenerator');
      const lessonsData = await generateLessonsForCourse(title, category, level);
      for (const l of lessonsData) {
        await prisma.lesson.create({
          data: {
            title: l.title,
            content: l.content,
            videoUrl: l.videoUrl,
            order: l.order,
            courseId: course.id
          }
        });
      }
      // Update course duration count (assume lessonsData length * 20 Mins)
      await prisma.course.update({
        where: { id: course.id },
        data: {
          duration: `${lessonsData.length * 20} Mins`
        }
      });
    }

    // Invalidate course cache
    await clearCache('cache:/api/courses');
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin/Instructor)
exports.updateCourse = async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this course. Admin only.' });
    }

    const dataToUpdate = { ...req.body };
    if (dataToUpdate.price !== undefined) {
      dataToUpdate.price = parseFloat(dataToUpdate.price) || 0;
    }
    if (dataToUpdate.rating !== undefined) {
      dataToUpdate.rating = parseFloat(dataToUpdate.rating) || 4.5;
    }

    const updated = await prisma.course.update({
      where: { id: req.params.id },
      data: dataToUpdate
    });
    // Invalidate course cache
    await clearCache('cache:/api/courses');
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin/Instructor)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this course. Admin only.' });
    }

    await prisma.course.delete({ where: { id: req.params.id } });
    // Invalidate course cache
    await clearCache('cache:/api/courses');
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Add lesson to course
// @route   POST /api/courses/:courseId/lessons
// @access  Private (Admin/Instructor)
exports.addLesson = async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.courseId } });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to add lessons to this course. Admin only.' });
    }

    const { title, content, videoUrl, order } = req.body;
    const lesson = await prisma.lesson.create({
      data: {
        title,
        content,
        videoUrl,
        order: Number(order),
        courseId: req.params.courseId
      }
    });
    // Invalidate course cache
    await clearCache('cache:/api/courses');
    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lesson from course
// @route   DELETE /api/courses/:courseId/lessons/:lessonId
// @access  Private (Admin/Instructor)
exports.deleteLesson = async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.courseId } });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete lessons from this course. Admin only.' });
    }

    const lesson = await prisma.lesson.findUnique({ where: { id: req.params.lessonId } });
    if (!lesson || lesson.courseId !== req.params.courseId) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }

    await prisma.lesson.delete({ where: { id: req.params.lessonId } });
    // Invalidate course cache
    await clearCache('cache:/api/courses');
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get instructor statistics
// @route   GET /api/courses/instructor/stats
// @access  Private (Instructor/Admin)
exports.getInstructorStats = async (req, res, next) => {
  try {
    const instructorId = req.user.id;

    // Get all courses by this instructor
    const courses = await prisma.course.findMany({
      where: { instructorId },
      select: { id: true, price: true }
    });

    const courseIds = courses.map(c => c.id);

    // Get all enrollments for these courses
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      include: { course: { select: { price: true } } }
    });

    const totalStudents = enrollments.length;
    const totalCourses = courses.length;
    const totalRevenue = enrollments.reduce((sum, enr) => sum + (enr.course?.price || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalCourses,
        totalRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all learning paths
// @route   GET /api/courses/learning-paths
// @access  Public
exports.getLearningPaths = async (req, res, next) => {
  try {
    const paths = await prisma.learningPath.findMany({
      include: {
        courses: {
          select: { id: true, title: true, duration: true, thumbnail: true }
        }
      }
    });
    res.status(200).json({ success: true, data: paths });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate course lessons with AI
// @route   POST /api/courses/:courseId/generate-lessons
// @access  Private (Admin/Instructor)
exports.generateLessonsAI = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { lessons: true }
    });

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to generate lessons for this course. Admin only.' });
    }

    // Delete existing lessons to give a fresh AI syllabus
    await prisma.lesson.deleteMany({
      where: { courseId }
    });

    const { generateLessonsForCourse } = require('../utils/aiGenerator');
    const lessonsData = await generateLessonsForCourse(course.title, course.category, course.level);

    // Create the lessons
    const createdLessons = [];
    for (const l of lessonsData) {
      const created = await prisma.lesson.create({
        data: {
          title: l.title,
          content: l.content,
          videoUrl: l.videoUrl,
          order: l.order,
          courseId
        }
      });
      createdLessons.push(created);
    }

    // Update course duration count
    await prisma.course.update({
      where: { id: courseId },
      data: {
        duration: `${lessonsData.length * 20} Mins`
      }
    });

    // Invalidate course cache
    await clearCache('cache:/api/courses');

    res.status(200).json({ success: true, data: createdLessons });
  } catch (error) {
    next(error);
  }
};
