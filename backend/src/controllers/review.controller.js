```js
const notificationService = require("../services/notification.service");
// ...
await notificationService.createNotification({
  userId: updatedReview.userId,
  title: "Instructor replied to your review",
  message: `${req.user.name} responded to your review on "${updatedReview.course.title}".`,
  category: "MESSAGE",
  link: `/courses/${updatedReview.courseId}`,
});
```

const { prisma } = require("../config/db");
const AppError = require("../utils/AppError");

// ============================================================
// Helper: Recalculate Course Rating
// ============================================================
// ONLY APPROVED reviews affect the Course.rating value.
// ============================================================
const updateCourseRating = async (courseId) => {
  const aggregate = await prisma.review.aggregate({
    where: {
      courseId,
      status: "approved",
    },
    _avg: {
      rating: true,
    },
  });

  const averageRating =
    aggregate._avg.rating !== null
      ? Number(aggregate._avg.rating.toFixed(1))
      : 0;

  await prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      rating: averageRating,
    },
  });

  return averageRating;
};

// ============================================================
// Create Review
// POST /api/v1/reviews/course/:courseId
//
// Only enrolled students can review.
// New reviews start as PENDING.
// ============================================================
const createReview = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;

    // --------------------------------------------------------
    // Validate rating
    // --------------------------------------------------------
    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return next(
        new AppError(
          "Rating must be an integer between 1 and 5",
          400,
          "VALIDATION_ERROR"
        )
      );
    }

    // --------------------------------------------------------
    // Check course
    // --------------------------------------------------------
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
      },
    });

    if (!course) {
      return next(
        new AppError(
          "Course not found",
          404,
          "RESOURCE_NOT_FOUND"
        )
      );
    }

    // --------------------------------------------------------
    // Check enrollment
    // --------------------------------------------------------
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId,
        },
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!enrollment) {
      return next(
        new AppError(
          "You must be enrolled in this course to submit a review",
          403,
          "ENROLLMENT_REQUIRED"
        )
      );
    }

    // Only active/completed students can review.
    if (
      enrollment.status !== "active" &&
      enrollment.status !== "completed"
    ) {
      return next(
        new AppError(
          "Only active or completed students can review this course",
          403,
          "REVIEW_NOT_ALLOWED"
        )
      );
    }

    // --------------------------------------------------------
    // Prevent duplicate review
    // --------------------------------------------------------
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId,
        },
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (existingReview) {
      return next(
        new AppError(
          "You have already reviewed this course",
          409,
          "REVIEW_EXISTS"
        )
      );
    }

    // --------------------------------------------------------
    // Create review
    // --------------------------------------------------------
    const review = await prisma.review.create({
      data: {
        rating: numericRating,
        comment:
          typeof comment === "string" && comment.trim()
            ? comment.trim()
            : null,

        status: "pending",

        userId: req.user.id,
        courseId,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },

        instructorResponder: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Pending review does NOT affect course rating.

    return res.status(201).json({
      success: true,
      message:
        "Review submitted successfully and is awaiting moderation",
      data: review,
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================================
// Get Course Reviews
// GET /api/v1/reviews/course/:courseId
//
// Public users only see APPROVED reviews.
// ============================================================
const getCourseReviews = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // --------------------------------------------------------
    // Check course
    // --------------------------------------------------------
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
      },
    });

    if (!course) {
      return next(
        new AppError(
          "Course not found",
          404,
          "RESOURCE_NOT_FOUND"
        )
      );
    }

    // --------------------------------------------------------
    // Get only approved reviews
    // --------------------------------------------------------
    const reviews = await prisma.review.findMany({
      where: {
        courseId,
        status: "approved",
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },

        instructorResponder: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // --------------------------------------------------------
    // Calculate summary
    // --------------------------------------------------------
    const totalReviews = reviews.length;

    const averageRating =
      totalReviews > 0
        ? Number(
            (
              reviews.reduce(
                (sum, review) => sum + review.rating,
                0
              ) / totalReviews
            ).toFixed(1)
          )
        : 0;

    const ratingDistribution = {
      5: reviews.filter((review) => review.rating === 5).length,
      4: reviews.filter((review) => review.rating === 4).length,
      3: reviews.filter((review) => review.rating === 3).length,
      2: reviews.filter((review) => review.rating === 2).length,
      1: reviews.filter((review) => review.rating === 1).length,
    };

    return res.status(200).json({
      success: true,

      data: {
        reviews,

        summary: {
          totalReviews,
          averageRating,
          ratingDistribution,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================================
// Get Single Review
// GET /api/v1/reviews/:reviewId
//
// Approved reviews are public.
// Pending/rejected reviews are visible only to:
// - Review owner
// - Admin
// ============================================================
const getReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },

        course: {
          select: {
            id: true,
            title: true,
          },
        },

        instructorResponder: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!review) {
      return next(
        new AppError(
          "Review not found",
          404,
          "RESOURCE_NOT_FOUND"
        )
      );
    }

    const isAdmin = req.user?.role === "admin";
    const isOwner = req.user?.id === review.userId;

    // Pending/rejected reviews are private.
    if (
      review.status !== "approved" &&
      !isAdmin &&
      !isOwner
    ) {
      return next(
        new AppError(
          "Review is not publicly available",
          404,
          "RESOURCE_NOT_FOUND"
        )
      );
    }

    return res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================================
// Update Own Review
// PUT /api/v1/reviews/:reviewId
//
// Editing a review sends it back to PENDING.
// ============================================================
const updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    // --------------------------------------------------------
    // Validate rating
    // --------------------------------------------------------
    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return next(
        new AppError(
          "Rating must be an integer between 1 and 5",
          400,
          "VALIDATION_ERROR"
        )
      );
    }

    // --------------------------------------------------------
    // Find review
    // --------------------------------------------------------
    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!review) {
      return next(
        new AppError(
          "Review not found",
          404,
          "RESOURCE_NOT_FOUND"
        )
      );
    }

    // --------------------------------------------------------
    // Only owner can update
    // --------------------------------------------------------
    if (review.userId !== req.user.id) {
      return next(
        new AppError(
          "You can only update your own review",
          403,
          "AUTHORIZATION_ERROR"
        )
      );
    }

    // --------------------------------------------------------
    // Update review
    // --------------------------------------------------------
    const updatedReview = await prisma.review.update({
      where: {
        id: reviewId,
      },

      data: {
        rating: numericRating,

        comment:
          typeof comment === "string" && comment.trim()
            ? comment.trim()
            : null,

        // Every edit requires moderation again.
        status: "pending",
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },

        instructorResponder: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // --------------------------------------------------------
    // Recalculate rating
    //
    // If this review was previously approved, it has now
    // become pending, so remove it from the course rating.
    // --------------------------------------------------------
    await updateCourseRating(review.courseId);

    return res.status(200).json({
      success: true,
      message:
        "Review updated successfully and sent for moderation",
      data: updatedReview,
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================================
// Delete Review
// DELETE /api/v1/reviews/:reviewId
//
// Owner or admin.
// ============================================================
const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },

      select: {
        id: true,
        userId: true,
        courseId: true,
      },
    });

    if (!review) {
      return next(
        new AppError(
          "Review not found",
          404,
          "RESOURCE_NOT_FOUND"
        )
      );
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = review.userId === req.user.id;

    if (!isOwner && !isAdmin) {
      return next(
        new AppError(
          "You can only delete your own review",
          403,
          "AUTHORIZATION_ERROR"
        )
      );
    }

    await prisma.review.delete({
      where: {
        id: reviewId,
      },
    });

    // Recalculate course rating after deletion.
    await updateCourseRating(review.courseId);

    return res.status(200).json({
      success: true,
      message: isAdmin
        ? "Review removed successfully"
        : "Review deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================================
// Admin: Moderate Review
// PATCH /api/v1/reviews/:reviewId/moderate
//
// Body:
//
// {
//   "status": "approved"
// }
//
// Allowed:
// pending
// approved
// rejected
// ============================================================
const moderateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "approved",
      "rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return next(
        new AppError(
          "Status must be one of: pending, approved, rejected",
          400,
          "VALIDATION_ERROR"
        )
      );
    }

    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },

      select: {
        id: true,
        courseId: true,
        status: true,
      },
    });

    if (!review) {
      return next(
        new AppError(
          "Review not found",
          404,
          "RESOURCE_NOT_FOUND"
        )
      );
    }

    const updatedReview = await prisma.review.update({
      where: {
        id: reviewId,
      },

      data: {
        status,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },

        course: {
          select: {
            id: true,
            title: true,
          },
        },

        instructorResponder: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Recalculate after moderation.
    //
    // APPROVED -> contributes to rating
    // PENDING  -> does not contribute
    // REJECTED -> does not contribute
    await updateCourseRating(review.courseId);

    return res.status(200).json({
      success: true,
      message: `Review ${status} successfully`,
      data: updatedReview,
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================================
// Admin: Get All Reviews For Moderation
// GET /api/v1/reviews/admin
//
// Optional:
// ?status=pending
// ?status=approved
// ?status=rejected
// ============================================================
const getAllReviewsForAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;

    const allowedStatuses = [
      "pending",
      "approved",
      "rejected",
    ];

    if (
      status &&
      !allowedStatuses.includes(status)
    ) {
      return next(
        new AppError(
          "Invalid review status",
          400,
          "VALIDATION_ERROR"
        )
      );
    }

    const reviews = await prisma.review.findMany({
      where: status
        ? {
            status,
          }
        : undefined,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },

        course: {
          select: {
            id: true,
            title: true,
            instructorId: true,
          },
        },

        reports: {
          select: {
            id: true,
            reason: true,
            details: true,
            status: true,
            reporterId: true,
            createdAt: true,
            updatedAt: true,
          },
        },

        instructorResponder: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // --------------------------------------------------------
    // Summary for admin dashboard
    // --------------------------------------------------------
    const summary = {
      total: reviews.length,

      pending: reviews.filter(
        (review) => review.status === "pending"
      ).length,

      approved: reviews.filter(
        (review) => review.status === "approved"
      ).length,

      rejected: reviews.filter(
        (review) => review.status === "rejected"
      ).length,

      reported: reviews.filter(
        (review) => review.reports.length > 0
      ).length,
    };

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        summary,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================================
// Instructor Responds To Review
// POST /api/v1/reviews/:reviewId/response
//
// Only the course instructor or admin.
// Only approved reviews can receive responses.
// ============================================================
const respondToReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { response } = req.body;

    // --------------------------------------------------------
    // Validate response
    // --------------------------------------------------------
    if (
      typeof response !== "string" ||
      !response.trim()
    ) {
      return next(
        new AppError(
          "Response is required",
          400,
          "VALIDATION_ERROR"
        )
      );
    }

    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },

      include: {
        course: {
          select: {
            id: true,
            instructorId: true,
            title: true,
          },
        },
      },
    });

    if (!review) {
      return next(
        new AppError(
          "Review not found",
          404,
          "RESOURCE_NOT_FOUND"
        )
      );
    }

    // --------------------------------------------------------
    // Only approved reviews can be answered.
    // --------------------------------------------------------
    if (review.status !== "approved") {
      return next(
        new AppError(
          "Only approved reviews can receive instructor responses",
          400,
          "REVIEW_NOT_APPROVED"
        )
      );
    }

    const isAdmin = req.user.role === "admin";

    const isCourseInstructor =
      review.course.instructorId === req.user.id;

    if (!isAdmin && !isCourseInstructor) {
      return next(
        new AppError(
          "Only the course instructor can respond to this review",
          403,
          "AUTHORIZATION_ERROR"
        )
      );
    }

    const updatedReview = await prisma.review.update({
      where: {
        id: reviewId,
      },

      data: {
        instructorResponse: response.trim(),
        instructorResponderId: req.user.id,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },

        instructorResponder: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },

        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Instructor response added successfully",
      data: updatedReview,
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================================
// Delete Instructor Response
// DELETE /api/v1/reviews/:reviewId/response
//
// Only course instructor or admin.
// ============================================================
const deleteReviewResponse = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },

      include: {
        course: {
          select: {
            instructorId: true,
          },
        },
      },
    });

    if (!review) {
      return next(
        new AppError(
          "Review not found",
          404,
          "RESOURCE_NOT_FOUND"
        )
      );
    }

    const isAdmin = req.user.role === "admin";

    const isInstructor =
      review.course.instructorId === req.user.id;

    if (!isAdmin && !isInstructor) {
      return next(
        new AppError(
          "You are not authorized to remove this response",
          403,
          "AUTHORIZATION_ERROR"
        )
      );
    }

    const updatedReview = await prisma.review.update({
      where: {
        id: reviewId,
      },

      data: {
        instructorResponse: null,
        instructorResponderId: null,
      },

      include: {
        instructorResponder: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Instructor response removed successfully",
      data: updatedReview,
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================================
// Report Review
// POST /api/v1/reviews/:reviewId/report
//
// Any authenticated user except the review owner.
// ============================================================
const reportReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { reason, details } = req.body;

    // --------------------------------------------------------
    // Validate reason
    // --------------------------------------------------------
    if (
      typeof reason !== "string" ||
      !reason.trim()
    ) {
      return next(
        new AppError(
          "Report reason is required",
          400,
          "VALIDATION_ERROR"
        )
      );
    }

    // --------------------------------------------------------
    // Check review
    // --------------------------------------------------------
    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },

      select: {
        id: true,
        userId: true,
        status: true,
      },
    });

    if (!review) {
      return next(
        new AppError(
          "Review not found",
          404,
          "RESOURCE_NOT_FOUND"
        )
      );
    }

    // --------------------------------------------------------
    // Cannot report own review
    // --------------------------------------------------------
    if (review.userId === req.user.id) {
      return next(
        new AppError(
          "You cannot report your own review",
          400,
          "INVALID_OPERATION"
        )
      );
    }

    // --------------------------------------------------------
    // Only publicly visible reviews can be reported
    // --------------------------------------------------------
    if (review.status !== "approved") {
      return next(
        new AppError(
          "Only approved reviews can be reported",
          400,
          "REVIEW_NOT_REPORTABLE"
        )
      );
    }

    // --------------------------------------------------------
    // Prevent duplicate report
    // --------------------------------------------------------
    const existingReport =
      await prisma.reviewReport.findUnique({
        where: {
          reviewId_reporterId: {
            reviewId,
            reporterId: req.user.id,
          },
        },
      });

    if (existingReport) {
      return next(
        new AppError(
          "You have already reported this review",
          409,
          "REPORT_EXISTS"
        )
      );
    }

    // --------------------------------------------------------
    // Create report
    // --------------------------------------------------------
    const report = await prisma.reviewReport.create({
      data: {
        reviewId,
        reporterId: req.user.id,
        reason: reason.trim(),

        details:
          typeof details === "string" && details.trim()
            ? details.trim()
            : null,
      },

      include: {
        review: {
          select: {
            id: true,
            courseId: true,
            status: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Review reported successfully",
      data: report,
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================================
// Get Review Reports - Admin
// GET /api/v1/reviews/reports
// ============================================================
const getReviewReports = async (req, res, next) => {
  try {
    const reports = await prisma.reviewReport.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        review: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },

            course: {
              select: {
                id: true,
                title: true,
              },
            },

            instructorResponder: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },

        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // --------------------------------------------------------
    // Report summary
    // --------------------------------------------------------
    const summary = {
      total: reports.length,

      pending: reports.filter(
        (report) => report.status === "pending"
      ).length,

      reviewed: reports.filter(
        (report) => report.status === "reviewed"
      ).length,

      dismissed: reports.filter(
        (report) => report.status === "dismissed"
      ).length,

      resolved: reports.filter(
        (report) => report.status === "resolved"
      ).length,
    };

    return res.status(200).json({
      success: true,

      data: {
        reports,
        summary,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================================
// Update Report Status - Admin
// PATCH /api/v1/reviews/reports/:reportId
//
// Body:
//
// {
//   "status": "resolved"
// }
// ============================================================
const updateReviewReport = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "reviewed",
      "dismissed",
      "resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return next(
        new AppError(
          `Status must be one of: ${allowedStatuses.join(", ")}`,
          400,
          "VALIDATION_ERROR"
        )
      );
    }

    const report = await prisma.reviewReport.findUnique({
      where: {
        id: reportId,
      },
    });

    if (!report) {
      return next(
        new AppError(
          "Report not found",
          404,
          "RESOURCE_NOT_FOUND"
        )
      );
    }

    const updatedReport =
      await prisma.reviewReport.update({
        where: {
          id: reportId,
        },

        data: {
          status,
        },
      });

    return res.status(200).json({
      success: true,
      message: "Review report updated successfully",
      data: updatedReport,
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================================
// Export Controllers
// ============================================================
module.exports = {
  createReview,
  getCourseReviews,
  getReview,
  updateReview,
  deleteReview,

  // Moderation
  moderateReview,
  getAllReviewsForAdmin,

  // Instructor response
  respondToReview,
  deleteReviewResponse,

  // Reports
  reportReview,
  getReviewReports,
  updateReviewReport,
};

