const { prisma } = require("../config/db");
const redisClient = require("../services/redis.service");

// @desc    Get dashboard statistics for admin
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    // ── Basic counts ────────────────────────────────────────────────────────
    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      totalAdmins,
      totalCourses,
      totalEnrollments,
      activeEnrollments,
      pendingUsers,
      pendingCourses,
    
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "user" } }),
      prisma.user.count({ where: { role: "instructor" } }),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { status: "active" } }),
      prisma.user.count({ where: { status: "pending" } }),
      prisma.course.count({ where: { status: "pending" } }),
    ]);

    // ── 1. Weekly enrollments (last 7 days) ─────────────────────────────────
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyEnrollments = await prisma.enrollment.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    // ── 2. Course completion rate ────────────────────────────────────────────
    const completedEnrollments = await prisma.enrollment.count({
      where: { status: "completed" },
    });

    const completionRate =
      totalEnrollments === 0
        ? 0
        : Number(((completedEnrollments / totalEnrollments) * 100).toFixed(2));

    // ── 3. Monthly revenue breakdown (last 6 months) ────────────────────────
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const recentEnrollments = await prisma.enrollment.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      include: { course: { select: { price: true } } },
      orderBy: { createdAt: "asc" },
    });

    // Aggregate revenue by month label (e.g. "Jan 25")
    const revenueMap = {};
    recentEnrollments.forEach((enr) => {
      const d = new Date(enr.createdAt);
      const label = d.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
      revenueMap[label] = (revenueMap[label] || 0) + (enr.course?.price || 0);
    });
    // Build ordered array covering all 6 months (fill 0 for empty months)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
      monthlyRevenue.push({ month: label, revenue: revenueMap[label] || 0 });
    }

    // Also include all-time revenue
    const allEnrollments = await prisma.enrollment.findMany({
      include: { course: { select: { price: true } } },
    });
    const allTimeRevenue = allEnrollments.reduce(
      (sum, enr) => sum + (enr.course?.price || 0),
      0,
    );

    // ── 4. Student growth over time (new users per month, last 6 months) ────
    const newStudents = await prisma.user.findMany({
      where: { role: "user", createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const growthMap = {};
    newStudents.forEach((u) => {
      const d = new Date(u.createdAt);
      const label = d.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
      growthMap[label] = (growthMap[label] || 0) + 1;
    });
    const studentGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
      studentGrowth.push({ month: label, students: growthMap[label] || 0 });
    }

    // ── Recent activity feed ─────────────────────────────────────────────────
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        // Basic counts
        totalUsers,
        totalStudents,
        totalInstructors,
        totalAdmins,
        totalCourses,
        totalEnrollments,
        activeEnrollments,
        pendingUsers,
        pendingCourses,
        // New metrics
        weeklyEnrollments,
        completionRate, // e.g. 34.2  (percentage)
        completedEnrollments,
        totalRevenue: allTimeRevenue,
        monthlyRevenue, // [ { month: "Jan 25", revenue: 120 }, ... ]
        studentGrowth, // [ { month: "Jan 25", students: 12 }, ... ]
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    System health — DB + Redis ping
// @route   GET /api/admin/health
// @access  Private/Admin
exports.getSystemHealth = async (req, res, next) => {
  const health = { db: "error", redis: "error", status: "degraded" };
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.db = "ok";
  } catch (err) {
    health.dbError = err.message;
  }

  try {
    await redisClient.ping();
    health.redis = "ok";
  } catch (err) {
    health.redisError = err.message;
  }

  health.status =
    health.db === "ok" && health.redis === "ok" ? "ok" : "degraded";
  const statusCode = health.status === "ok" ? 200 : 503;
  res
    .status(statusCode)
    .json({ success: health.status === "ok", data: health });
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAdminUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      role,
      status,
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where = {};

    if (role) where.role = role;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder === "asc" ? "asc" : "desc";
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limitNumber,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
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

// @desc    Update user status/role (admin)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status, role } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (role) updateData.role = role;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, status: true },
    });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteAdminUser = async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all courses (admin, including non-approved)
// @route   GET /api/admin/courses
// @access  Private/Admin
exports.getAdminCourses = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      status,
      category,
      level,
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (level) where.level = level;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { celebrityTeacher: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder === "asc" ? "asc" : "desc";
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy,
        skip,
        take: limitNumber,
        include: {
          instructor: { select: { id: true, name: true, email: true } },
          _count: { select: { enrollments: true } },
        },
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

// @desc    Update course status (admin approve/reject)
// @route   PUT /api/admin/courses/:id
// @access  Private/Admin
exports.updateCourseStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: { status },
      include: { instructor: { select: { id: true, name: true } } },
    });
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course (admin)
// @route   DELETE /api/admin/courses/:id
// @access  Private/Admin
exports.deleteAdminCourse = async (req, res, next) => {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pending certificates
// @route   GET /api/admin/certificates/pending
// @access  Private/Admin
exports.getPendingCertificates = async (req, res, next) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        progress: 100,
        certificateApproved: false,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { updatedAt: "asc" },
    });
    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a certificate
// @route   PUT /api/admin/certificates/:id/approve
// @access  Private/Admin
exports.approveCertificate = async (req, res, next) => {
  try {
    const enrollment = await prisma.enrollment.update({
      where: { id: req.params.id },
      data: { certificateApproved: true },
    });
    res.status(200).json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all approved certificates (History)
// @route   GET /api/admin/certificates/approved
// @access  Private/Admin
exports.getApprovedCertificates = async (req, res, next) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        progress: 100,
        certificateApproved: true,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    next(error);
  }
};
