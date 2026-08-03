const bcrypt = require("bcryptjs");
const { prisma } = require("../config/db");
const { logAdminAction } = require("../utils/auditLogger");
// ─── Helpers ─────────────────────────────────────────────────────────────────
const getTrend = (curr, prev) => {
  if (prev === 0) {
    if (curr > 0) return { trend: "+100%", trendUp: true };
    return { trend: "0%", trendUp: true };
  }
  const diff = ((curr - prev) / prev) * 100;
  const trendUp = diff >= 0;
  return { trend: `${trendUp ? "+" : ""}${diff.toFixed(1)}%`, trendUp };
};

const formatRevenue = (n) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
};

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
const getStudentGrowthSnapshot = async (months = 6) => {
  const rangeStart = new Date();
  rangeStart.setMonth(rangeStart.getMonth() - (months - 1));
  rangeStart.setDate(1);
  rangeStart.setHours(0, 0, 0, 0);

  const recentStudents = await prisma.user.findMany({
    where: {
      role: "user",
      createdAt: { gte: rangeStart },
    },
    select: { createdAt: true },
  });

  const studentGrowthMap = {};
  const cursor = new Date(rangeStart);

  for (let i = 0; i < months; i++) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}`;
    studentGrowthMap[key] = {
      month: cursor.toLocaleString("default", { month: "short" }),
      students: 0,
    };
    cursor.setMonth(cursor.getMonth() + 1);
  }

  recentStudents.forEach((student) => {
    if (!student.createdAt) return;
    const date = new Date(student.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (studentGrowthMap[key]) {
      studentGrowthMap[key].students += 1;
    }
  });

  const chartData = Object.values(studentGrowthMap);
  const newStudentsThisMonth = chartData[chartData.length - 1]?.students || 0;
  const previousMonthStudents = chartData[chartData.length - 2]?.students || 0;

  let growthRate = "0.0%";
  let growthUp = true;

  if (previousMonthStudents > 0) {
    const growth =
      ((newStudentsThisMonth - previousMonthStudents) / previousMonthStudents) *
      100;
    growthRate = `${Math.abs(growth).toFixed(1)}%`;
    growthUp = growth >= 0;
  } else if (newStudentsThisMonth > 0) {
    growthRate = "100.0%";
  }

  return {
    chartData,
    newStudentsThisMonth,
    growthRate,
    growthUp,
  };
};

const buildMonthlyRevenueSeries = (enrollments, monthsToInclude = 12) => {
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);

  const revenueMap = new Map();

  for (let i = monthsToInclude - 1; i >= 0; i--) {
    const monthDate = new Date(
      currentMonthStart.getFullYear(),
      currentMonthStart.getMonth() - i,
      1,
    );
    const key = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;

    revenueMap.set(key, {
      name: monthDate.toLocaleString("en-US", { month: "short" }),
      month: monthDate.toLocaleString("en-US", { month: "short" }),
      year: monthDate.getFullYear(),
      value: 0,
      revenue: 0,
    });
  }

  enrollments.forEach((enrollment) => {
    if (!enrollment?.createdAt) return;

    const enrollmentDate = new Date(enrollment.createdAt);
    const key = `${enrollmentDate.getFullYear()}-${enrollmentDate.getMonth()}`;
    const monthEntry = revenueMap.get(key);

    if (!monthEntry) return;

    const amount = enrollment.course?.price || 0;
    monthEntry.value += amount;
    monthEntry.revenue += amount;
  });

  return Array.from(revenueMap.values());
};

// @desc    Get dashboard statistics for admin
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    let currentStart;
    let currentEnd;
    let isFiltered = false;

    if (startDate && endDate) {
      currentStart = new Date(startDate);
      currentEnd = new Date(endDate);
      if (isNaN(currentStart.getTime()) || isNaN(currentEnd.getTime())) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid date format provided." });
      }
      isFiltered = true;
    } else {
      currentEnd = new Date(now);
      currentStart = new Date(now);
      currentStart.setDate(currentStart.getDate() - 30);
    }

    const duration = currentEnd.getTime() - currentStart.getTime();
    const prevStart = new Date(currentStart.getTime() - duration);
    const prevEnd = new Date(currentStart.getTime());
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const dateFilter = { createdAt: { gte: currentStart, lte: currentEnd } };
    const prevDateFilter = { createdAt: { gte: prevStart, lt: prevEnd } };

    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      totalAdmins,
      totalCourses,
      totalEnrollments,
      weeklyEnrollments,
      completedEnrollments,
      activeEnrollments,
      pendingUsers,
      pendingCourses,
      studentsCount,
      prevStudentsCount,
      teachersCount,
      prevTeachersCount,
      coursesCount,
      prevCoursesCount,
      recentUsers,
      periodEnrollments,
      prevEnrollments,
      allEnrollments,
      lastTwelveMonthsEnrollments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "user" } }),
      prisma.user.count({ where: { role: "instructor" } }),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.enrollment.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.enrollment.count({ where: { status: "completed" } }),
      prisma.enrollment.count({ where: { status: "active" } }),
      prisma.user.count({ where: { status: "pending" } }),
      prisma.course.count({ where: { status: "pending" } }),
      prisma.user.count({ where: { role: "user", ...dateFilter } }),
      prisma.user.count({ where: { role: "user", ...prevDateFilter } }),
      prisma.user.count({
        where: { role: "instructor", status: "approved", ...dateFilter },
      }),
      prisma.user.count({
        where: { role: "instructor", status: "approved", ...prevDateFilter },
      }),
      prisma.course.count({ where: dateFilter }),
      prisma.course.count({ where: prevDateFilter }),
      prisma.user.findMany({
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
      }),
      prisma.enrollment.findMany({
        where: dateFilter,
        include: { course: { select: { price: true } } },
      }),
      prisma.enrollment.findMany({
        where: prevDateFilter,
        include: { course: { select: { price: true } } },
      }),
      prisma.enrollment.findMany({
        include: { course: { select: { price: true } } },
      }),
      prisma.enrollment.findMany({
        where: { createdAt: { gte: twelveMonthsAgo } },
        include: { course: { select: { price: true } } },
      }),
    ]);

    const completionRate =
      totalEnrollments > 0
        ? Number(((completedEnrollments / totalEnrollments) * 100).toFixed(2))
        : 0;

    const periodRevenue = periodEnrollments.reduce(
      (sum, enrollment) => sum + (enrollment.course?.price || 0),
      0,
    );
    const prevRevenue = prevEnrollments.reduce(
      (sum, enrollment) => sum + (enrollment.course?.price || 0),
      0,
    );
    const totalRevenue = allEnrollments.reduce(
      (sum, enrollment) => sum + (enrollment.course?.price || 0),
      0,
    );

    const monthlyRevenueTrend = buildMonthlyRevenueSeries(
      lastTwelveMonthsEnrollments,
      12,
    );

    const studentsTrend = getTrend(studentsCount, prevStudentsCount);
    const teachersTrend = getTrend(teachersCount, prevTeachersCount);
    const coursesTrend = getTrend(coursesCount, prevCoursesCount);
    const revenueTrendSummary = getTrend(periodRevenue, prevRevenue);
    const studentGrowth = await getStudentGrowthSnapshot(12);

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
        revenueTrend: revenueTrendSummary.trend,
        revenueTrendUp: revenueTrendSummary.trendUp,
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
        revenueChart: monthlyRevenueTrend,
        monthlyRevenueTrend,
        studentGrowth,
        isFiltered,
        pendingUsers,
        pendingCourses,
        recentUsers,
      },
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

    const where = { role: "instructor" };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [instructors, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { createdAt: "desc" },
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
              _count: { select: { enrollments: true } },
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Enrich with computed stats
    const enriched = instructors.map((inst) => {
      const activeCourses = inst.courses.filter((c) => c.status === "approved");
      const totalStudents = inst.courses.reduce(
        (s, c) => s + c._count.enrollments,
        0,
      );
      const totalRevenue = inst.courses.reduce(
        (s, c) => s + (c.price || 0) * c._count.enrollments,
        0,
      );
      const avgRating =
        inst.courses.length > 0
          ? inst.courses.reduce((s, c) => s + (c.rating || 0), 0) /
            inst.courses.length
          : 0;
      return {
        id: inst.id,
        name: inst.name,
        email: inst.email,
        status: inst.status,
        bio: inst.bio || "",
        avatar: inst.avatar || null,
        joinDate: inst.createdAt,
        courses: inst.courses.length,
        activeCourses: activeCourses.length,
        students: totalStudents,
        revenue: totalRevenue,
        rating: parseFloat(avgRating.toFixed(1)),
        enabled: inst.status === "approved",
        verified: inst.status === "approved",
      };
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
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

// ─── Dashboard: Top Performers ────────────────────────────────────────────────
// @desc    Get top performers (top course, teacher, student)
// @route   GET /api/admin/dashboard/top-performers
// @access  Private/Admin
exports.getTopPerformers = async (req, res, next) => {
  try {
    const [topCourses, topInstructors, topStudents] = await Promise.all([
      // Top course by enrollment count
      prisma.course.findMany({
        where: { status: "approved" },
        orderBy: { enrollments: { _count: "desc" } },
        take: 1,
        select: {
          id: true,
          title: true,
          rating: true,
          _count: { select: { enrollments: true } },
        },
      }),
      // Top instructor by total enrollments across all their courses
      prisma.user.findMany({
        where: { role: "instructor", status: "approved" },
        take: 10,
        select: {
          id: true,
          name: true,
          courses: {
            select: {
              rating: true,
              _count: { select: { enrollments: true } },
            },
          },
        },
      }),
      // Top student by progress
      prisma.enrollment.findMany({
        where: { progress: { gt: 0 } },
        orderBy: { progress: "desc" },
        take: 1,
        include: {
          user: { select: { id: true, name: true } },
          course: { select: { title: true } },
        },
      }),
    ]);

    // Find top instructor by total learners
    let topInstructor = null;
    if (topInstructors.length > 0) {
      let maxStudents = -1;
      for (const inst of topInstructors) {
        const students = inst.courses.reduce(
          (s, c) => s + c._count.enrollments,
          0,
        );
        const avgRating =
          inst.courses.length > 0
            ? inst.courses.reduce((s, c) => s + (c.rating || 0), 0) /
              inst.courses.length
            : 0;
        if (students > maxStudents) {
          maxStudents = students;
          topInstructor = {
            ...inst,
            totalStudents: students,
            avgRating: parseFloat(avgRating.toFixed(1)),
          };
        }
      }
    }

    const topCourse = topCourses[0] || null;
    const topStudent = topStudents[0] || null;

    res.status(200).json({
      success: true,
      data: {
        topCourse: topCourse
          ? {
              name: topCourse.title,
              enrollments: topCourse._count.enrollments,
              rating: topCourse.rating,
            }
          : null,
        topInstructor: topInstructor
          ? {
              name: topInstructor.name,
              students: topInstructor.totalStudents,
              rating: topInstructor.avgRating,
            }
          : null,
        topStudent: topStudent
          ? {
              name: topStudent.user.name,
              course: topStudent.course.title,
              progress: topStudent.progress,
            }
          : null,
      },
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
    const [recentEnrollments, recentCertificates, recentCourses, recentUsers] =
      await Promise.all([
        prisma.enrollment.findMany({
          orderBy: { createdAt: "desc" },
          take: 4,
          include: {
            user: { select: { name: true } },
            course: { select: { title: true, price: true } },
          },
        }),
        prisma.enrollment.findMany({
          where: { certificateApproved: true },
          orderBy: { updatedAt: "desc" },
          take: 2,
          include: {
            user: { select: { name: true } },
            course: { select: { title: true } },
          },
        }),
        prisma.course.findMany({
          orderBy: { createdAt: "desc" },
          take: 2,
          include: { instructor: { select: { name: true } } },
        }),
        prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          take: 2,
          select: { name: true, createdAt: true, role: true },
        }),
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
        iconKey: "enroll",
        title: `${e.user.name} enrolled`,
        desc: `Enrolled in "${e.course.title}"${e.course.price > 0 ? ` · ₹${e.course.price}` : " (free)"}`,
        time: relTime(e.createdAt),
        category: "Enrollment",
        accent: "#3B82F6",
        createdAt: e.createdAt,
      });
    }
    for (const c of recentCertificates) {
      activities.push({
        id: `cert-${c.id}`,
        iconKey: "cert",
        title: `${c.user.name} earned certificate`,
        desc: `Completed "${c.course.title}"`,
        time: relTime(c.updatedAt),
        category: "Certificate",
        accent: "#10B981",
        createdAt: c.updatedAt,
      });
    }
    for (const co of recentCourses) {
      activities.push({
        id: `course-${co.id}`,
        iconKey: "publish",
        title: `New course published`,
        desc: `"${co.title}" by ${co.instructor?.name || "Admin"}`,
        time: relTime(co.createdAt),
        category: "Course",
        accent: "#8B5CF6",
        createdAt: co.createdAt,
      });
    }

    // Sort by createdAt desc, take latest 8
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Today summary from DB
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      todayEnrollments,
      todayCerts,
      todayCourses,
      totalStudents,
      totalTeachers,
      totalAllRevenue,
    ] = await Promise.all([
      prisma.enrollment.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
      prisma.enrollment.count({
        where: {
          certificateApproved: true,
          updatedAt: { gte: today, lt: tomorrow },
        },
      }),
      prisma.course.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
      prisma.user.count({ where: { role: "user" } }),
      prisma.user.count({ where: { role: "instructor", status: "approved" } }),
      prisma.enrollment.findMany({
        include: { course: { select: { price: true } } },
      }),
    ]);

    const totalRevenue = totalAllRevenue.reduce(
      (s, e) => s + (e.course?.price || 0),
      0,
    );

    const platformSummary = [
      {
        label: "Total Students",
        value: totalStudents.toLocaleString(),
        iconKey: "students",
        accent: "#3B82F6",
        border: "rgba(59,130,246,0.3)",
        glow: "rgba(59,130,246,0.2)",
        trend: `+${todayEnrollments} today`,
        trendUp: true,
      },
      {
        label: "Total Revenue",
        value: formatRevenue(totalRevenue),
        iconKey: "revenue",
        accent: "#10B981",
        border: "rgba(16,185,129,0.3)",
        glow: "rgba(16,185,129,0.2)",
        trend: `+${todayEnrollments} enrolls`,
        trendUp: todayEnrollments > 0,
      },
      {
        label: "Certificates",
        value: (
          await prisma.enrollment.count({
            where: { certificateApproved: true },
          })
        ).toLocaleString(),
        iconKey: "certificates",
        accent: "#F59E0B",
        border: "rgba(245,158,11,0.3)",
        glow: "rgba(245,158,11,0.2)",
        trend: `+${todayCerts} today`,
        trendUp: todayCerts >= 0,
      },
      {
        label: "Active Teachers",
        value: totalTeachers.toLocaleString(),
        iconKey: "teachers",
        accent: "#8B5CF6",
        border: "rgba(139,92,246,0.3)",
        glow: "rgba(139,92,246,0.2)",
        trend: `${todayCourses} new courses`,
        trendUp: todayCourses >= 0,
      },
    ];

    res.status(200).json({
      success: true,
      data: {
        activities: activities.slice(0, 8),
        platformSummary,
      },
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
    const growthSnapshot = await getStudentGrowthSnapshot(12);

    res.status(200).json({
      success: true,
      data: growthSnapshot,
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
        const monthEnd = new Date(
          monthStart.getFullYear(),
          monthStart.getMonth() + 1,
          1,
        );
        const [newStudents, monthEnrollments] = await Promise.all([
          prisma.user.count({
            where: {
              role: "user",
              createdAt: { gte: monthStart, lt: monthEnd },
            },
          }),
          prisma.enrollment.findMany({
            where: { createdAt: { gte: monthStart, lt: monthEnd } },
            include: { course: { select: { price: true } } },
          }),
        ]);
        const revenue = monthEnrollments.reduce(
          (s, e) => s + (e.course?.price || 0),
          0,
        );
        const monthName = monthStart.toLocaleString("en-US", {
          month: "short",
        });
        return {
          name: monthName,
          students: newStudents,
          revenue: parseFloat((revenue / 100000).toFixed(2)),
        };
      }),
    );

    // Course distribution by category
    const allCourses = await prisma.course.findMany({
      where: { status: "approved" },
      select: { category: true },
    });
    const catMap = {};
    for (const c of allCourses) {
      const cat = c.category || "Other";
      catMap[cat] = (catMap[cat] || 0) + 1;
    }
    const PALETTE = [
      "#8B5CF6",
      "#06B6D4",
      "#EC4899",
      "#F59E0B",
      "#10B981",
      "#3B82F6",
    ];
    const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    const total = sortedCats.reduce((s, [, v]) => s + v, 0) || 1;
    const courseDistribution = sortedCats.map(([name, value], i) => ({
      name,
      value: Math.round((value / total) * 100),
      color: PALETTE[i % PALETTE.length],
    }));

    // KPI Summary (all-time)
    const [
      totalStudents,
      totalCourses,
      totalEnrollments,
      completedEnrollments,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "user" } }),
      prisma.course.count({ where: { status: "approved" } }),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { status: "completed" } }),
    ]);
    const allEnrollmentsForRevenue = await prisma.enrollment.findMany({
      include: { course: { select: { price: true } } },
    });
    const totalRevenue = allEnrollmentsForRevenue.reduce(
      (s, e) => s + (e.course?.price || 0),
      0,
    );
    const completionRate =
      totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 100)
        : 0;
    const activeUsers = await prisma.enrollment.count({
      where: { status: "active" },
    });

    // Engagement (weekly day-of-week enrollment counts as proxy)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekEnrollments = await prisma.enrollment.findMany({
      where: { createdAt: { gte: weekAgo } },
      select: { createdAt: true },
    });
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    for (const e of weekEnrollments) {
      dayCounts[new Date(e.createdAt).getDay()]++;
    }
    const engagementData = days.map((name, i) => ({
      name,
      sessions: dayCounts[i],
      avgDuration: 0,
    }));

    // Funnel (all-time)
    const totalUsers = await prisma.user.count();
    const funnelStages = [
      { stage: "Signups", count: totalUsers, pct: 100, color: "#3B82F6" },
      {
        stage: "Enrolled",
        count: totalEnrollments,
        pct:
          totalUsers > 0
            ? parseFloat(((totalEnrollments / totalUsers) * 100).toFixed(1))
            : 0,
        color: "#8B5CF6",
      },
      {
        stage: "Completed",
        count: completedEnrollments,
        pct:
          totalUsers > 0
            ? parseFloat(((completedEnrollments / totalUsers) * 100).toFixed(1))
            : 0,
        color: "#10B981",
      },
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
          students: {
            value: totalStudents.toLocaleString(),
            raw: totalStudents,
          },
          activeUsers: {
            value: activeUsers.toLocaleString(),
            raw: activeUsers,
          },
          completionRate: { value: `${completionRate}%`, raw: completionRate },
        },
      },
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
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      role,
      status,
    } = req.query;
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 50;
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
    if (sortBy) orderBy[sortBy] = sortOrder === "asc" ? "asc" : "desc";

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
          bio: true,
          avatar: true,
          createdAt: true,
          enrollments: {
            select: {
              id: true,
              progress: true,
              status: true,
              mentor: true,
              certificateApproved: true,
              createdAt: true,
              course: { select: { id: true, title: true, price: true } },
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Enrich users with computed fields
    const enriched = users.map((u) => {
      const activeEnrollment =
        u.enrollments.find(
          (e) => e.status === "active" || e.status === "completed",
        ) || u.enrollments[0];
      const certificates = u.enrollments.filter(
        (e) => e.certificateApproved,
      ).length;
      const avgProgress =
        u.enrollments.length > 0
          ? Math.round(
              u.enrollments.reduce((s, e) => s + e.progress, 0) /
                u.enrollments.length,
            )
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
        enrollments: u.enrollments,
      };
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
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

// @desc    Get single user with full details (admin)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getAdminUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        bio: true,
        avatar: true,
        createdAt: true,
        enrollments: {
          include: {
            course: {
              select: { id: true, title: true, price: true, category: true },
            },
            completedLessons: { select: { id: true } },
          },
        },
      },
    });
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });
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
        error: "Please provide at least one field to update.",
      });
    }

    const allowedStatuses = ["pending", "approved", "rejected", "suspended"];
    const allowedRoles = ["user", "instructor", "admin"];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status.",
      });
    }

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Invalid role.",
      });
    }

    if (
      req.params.id === req.user?.id &&
      (status === "suspended" || role !== undefined)
    ) {
      return res.status(403).json({
        success: false,
        error: "Cannot modify your own account this way",
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
exports.deleteAdminUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user?.id) {
      return res
        .status(403)
        .json({ success: false, error: "Cannot delete your own account" });
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
      message: "User deleted successfully.",
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
exports.createAdminCourse = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      level = "Beginner",
      price,
      thumbnail,
      instructorId,
      duration,
      status = "pending",
      xp,
      gradient,
      icon,
    } = req.body;
    if (!title || !description || !category || !instructorId)
      return res.status(400).json({
        success: false,
        error: "Title, description, category, and instructor are required.",
      });
    const [instructor, categoryRecord] = await Promise.all([
      prisma.user.findFirst({
        where: { id: instructorId, role: "instructor", status: "approved" },
        select: { id: true },
      }),
      prisma.category.findUnique({ where: { name: category } }),
    ]);
    if (!instructor)
      return res
        .status(400)
        .json({ success: false, error: "Selected instructor was not found." });
    if (!categoryRecord)
      return res
        .status(400)
        .json({ success: false, error: "Selected category was not found." });
    if (!["pending", "approved", "rejected"].includes(status))
      return res
        .status(400)
        .json({ success: false, error: "Invalid course status." });
    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        categoryId: categoryRecord.id,
        level,
        price: Number(price) || 0,
        thumbnail: thumbnail || null,
        instructorId,
        duration: duration || null,
        status,
        xp: xp || null,
        gradient: gradient || null,
        icon: icon || null,
      },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        _count: { select: { enrollments: true, lessons: true } },
      },
    });
    await logAdminAction({
      adminId: req.user.id,
      action: "CREATE",
      resource: "COURSE",
      resourceId: course.id,
      details: `Created course "${course.title}"`,
    });
    res.status(201).json({
      success: true,
      data: {
        ...course,
        students: course._count.enrollments,
        lessons: course._count.lessons,
        revenue: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create instructor
// @route   POST /api/admin/instructors
// @access  Private/Admin
exports.createInstructor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      bio,
      avatar,
      status = "approved",
    } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters long.",
      });
    }

    if (!["pending", "approved", "rejected", "suspended"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid instructor status.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "A user with this email already exists.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const instructor = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "instructor",
        status,
        bio: bio?.trim() || null,
        avatar: avatar || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });
    await logAdminAction({
      adminId: req.user.id,
      action: "CREATE",
      resource: "INSTRUCTOR",
      resourceId: instructor.id,
      details: `Created instructor "${instructor.name}"`,
    });

    res.status(201).json({ success: true, data: instructor });
  } catch (error) {
    next(error);
  }
};

// @desc    Update instructor
// @route   PUT /api/admin/instructors/:id
// @access  Private/Admin
exports.updateInstructor = async (req, res, next) => {
  try {
    const { name, email, password, bio, avatar, status } = req.body;

    const existingInstructor = await prisma.user.findFirst({
      where: { id: req.params.id, role: "instructor" },
      select: { id: true },
    });

    if (!existingInstructor) {
      return res.status(404).json({
        success: false,
        error: "Instructor not found.",
      });
    }

    const updateData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio?.trim() || null;
    if (avatar !== undefined) updateData.avatar = avatar || null;

    if (status !== undefined) {
      if (!["pending", "approved", "rejected", "suspended"].includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Invalid instructor status.",
        });
      }

      updateData.status = status;
    }

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();
      const conflict = await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          NOT: { id: req.params.id },
        },
        select: { id: true },
      });

      if (conflict) {
        return res.status(409).json({
          success: false,
          error: "A user with this email already exists.",
        });
      }

      updateData.email = normalizedEmail;
    }

    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          error: "Password must be at least 8 characters long.",
        });
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const instructor = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });
    await logAdminAction({
      adminId: req.user.id,
      action: "UPDATE",
      resource: "INSTRUCTOR",
      resourceId: instructor.id,
      details: `Updated instructor "${instructor.name}"`,
    });

    res.status(200).json({ success: true, data: instructor });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete instructor
// @route   DELETE /api/admin/instructors/:id
// @access  Private/Admin
exports.deleteInstructor = async (req, res, next) => {
  try {
    const existingInstructor = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        role: "instructor",
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!existingInstructor) {
      return res.status(404).json({
        success: false,
        error: "Instructor not found.",
      });
    }

    // Save details before deleting
    const instructorId = existingInstructor.id;
    const instructorName = existingInstructor.name;

    await prisma.user.delete({
      where: { id: req.params.id },
    });

    // Audit Log
    await logAdminAction({
      adminId: req.user.id,
      action: "DELETE",
      resource: "INSTRUCTOR",
      resourceId: instructorId,
      details: `Deleted instructor "${instructorName}"`,
    });

    res.status(200).json({
      success: true,
      message: "Instructor deleted successfully.",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Build dashboard notifications from current database state
// @route   GET /api/admin/dashboard/notifications
// @access  Private/Admin
exports.getDashboardNotifications = async (req, res, next) => {
  try {
    const [
      pendingUsers,
      pendingCourses,
      recentEnrollments,
      pendingCertificates,
    ] = await Promise.all([
      prisma.user.findMany({
        where: { status: "pending" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, role: true, createdAt: true },
      }),
      prisma.course.findMany({
        where: { status: "pending" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, createdAt: true },
      }),
      prisma.enrollment.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { name: true } },
          course: { select: { title: true } },
        },
      }),
      prisma.enrollment.findMany({
        where: { progress: 100, certificateApproved: false },
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: {
          user: { select: { name: true } },
          course: { select: { title: true } },
        },
      }),
    ]);
    const notifications = [
      ...pendingUsers.map((user) => ({
        id: `user-${user.id}`,
        title: `${user.name} awaits approval`,
        desc: `New ${user.role === "instructor" ? "instructor" : "learner"} registration`,
        createdAt: user.createdAt,
        category: "enrollment",
        priority: true,
        type: "user_approval",
        link: "/dashboard/admin/users",
      })),
      ...pendingCourses.map((course) => ({
        id: `course-${course.id}`,
        title: `${course.title} awaits publication`,
        desc: "Course is pending administrator approval",
        createdAt: course.createdAt,
        category: "courseUpdate",
        priority: true,
        type: "course_approval",
        link: "/dashboard/admin/courses",
      })),
      ...recentEnrollments.map((enrollment) => ({
        id: `enrollment-${enrollment.id}`,
        title: `${enrollment.user.name} enrolled`,
        desc: `Enrolled in ${enrollment.course.title}`,
        createdAt: enrollment.createdAt,
        category: "enrollment",
        priority: false,
        type: "enrollment",
        link: `/courses/${enrollment.courseId}`,
      })),
      ...pendingCertificates.map((enrollment) => ({
        id: `certificate-${enrollment.id}`,
        title: `Certificate ready for ${enrollment.user.name}`,
        desc: `${enrollment.course.title} has been completed`,
        createdAt: enrollment.updatedAt,
        category: "completion",
        priority: false,
        type: "certificate",
        link: "/dashboard/admin/certificates",
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

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
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 50;
    const skip = (pageNumber - 1) * limitNumber;

    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (level) where.level = level;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { instructor: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const orderBy = {};
    if (sortBy) orderBy[sortBy] = sortOrder === "asc" ? "asc" : "desc";

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy,
        skip,
        take: limitNumber,
        include: {
          instructor: { select: { id: true, name: true, email: true } },
          _count: { select: { enrollments: true, lessons: true } },
        },
      }),
      prisma.course.count({ where }),
    ]);

    // Compute revenue per course
    const enriched = courses.map((c) => {
      const revenue = (c._count.enrollments || 0) * (c.price || 0);
      return {
        ...c,
        revenue,
        students: c._count.enrollments,
        lessons: c._count.lessons,
      };
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
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

// @desc    Update course status or details (admin)
// @route   PUT /api/admin/courses/:id
// @access  Private/Admin
exports.updateCourseStatus = async (req, res, next) => {
  try {
    const allowed = [
      "status",
      "title",
      "description",
      "category",
      "level",
      "price",
      "thumbnail",
      "gradient",
      "icon",
      "xp",
    ];
    const updateData = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updateData[key] = req.body[key];
    }
    if (updateData.category !== undefined) {
      const categoryRecord = await prisma.category.findUnique({
        where: { name: updateData.category },
      });
      if (!categoryRecord)
        return res
          .status(400)
          .json({ success: false, error: "Selected category was not found." });
      updateData.categoryId = categoryRecord.id;
    }
    if (updateData.price !== undefined)
      updateData.price = parseFloat(updateData.price) || 0;

    const allowedStatuses = ["pending", "approved", "rejected"];
    if (updateData.status && !allowedStatuses.includes(updateData.status)) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid status. Allowed values are: pending, approved, rejected.",
      });
    }

    const existingCourse = await prisma.course.findUnique({
      where: { id: req.params.id },
    });
    if (!existingCourse) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: updateData,
      include: { instructor: { select: { id: true, name: true } } },
    });

    // Log the change
    const changedFields = [];
    for (const key of Object.keys(updateData)) {
      if (updateData[key] !== existingCourse[key]) changedFields.push(key);
    }

    if (changedFields.length > 0) {
      let action = "edited";
      let details = `Updated course details: ${changedFields.join(", ")}.`;

      if (changedFields.includes("status") && course.status === "approved") {
        action = "published";
        details = "Course approved and published.";
      } else if (changedFields.includes("instructorId")) {
        action = "instructor_changed";
        details = `Lead instructor changed to ${course.celebrityTeacher || course.instructor?.name || "none"}.`;
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

      // Audit Log
      await logAdminAction({
        adminId: req.user.id,
        action: action.toUpperCase(),
        resource: "COURSE",
        resourceId: course.id,
        details,
      });
    }

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
    const existingCourse = await prisma.course.findUnique({
      where: { id: req.params.id },
    });

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Store details before deleting
    const courseId = existingCourse.id;
    const courseTitle = existingCourse.title;

    await prisma.course.delete({
      where: { id: req.params.id },
    });

    // Audit Log
    await logAdminAction({
      adminId: req.user.id,
      action: "DELETE",
      resource: "COURSE",
      resourceId: courseId,
      details: `Deleted course "${courseTitle}"`,
    });

    res.status(200).json({
      success: true,
      data: {},
    });
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
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: req.params.id },
    });
    if (!enrollment)
      return res
        .status(404)
        .json({ success: false, error: "Enrollment not found" });
    if (enrollment.progress < 100)
      return res.status(400).json({
        success: false,
        error: "Course not yet completed (progress < 100%)",
      });
    const updated = await prisma.enrollment.update({
      where: { id: req.params.id },
      data: { certificateApproved: true },
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
        course: { select: { id: true, title: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    next(error);
  }
};
