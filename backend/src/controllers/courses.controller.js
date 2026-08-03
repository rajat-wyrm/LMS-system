const { prisma } = require("../config/db");
const { clearCache } = require("../middlewares/cache.middleware");

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      category,
      level,
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where = { status: "approved" };

    if (category) where.category = category;
    if (level) where.level = level;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { celebrityTeacher: { contains: search, mode: "insensitive" } },
        { instructor: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const orderBy = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder === "asc" ? "asc" : "desc";
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          instructor: { select: { id: true, name: true, email: true } },
          lessons: true,
          _count: { select: { enrollments: true } },
        },
        skip,
        take: limitNumber,
        orderBy,
      }),
      prisma.course.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
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
        lessons: { orderBy: { order: "asc" } },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }
    if (course.status !== "approved") {
      const isOwner = req.user && course.instructorId === req.user.id;
      const isAdmin = req.user && req.user.role === "admin";
      if (!isOwner && !isAdmin) {
        return res
          .status(404)
          .json({ success: false, error: "Course not found" });
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
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Only admins can create and generate courses",
      });
    }

    const {
      title,
      description,
      category,
      level,
      thumbnail,
      celebrityTeacher,
      price,
      duration,
      rating,
      outcomes,
      xp,
      gradient,
      icon,
      status,
      generateAI,
    } = req.body;

    const categoryRecord = category
      ? await prisma.category.findUnique({ where: { name: category } })
      : null;
    if (category && !categoryRecord) {
      return res.status(400).json({
        success: false,
        error: "Select a category created through the admin panel.",
      });
    }

    const allowedStatuses = ["pending", "approved", "rejected"];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Allowed values are: pending, approved, rejected.",
      });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        categoryId: categoryRecord?.id || null,
        level,
        thumbnail,
        celebrityTeacher,
        price: price ? parseFloat(price) : 0,
        duration: duration || "Self-paced",
        rating: rating ? parseFloat(rating) : 4.5,
        outcomes: outcomes || [],
        xp: xp || "1000 XP",
        gradient: gradient || "from-blue-600 via-blue-500 to-cyan-400",
        icon: icon || "🤖",
        status: status || "approved",
        instructorId: req.user.id,
      },
    });

    await prisma.courseActivity.create({
      data: {
        courseId: course.id,
        action: "created",
        details: "Course created and initialized.",
        userId: req.user.id,
        userName: req.user.name,
      },
    });

    if (generateAI) {
      const { generateLessonsForCourse } = require("../utils/aiGenerator");
      const lessonsData = await generateLessonsForCourse(title, category, level);
      for (const l of lessonsData) {
        await prisma.lesson.create({
          data: {
            title: l.title,
            content: l.content,
            videoUrl: l.videoUrl,
            order: l.order,
            courseId: course.id,
          },
        });
      }
      await prisma.course.update({
        where: { id: course.id },
        data: {
          duration: `${lessonsData.length * 20} Mins`,
        },
      });
    }

    await clearCache("cache:/api/courses");
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
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this course. Admin only.",
      });
    }

    const dataToUpdate = { ...req.body };
    if (dataToUpdate.category !== undefined) {
      const categoryRecord = await prisma.category.findUnique({ where: { name: dataToUpdate.category } });
      if (!categoryRecord) {
        return res.status(400).json({ success: false, error: "Selected category was not found." });
      }
      dataToUpdate.categoryId = categoryRecord.id;
    }
    if (dataToUpdate.price !== undefined) {
      dataToUpdate.price = parseFloat(dataToUpdate.price) || 0;
    }
    if (dataToUpdate.rating !== undefined) {
      dataToUpdate.rating = parseFloat(dataToUpdate.rating) || 4.5;
    }

    const updated = await prisma.course.update({
      where: { id: req.params.id },
      data: dataToUpdate,
    });

    const changedFields = [];
    if (dataToUpdate.title !== undefined && dataToUpdate.title !== course.title) changedFields.push("title");
    if (dataToUpdate.description !== undefined && dataToUpdate.description !== course.description) changedFields.push("description");
    if (dataToUpdate.category !== undefined && dataToUpdate.category !== course.category) changedFields.push("category");
    if (dataToUpdate.level !== undefined && dataToUpdate.level !== course.level) changedFields.push("level");
    if (dataToUpdate.price !== undefined && dataToUpdate.price !== course.price) changedFields.push("price");
    if (dataToUpdate.celebrityTeacher !== undefined && dataToUpdate.celebrityTeacher !== course.celebrityTeacher) changedFields.push("instructor");
    if (dataToUpdate.instructorId !== undefined && dataToUpdate.instructorId !== course.instructorId) changedFields.push("instructorId");
    if (dataToUpdate.status !== undefined && dataToUpdate.status !== course.status) changedFields.push("status");

    if (changedFields.length > 0) {
      let action = "edited";
      let details = `Updated course details: ${changedFields.join(", ")}.`;

      if (changedFields.includes("status") && updated.status === "approved") {
        action = "published";
        details = "Course approved and published.";
      } else if (changedFields.includes("instructor") || changedFields.includes("instructorId")) {
        action = "instructor_changed";
        details = `Lead instructor changed to ${updated.celebrityTeacher || "none"}.`;
      }

      await prisma.courseActivity.create({
        data: {
          courseId: course.id,
          action,
          details,
          userId: req.user.id,
          userName: req.user.name,
        },
      });
    }

    await clearCache("cache:/api/courses");
    await clearCache(`cache:/api/courses/${req.params.id}`);
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
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this course. Admin only.",
      });
    }

    await prisma.course.delete({ where: { id: req.params.id } });
    await clearCache("cache:/api/courses");
    await clearCache(`cache:/api/courses/${req.params.id}`);
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
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Not authorized to add lessons to this course. Admin only.",
      });
    }

    const { title, content, videoUrl, order } = req.body;
    const lesson = await prisma.lesson.create({
      data: {
        title,
        content,
        videoUrl,
        order: Number(order),
        courseId: req.params.courseId,
      },
    });

    await clearCache("cache:/api/courses");
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
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete lessons from this course. Admin only.",
      });
    }

    const lesson = await prisma.lesson.findUnique({ where: { id: req.params.lessonId } });
    if (!lesson || lesson.courseId !== req.params.courseId) {
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }

    await prisma.lesson.delete({ where: { id: req.params.lessonId } });
    await clearCache("cache:/api/courses");
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

    const courses = await prisma.course.findMany({
      where: { instructorId },
      select: { id: true, price: true },
    });

    const courseIds = courses.map((c) => c.id);

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      include: { course: { select: { price: true } } },
    });

    const totalStudents = enrollments.length;
    const totalCourses = courses.length;
    const totalRevenue = enrollments.reduce(
      (sum, enr) => sum + (enr.course?.price || 0),
      0,
    );

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalCourses,
        totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get per-course analytics for the logged-in instructor
//          (enrollments, completion rate, average rating, revenue)
// @route   GET /api/courses/instructor/course-analytics
// @access  Private (Admin/Instructor — course owner only)
exports.getInstructorCourseAnalytics = async (req, res, next) => {
  try {
    const instructorId = req.user.id;

    // Single query, no N+1: fetch each owned course with just the
    // enrollment status field needed to compute completion rate.
    const courses = await prisma.course.findMany({
      where: { instructorId },
      select: {
        id: true,
        title: true,
        price: true,
        rating: true,
        enrollments: {
          select: { status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const analytics = courses.map((course) => {
      const totalEnrollments = course.enrollments.length;
      const completedEnrollments = course.enrollments.filter(
        (e) => e.status === "completed"
      ).length;

      // completionRate = (completed / enrolled) * 100, 0 when no enrollments
      const completionRate =
        totalEnrollments > 0
          ? Number(((completedEnrollments / totalEnrollments) * 100).toFixed(1))
          : 0;

      // averageRating: Course has a single stored rating field (no per-user
      // reviews table in this schema) — return 0 if never set.
      const averageRating = course.rating ? Number(course.rating.toFixed(1)) : 0;

      // revenue: this repo has no Payment/Order model, so — consistent with
      // admin.controller.js's existing revenue math — revenue = price * enrollments.
      const revenue = Number(((course.price || 0) * totalEnrollments).toFixed(2));

      return {
        courseId: course.id,
        courseTitle: course.title,
        enrollments: totalEnrollments,
        completionRate,
        averageRating,
        revenue,
      };
    });

    res.status(200).json({ success: true, data: analytics });
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
          select: { id: true, title: true, duration: true, thumbnail: true },
        },
      },
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
      include: { lessons: true },
    });

    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error:
          "Not authorized to generate lessons for this course. Admin only.",
      });
    }

    await prisma.lesson.deleteMany({
      where: { courseId },
    });

    const { generateLessonsForCourse } = require("../utils/aiGenerator");
    const lessonsData = await generateLessonsForCourse(
      course.title,
      course.category,
      course.level,
    );

    const createdLessons = [];
    for (const l of lessonsData) {
      const created = await prisma.lesson.create({
        data: {
          title: l.title,
          content: l.content,
          videoUrl: l.videoUrl,
          order: l.order,
          courseId,
        },
      });
      createdLessons.push(created);
    }

    await prisma.course.update({
      where: { id: courseId },
      data: {
        duration: `${lessonsData.length * 20} Mins`,
      },
    });

    await clearCache("cache:/api/courses");
    res.status(200).json({ success: true, data: createdLessons });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course activity timeline
// @route   GET /api/courses/:id/timeline
// @access  Private
exports.getCourseTimeline = async (req, res, next) => {
  try {
    const courseId = req.params.id;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    const activities = await prisma.courseActivity.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
};
