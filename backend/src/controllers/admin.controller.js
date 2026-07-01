const { prisma } = require("../config/db"); // Trigger restart for history endpoint

// @desc    Get dashboard statistics for admin
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalStudents = await prisma.user.count({ where: { role: "user" } });
    const totalInstructors = await prisma.user.count({
      where: { role: "instructor" },
    });
    const totalAdmins = await prisma.user.count({ where: { role: "admin" } });
    const totalCourses = await prisma.course.count();
    const totalEnrollments = await prisma.enrollment.count();

    const now = new Date();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Weekly enrollments (ROLLING 7 DAYS)
    const weeklyEnrollments = await prisma.enrollment.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });
    //completed enrollments
    const completedEnrollments = await prisma.enrollment.count({
      where: {
        status: "completed",
      },
    });

    let completionRate = 0;

    if (totalEnrollments > 0) {
      completionRate = (completedEnrollments / totalEnrollments) * 100;
    }

    completionRate = Number(completionRate.toFixed(2));
    const activeEnrollments = await prisma.enrollment.count({
      where: { status: "active" },
    });

    const pendingUsers = await prisma.user.count({
      where: { status: "pending" },
    });
    const pendingCourses = await prisma.course.count({
      where: { status: "pending" },
    });

    // Calculate revenue
    const allEnrollments = await prisma.enrollment.findMany({
      include: { course: { select: { price: true } } },
    });
    const totalRevenue = allEnrollments.reduce(
      (sum, enr) => sum + (enr.course?.price || 0),
      0,
    );

    // Get recent 5 users for activity feed
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
        totalUsers,
        totalStudents,
        totalInstructors,
        totalAdmins,
        totalCourses,
        totalEnrollments,
        weeklyEnrollments,
        completedEnrollments,
        completionRate,
        activeEnrollments,
        totalRevenue,
        pendingUsers,
        pendingCourses,
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
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
// exports.updateUserStatus = async (req, res, next) => {
//   try {
//     const { status, role } = req.body;
//     const updateData = {};
//     if (status) updateData.status = status;
//     if (role) updateData.role = role;

//     const user = await prisma.user.update({
//       where: { id: req.params.id },
//       data: updateData,
//       select: { id: true, name: true, email: true, role: true, status: true },
//     });
//     res.status(200).json({ success: true, data: user });
//   } catch (error) {
//     next(error);
//   }
// };

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status, role } = req.body;

    // Nothing to update
    if (!status && !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide status or role to update.",
      });
    }

    // Allowed values
    const allowedStatuses = [
      "pending",
      "approved",
      "rejected",
      "suspended",
    ];

    const allowedRoles = [
      "user",
      "instructor",
      "admin",
    ];

    // Validate status
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status.",
      });
    }

    // Validate role
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role.",
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Update only provided fields
    const updateData = {};

    if (status) updateData.status = status;
    if (role) updateData.role = role;

    const updatedUser = await prisma.user.update({
      where: {
        id: req.params.id,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: updatedUser,
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
// exports.deleteAdminUser = async (req, res, next) => {
//   try {
//     await prisma.user.delete({ where: { id: req.params.id } });
//     res.status(200).json({ success: true, data: {} });
//   } catch (error) {
//     next(error);
//   }
// };

exports.deleteAdminUser = async (req, res, next) => {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Delete user
    await prisma.user.delete({
      where: {
        id: req.params.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });

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
