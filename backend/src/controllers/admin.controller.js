const { prisma } = require('../config/db');

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getTrend = (curr, prev) => {
  if (prev === 0) {
    if (curr > 0) return { trend: '+100%', trendUp: true };
    return { trend: '0%', trendUp: true };
  }
  const diff = ((curr - prev) / prev) * 100;
  const trendUp = diff >= 0;
  return { trend: `${trendUp ? '+' : ''}${diff.toFixed(1)}%`, trendUp };
};

const formatRevenue = (n) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
};

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
// @desc    Get dashboard statistics for admin
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let currentStart, currentEnd;
    let isFiltered = false;

    if (startDate && endDate) {
      currentStart = new Date(startDate);
      currentEnd = new Date(endDate);
      if (isNaN(currentStart.getTime()) || isNaN(currentEnd.getTime())) {
        return res.status(400).json({ success: false, error: 'Invalid date format provided.' });
      }
      isFiltered = true;
    } else {
      currentEnd = new Date();
      currentStart = new Date(currentEnd.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const duration = currentEnd.getTime() - currentStart.getTime();
    const prevStart = new Date(currentStart.getTime() - duration);
    const prevEnd = new Date(currentStart.getTime());

    const dateFilter = isFiltered ? { createdAt: { gte: currentStart, lte: currentEnd } } : {};
    const prevDateFilter = { createdAt: { gte: prevStart, lte: prevEnd } };

    // Use Promise.all to run all queries in parallel
    const [
      studentsCount, prevStudentsCount,
      teachersCount, prevTeachersCount,
      coursesCount, prevCoursesCount,
      totalUsers, totalStudents, totalInstructors, totalAdmins,
      totalCourses, totalEnrollments, activeEnrollments,
      pendingUsers, pendingCourses,
      recentUsers,
      periodEnrollments, allEnrollments
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'user', ...dateFilter } }),
      prisma.user.count({ where: { role: 'user', ...prevDateFilter } }),
      prisma.user.count({ where: { role: 'instructor', status: 'approved', ...dateFilter } }),
      prisma.user.count({ where: { role: 'instructor', status: 'approved', ...prevDateFilter } }),
      prisma.course.count({ where: { ...dateFilter } }),
      prisma.course.count({ where: { ...prevDateFilter } }),
      prisma.user.count(),
      prisma.user.count({ where: { role: 'user' } }),
      prisma.user.count({ where: { role: 'instructor' } }),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { status: 'active' } }),
      prisma.user.count({ where: { status: 'pending' } }),
      prisma.course.count({ where: { status: 'pending' } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
      }),
      // Revenue for current period
      prisma.enrollment.findMany({
        where: { ...dateFilter },
        include: { course: { select: { price: true } } }
      }),
      // Total revenue (all time)
      prisma.enrollment.findMany({
        include: { course: { select: { price: true } } }
      })
    ]);

    const periodRevenue = periodEnrollments.reduce((s, e) => s + (e.course?.price || 0), 0);
    const totalRevenue = allEnrollments.reduce((s, e) => s + (e.course?.price || 0), 0);

    // For previous period revenue, query separately
    const prevEnrollments = await prisma.enrollment.findMany({
      where: { ...prevDateFilter },
      include: { course: { select: { price: true } } }
    });
    const prevRevenue = prevEnrollments.reduce((s, e) => s + (e.course?.price || 0), 0);

    const studentsTrend = getTrend(studentsCount, prevStudentsCount);
    const teachersTrend = getTrend(teachersCount, prevTeachersCount);
    const coursesTrend = getTrend(coursesCount, prevCoursesCount);
    const revenueTrend = getTrend(periodRevenue, prevRevenue);

    res.status(200).json({
      success: true,
      data: {
        studentsCount,
        studentsTrend: studentsTrend.trend,
        studentsTrendUp: studentsTrend.trendUp,
        teachersCount,
        teachersTrend: teachersTrend.trend,
        teachersTrendUp: teachersTrend.trendUp,
        coursesCount,
        coursesTrend: coursesTrend.trend,
        coursesTrendUp: coursesTrend.trendUp,
        revenueCount: periodRevenue,
        revenueTrend: revenueTrend.trend,
        revenueTrendUp: revenueTrend.trendUp,
        totalUsers,
        totalStudents,
        totalInstructors,
        totalAdmins,
        totalCourses,
        totalEnrollments,
        activeEnrollments,
        totalRevenue,
        pendingUsers,
        pendingCourses,
        recentUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Instructors (Teachers) ───────────────────────────────────────────────────
// @desc    Get all instructors with stats
// @route   GET /api/admin/instructors
// @access  Private/Admin
exports.getInstructors = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, status } = req.query;
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 50;
    const skip = (pageNumber - 1) * limitNumber;

    const where = { role: 'instructor' };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [instructors, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          bio: true,
          avatar: true,
          createdAt: true,
          courses: {
            select: {
              id: true,
              title: true,
              price: true,
              rating: true,
              status: true,
              _count: { select: { enrollments: true } }
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    // Enrich with computed stats
    const enriched = instructors.map((inst) => {
      const activeCourses = inst.courses.filter(c => c.status === 'approved');
      const totalStudents = inst.courses.reduce((s, c) => s + c._count.enrollments, 0);
      const totalRevenue = inst.courses.reduce((s, c) => s + (c.price || 0) * c._count.enrollments, 0);
      const avgRating = inst.courses.length > 0
        ? inst.courses.reduce((s, c) => s + (c.rating || 0), 0) / inst.courses.length
        : 0;
      return {
        id: inst.id,
        name: inst.name,
        email: inst.email,
        status: inst.status,
        bio: inst.bio || '',
        avatar: inst.avatar || null,
        joinDate: inst.createdAt,
        courses: inst.courses.length,
        activeCourses: activeCourses.length,
        students: totalStudents,
        revenue: totalRevenue,
        rating: parseFloat(avgRating.toFixed(1)),
        enabled: inst.status === 'approved',
        verified: inst.status === 'approved',
      };
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
      meta: { total, page: pageNumber, limit: limitNumber, totalPages: Math.ceil(total / limitNumber) }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Dashboard: Top Performers ────────────────────────────────────────────────
// @desc    Get top performers (top course, teacher, student)
// @route   GET /api/admin/dashboard/top-performers
// @access  Private/Admin
exports.getTopPerformers = async (req, res, next) => {
  try {
    const [topCourses, topInstructors, topStudents] = await Promise.all([
      // Top course by enrollment count
      prisma.course.findMany({
        where: { status: 'approved' },
        orderBy: { enrollments: { _count: 'desc' } },
        take: 1,
        select: {
          id: true, title: true, rating: true,
          _count: { select: { enrollments: true } }
        }
      }),
      // Top instructor by total enrollments across all their courses
      prisma.user.findMany({
        where: { role: 'instructor', status: 'approved' },
        take: 10,
        select: {
          id: true, name: true,
          courses: {
            select: {
              rating: true,
              _count: { select: { enrollments: true } }
            }
          }
        }
      }),
      // Top student by progress
      prisma.enrollment.findMany({
        where: { progress: { gt: 0 } },
        orderBy: { progress: 'desc' },
        take: 1,
        include: {
          user: { select: { id: true, name: true } },
          course: { select: { title: true } }
        }
      })
    ]);

    // Find top instructor by total learners
    let topInstructor = null;
    if (topInstructors.length > 0) {
      let maxStudents = -1;
      for (const inst of topInstructors) {
        const students = inst.courses.reduce((s, c) => s + c._count.enrollments, 0);
        const avgRating = inst.courses.length > 0
          ? inst.courses.reduce((s, c) => s + (c.rating || 0), 0) / inst.courses.length
          : 0;
        if (students > maxStudents) {
          maxStudents = students;
          topInstructor = { ...inst, totalStudents: students, avgRating: parseFloat(avgRating.toFixed(1)) };
        }
      }
    }

    const topCourse = topCourses[0] || null;
    const topStudent = topStudents[0] || null;

    res.status(200).json({
      success: true,
      data: {
        topCourse: topCourse ? {
          name: topCourse.title,
          enrollments: topCourse._count.enrollments,
          rating: topCourse.rating
        } : null,
        topInstructor: topInstructor ? {
          name: topInstructor.name,
          students: topInstructor.totalStudents,
          rating: topInstructor.avgRating
        } : null,
        topStudent: topStudent ? {
          name: topStudent.user.name,
          course: topStudent.course.title,
          progress: topStudent.progress
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Dashboard: Recent Activity ───────────────────────────────────────────────
// @desc    Get recent platform activity
// @route   GET /api/admin/dashboard/recent-activity
// @access  Private/Admin
exports.getRecentActivity = async (req, res, next) => {
  try {
    const [recentEnrollments, recentCertificates, recentCourses, recentUsers] = await Promise.all([
      prisma.enrollment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 4,
        include: {
          user: { select: { name: true } },
          course: { select: { title: true, price: true } }
        }
      }),
      prisma.enrollment.findMany({
        where: { certificateApproved: true },
        orderBy: { updatedAt: 'desc' },
        take: 2,
        include: {
          user: { select: { name: true } },
          course: { select: { title: true } }
        }
      }),
      prisma.course.findMany({
        orderBy: { createdAt: 'desc' },
        take: 2,
        include: { instructor: { select: { name: true } } }
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 2,
        select: { name: true, createdAt: true, role: true }
      })
    ]);

    const activities = [];
    const now = new Date();
    const relTime = (d) => {
      const diff = Math.floor((now - new Date(d)) / 60000);
      if (diff < 60) return `${diff}m ago`;
      if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
      return `${Math.floor(diff / 1440)}d ago`;
    };

    for (const e of recentEnrollments) {
      activities.push({
        id: `enroll-${e.id}`,
        iconKey: 'enroll',
        title: `${e.user.name} enrolled`,
        desc: `Enrolled in "${e.course.title}"${e.course.price > 0 ? ` · ₹${e.course.price}` : ' (free)'}`,
        time: relTime(e.createdAt),
        category: 'Enrollment',
        accent: '#3B82F6',
        createdAt: e.createdAt
      });
    }
    for (const c of recentCertificates) {
      activities.push({
        id: `cert-${c.id}`,
        iconKey: 'cert',
        title: `${c.user.name} earned certificate`,
        desc: `Completed "${c.course.title}"`,
        time: relTime(c.updatedAt),
        category: 'Certificate',
        accent: '#10B981',
        createdAt: c.updatedAt
      });
    }
    for (const co of recentCourses) {
      activities.push({
        id: `course-${co.id}`,
        iconKey: 'publish',
        title: `New course published`,
        desc: `"${co.title}" by ${co.instructor?.name || 'Admin'}`,
        time: relTime(co.createdAt),
        category: 'Course',
        accent: '#8B5CF6',
        createdAt: co.createdAt
      });
    }

    // Sort by createdAt desc, take latest 8
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Today summary from DB
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayEnrollments, todayCerts, todayCourses, totalStudents, totalTeachers, totalAllRevenue] = await Promise.all([
      prisma.enrollment.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      prisma.enrollment.count({ where: { certificateApproved: true, updatedAt: { gte: today, lt: tomorrow } } }),
      prisma.course.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      prisma.user.count({ where: { role: 'user' } }),
      prisma.user.count({ where: { role: 'instructor', status: 'approved' } }),
      prisma.enrollment.findMany({ include: { course: { select: { price: true } } } })
    ]);

    const totalRevenue = totalAllRevenue.reduce((s, e) => s + (e.course?.price || 0), 0);

    const platformSummary = [
      { label: 'Total Students', value: totalStudents.toLocaleString(), iconKey: 'students', accent: '#3B82F6', border: 'rgba(59,130,246,0.3)', glow: 'rgba(59,130,246,0.2)', trend: `+${todayEnrollments} today`, trendUp: true },
      { label: 'Total Revenue', value: formatRevenue(totalRevenue), iconKey: 'revenue', accent: '#10B981', border: 'rgba(16,185,129,0.3)', glow: 'rgba(16,185,129,0.2)', trend: `+${todayEnrollments} enrolls`, trendUp: todayEnrollments > 0 },
      { label: 'Certificates', value: (await prisma.enrollment.count({ where: { certificateApproved: true } })).toLocaleString(), iconKey: 'certificates', accent: '#F59E0B', border: 'rgba(245,158,11,0.3)', glow: 'rgba(245,158,11,0.2)', trend: `+${todayCerts} today`, trendUp: todayCerts >= 0 },
      { label: 'Active Teachers', value: totalTeachers.toLocaleString(), iconKey: 'teachers', accent: '#8B5CF6', border: 'rgba(139,92,246,0.3)', glow: 'rgba(139,92,246,0.2)', trend: `${todayCourses} new courses`, trendUp: todayCourses >= 0 },
    ];

    res.status(200).json({
      success: true,
      data: {
        activities: activities.slice(0, 8),
        platformSummary
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Dashboard: Student Growth Chart ─────────────────────────────────────────
// @desc    Get monthly student enrollment counts for last 6 months
// @route   GET /api/admin/dashboard/student-growth
// @access  Private/Admin
exports.getStudentGrowth = async (req, res, next) => {
  try {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d);
    }

    const monthlyData = await Promise.all(
      months.map(async (monthStart) => {
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
        const count = await prisma.user.count({
          where: { role: 'user', createdAt: { gte: monthStart, lt: monthEnd } }
        });
        const monthName = monthStart.toLocaleString('en-US', { month: 'short' });
        return { month: monthName, students: count };
      })
    );

    // Cumulative total
    let cumulative = await prisma.user.count({
      where: { role: 'user', createdAt: { lt: months[0] } }
    });
    const cumulativeData = monthlyData.map(d => {
      cumulative += d.students;
      return { month: d.month, students: cumulative, newStudents: d.students };
    });

    // Compute growth rate
    const latest = cumulativeData[cumulativeData.length - 1]?.students || 0;
    const prev = cumulativeData[cumulativeData.length - 2]?.students || 0;
    const growth = prev > 0 ? (((latest - prev) / prev) * 100).toFixed(1) : '0.0';
    const newThisMonth = monthlyData[monthlyData.length - 1]?.students || 0;

    res.status(200).json({
      success: true,
      data: {
        chartData: cumulativeData,
        newStudentsThisMonth: newThisMonth,
        growthRate: `${growth}%`,
        growthUp: parseFloat(growth) >= 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Analytics Overview ───────────────────────────────────────────────────────
// @desc    Get analytics data (monthly revenue, student growth, course categories)
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d);
    }

    // Monthly student registrations and revenue
    const monthlyStats = await Promise.all(
      months.map(async (monthStart) => {
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
        const [newStudents, monthEnrollments] = await Promise.all([
          prisma.user.count({ where: { role: 'user', createdAt: { gte: monthStart, lt: monthEnd } } }),
          prisma.enrollment.findMany({
            where: { createdAt: { gte: monthStart, lt: monthEnd } },
            include: { course: { select: { price: true } } }
          })
        ]);
        const revenue = monthEnrollments.reduce((s, e) => s + (e.course?.price || 0), 0);
        const monthName = monthStart.toLocaleString('en-US', { month: 'short' });
        return { name: monthName, students: newStudents, revenue: parseFloat((revenue / 100000).toFixed(2)) };
      })
    );

    // Course distribution by category
    const allCourses = await prisma.course.findMany({
      where: { status: 'approved' },
      select: { category: true }
    });
    const catMap = {};
    for (const c of allCourses) {
      const cat = c.category || 'Other';
      catMap[cat] = (catMap[cat] || 0) + 1;
    }
    const PALETTE = ['#8B5CF6', '#06B6D4', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
    const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    const total = sortedCats.reduce((s, [, v]) => s + v, 0) || 1;
    const courseDistribution = sortedCats.map(([name, value], i) => ({
      name,
      value: Math.round((value / total) * 100),
      color: PALETTE[i % PALETTE.length]
    }));

    // KPI Summary (all-time)
    const [totalStudents, totalCourses, totalEnrollments, completedEnrollments] = await Promise.all([
      prisma.user.count({ where: { role: 'user' } }),
      prisma.course.count({ where: { status: 'approved' } }),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { status: 'completed' } })
    ]);
    const allEnrollmentsForRevenue = await prisma.enrollment.findMany({
      include: { course: { select: { price: true } } }
    });
    const totalRevenue = allEnrollmentsForRevenue.reduce((s, e) => s + (e.course?.price || 0), 0);
    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;
    const activeUsers = await prisma.enrollment.count({ where: { status: 'active' } });

    // Engagement (weekly day-of-week enrollment counts as proxy)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekEnrollments = await prisma.enrollment.findMany({
      where: { createdAt: { gte: weekAgo } },
      select: { createdAt: true }
    });
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    for (const e of weekEnrollments) {
      dayCounts[new Date(e.createdAt).getDay()]++;
    }
    const engagementData = days.map((name, i) => ({ name, sessions: dayCounts[i], avgDuration: 0 }));

    // Funnel (all-time)
    const totalUsers = await prisma.user.count();
    const funnelStages = [
      { stage: 'Signups', count: totalUsers, pct: 100, color: '#3B82F6' },
      { stage: 'Enrolled', count: totalEnrollments, pct: totalUsers > 0 ? parseFloat(((totalEnrollments / totalUsers) * 100).toFixed(1)) : 0, color: '#8B5CF6' },
      { stage: 'Completed', count: completedEnrollments, pct: totalUsers > 0 ? parseFloat(((completedEnrollments / totalUsers) * 100).toFixed(1)) : 0, color: '#10B981' },
    ];

    res.status(200).json({
      success: true,
      data: {
        monthlyStats,
        courseDistribution,
        engagementData,
        funnelStages,
        kpiSummary: {
          revenue: { value: formatRevenue(totalRevenue), raw: totalRevenue },
          students: { value: totalStudents.toLocaleString(), raw: totalStudents },
          activeUsers: { value: activeUsers.toLocaleString(), raw: activeUsers },
          completionRate: { value: `${completionRate}%`, raw: completionRate }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Admin Users ──────────────────────────────────────────────────────────────
// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAdminUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, role, status } = req.query;
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 50;
    const skip = (pageNumber - 1) * limitNumber;

    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const orderBy = {};
    if (sortBy) orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limitNumber,
        select: {
          id: true, name: true, email: true, role: true, status: true,
          bio: true, avatar: true, createdAt: true,
          enrollments: {
            select: {
              id: true, progress: true, status: true, mentor: true,
              certificateApproved: true, createdAt: true,
              course: { select: { id: true, title: true, price: true } }
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    // Enrich users with computed fields
    const enriched = users.map(u => {
      const activeEnrollment = u.enrollments.find(e => e.status === 'active' || e.status === 'completed') || u.enrollments[0];
      const certificates = u.enrollments.filter(e => e.certificateApproved).length;
      const avgProgress = u.enrollments.length > 0
        ? Math.round(u.enrollments.reduce((s, e) => s + e.progress, 0) / u.enrollments.length)
        : 0;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        avatar: u.avatar,
        bio: u.bio,
        createdAt: u.createdAt,
        enrolledCourse: activeEnrollment?.course?.title || null,
        mentorName: activeEnrollment?.mentor || null,
        progress: avgProgress,
        certificates,
        enrollmentsCount: u.enrollments.length,
        enrollments: u.enrollments
      };
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
      meta: { total, page: pageNumber, limit: limitNumber, totalPages: Math.ceil(total / limitNumber) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user with full details (admin)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getAdminUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, email: true, role: true, status: true,
        bio: true, avatar: true, createdAt: true,
        enrollments: {
          include: {
            course: { select: { id: true, title: true, price: true, category: true } },
            completedLessons: { select: { id: true } }
          }
        }
      }
    });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status/role/name/email (admin)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status, role, name, email } = req.body;

    if (!status && !role && !name && !email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one field to update.',
      });
    }

    const allowedStatuses = ['pending', 'approved', 'rejected', 'suspended'];
    const allowedRoles = ['user', 'instructor', 'admin'];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status.',
      });
    }

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role.',
      });
    }

    if (req.params.id === req.user?.id && (status === 'suspended' || role !== undefined)) {
      return res.status(403).json({
        success: false,
        error: 'Cannot modify your own account this way',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (role) updateData.role = role;
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
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
      message: 'User updated successfully.',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteAdminUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user?.id) {
      return res.status(403).json({ success: false, error: 'Cannot delete your own account' });
    }
    const existingUser = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }

    await prisma.user.delete({
      where: { id: req.params.id },
    });

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// ─── Admin Courses ────────────────────────────────────────────────────────────
// @desc    Get all courses (admin, including non-approved)
// @route   GET /api/admin/courses
// @access  Private/Admin
exports.getAdminCourses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, status, category, level } = req.query;
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 50;
    const skip = (pageNumber - 1) * limitNumber;

    const where = {};
    if (status) where.status = status;
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
    if (sortBy) orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where, orderBy, skip, take: limitNumber,
        include: {
          instructor: { select: { id: true, name: true, email: true } },
          _count: { select: { enrollments: true, lessons: true } }
        }
      }),
      prisma.course.count({ where })
    ]);

    // Compute revenue per course
    const enriched = await Promise.all(courses.map(async (c) => {
      const revenue = (c._count.enrollments || 0) * (c.price || 0);
      return { ...c, revenue, students: c._count.enrollments, lessons: c._count.lessons };
    }));

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
      meta: { total, page: pageNumber, limit: limitNumber, totalPages: Math.ceil(total / limitNumber) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course status or details (admin)
// @route   PUT /api/admin/courses/:id
// @access  Private/Admin
exports.updateCourseStatus = async (req, res, next) => {
  try {
    const allowed = ['status', 'title', 'description', 'category', 'level', 'price', 'thumbnail', 'celebrityTeacher', 'gradient', 'icon', 'xp'];
    const updateData = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updateData[key] = req.body[key];
    }
    if (updateData.price !== undefined) updateData.price = parseFloat(updateData.price) || 0;
    const existingCourse = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!existingCourse) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: updateData,
      include: { instructor: { select: { id: true, name: true } } }
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
    const existingCourse = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!existingCourse) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    await prisma.course.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// ─── Certificates ─────────────────────────────────────────────────────────────
// @desc    Get all pending certificates
// @route   GET /api/admin/certificates/pending
// @access  Private/Admin
exports.getPendingCertificates = async (req, res, next) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { progress: 100, certificateApproved: false },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } }
      },
      orderBy: { updatedAt: 'asc' }
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
    const enrollment = await prisma.enrollment.findUnique({ where: { id: req.params.id } });
    if (!enrollment) return res.status(404).json({ success: false, error: 'Enrollment not found' });
    if (enrollment.progress < 100) return res.status(400).json({ success: false, error: 'Course not yet completed (progress < 100%)' });
    const updated = await prisma.enrollment.update({
      where: { id: req.params.id },
      data: { certificateApproved: true }
    });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all approved certificates
// @route   GET /api/admin/certificates/approved
// @access  Private/Admin
exports.getApprovedCertificates = async (req, res, next) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { progress: 100, certificateApproved: true },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    next(error);
  }
};
