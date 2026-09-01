const { prisma } = require("../config/db");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
const {
  generateStorageKey,
  generateStoragePath,
  validateFileMetadata,
  sanitizeMetadata,
  buildResourceWhere,
} = require("../services/resource.service");

// @desc    Upload a course resource file and store metadata
// @route   POST /api/v1/resources/upload
// @access  Private (Admin / Instructor)
exports.uploadResource = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError("No file uploaded", 400, "VALIDATION_ERROR"));
    }

    const { courseId, lessonId, resourceType, metadata } = req.body;
    const userId = req.user.id;

    // 1. Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, instructorId: true },
    });
    if (!course) {
      return next(new AppError("Course not found", 404, "RESOURCE_NOT_FOUND"));
    }

    // 2. Authorization: admin or course instructor
    const isAdmin = req.user.role === "admin";
    const isInstructor = course.instructorId === userId;
    if (!isAdmin && !isInstructor) {
      return next(
        new AppError("Not authorized to upload resources for this course", 403, "AUTHORIZATION_ERROR")
      );
    }

    // 3. Validate lesson if provided
    if (lessonId) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        select: { id: true, courseId: true },
      });
      if (!lesson || lesson.courseId !== courseId) {
        return next(new AppError("Lesson not found in this course", 404, "RESOURCE_NOT_FOUND"));
      }
    }

    // 4. Validate file type & size
    const { effectiveType } = validateFileMetadata(req.file, resourceType || null);

    // 5. Generate unique storage identifiers
    const storageKey = generateStorageKey(courseId, req.file.originalname);
    const storagePath = generateStoragePath(storageKey);

    // 6. Persist metadata
    const resource = await prisma.courseResource.create({
      data: {
        courseId,
        lessonId: lessonId || null,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        storagePath,
        storageKey,
        resourceType: effectiveType,
        status: "active",
        uploadedBy: userId,
        metadata: sanitizeMetadata(metadata),
      },
      include: {
        uploader: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
        lesson: { select: { id: true, title: true } },
      },
    });

    logger.info({ resourceId: resource.id, courseId, userId }, "Course resource uploaded");

    res.status(201).json({
      success: true,
      message: "Resource uploaded and metadata stored successfully",
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all resources for a course (paginated, filterable)
// @route   GET /api/v1/resources/course/:courseId
// @access  Private
exports.getResourcesByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const {
      page = "1",
      limit = "20",
      resourceType,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = buildResourceWhere(courseId, { resourceType, status });

    // If student, only show active resources
    if (req.user.role === "user") {
      where.status = "active";
    }

    const [resources, total] = await Promise.all([
      prisma.courseResource.findMany({
        where,
        include: {
          uploader: { select: { id: true, name: true, email: true } },
          lesson: { select: { id: true, title: true, order: true } },
        },
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.courseResource.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single resource by ID
// @route   GET /api/v1/resources/:id
// @access  Private
exports.getResourceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const resource = await prisma.courseResource.findUnique({
      where: { id },
      include: {
        uploader: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, thumbnail: true } },
        lesson: { select: { id: true, title: true, order: true } },
      },
    });

    if (!resource) {
      return next(new AppError("Resource not found", 404, "RESOURCE_NOT_FOUND"));
    }

    // Students can only access active resources
    if (req.user.role === "user" && resource.status !== "active") {
      return next(new AppError("Resource not found", 404, "RESOURCE_NOT_FOUND"));
    }

    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resource metadata
// @route   PATCH /api/v1/resources/:id
// @access  Private (Admin / Instructor / Uploader)
exports.updateResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fileName, resourceType, status, metadata } = req.body;
    const userId = req.user.id;

    const resource = await prisma.courseResource.findUnique({
      where: { id },
      select: { id: true, uploadedBy: true, courseId: true },
    });

    if (!resource) {
      return next(new AppError("Resource not found", 404, "RESOURCE_NOT_FOUND"));
    }

    // Authorization
    const isAdmin = req.user.role === "admin";
    const isUploader = resource.uploadedBy === userId;
    const course = await prisma.course.findUnique({
      where: { id: resource.courseId },
      select: { instructorId: true },
    });
    const isInstructor = course?.instructorId === userId;

    if (!isAdmin && !isUploader && !isInstructor) {
      return next(
        new AppError("Not authorized to update this resource", 403, "AUTHORIZATION_ERROR")
      );
    }

    const updateData = {};
    if (fileName !== undefined) updateData.fileName = fileName;
    if (resourceType !== undefined) updateData.resourceType = resourceType;
    if (status !== undefined) updateData.status = status;
    if (metadata !== undefined) updateData.metadata = sanitizeMetadata(metadata);

    const updated = await prisma.courseResource.update({
      where: { id },
      data: updateData,
      include: {
        uploader: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
        lesson: { select: { id: true, title: true } },
      },
    });

    logger.info({ resourceId: id, userId }, "Course resource updated");

    res.status(200).json({
      success: true,
      message: "Resource updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft-delete a resource
// @route   DELETE /api/v1/resources/:id
// @access  Private (Admin / Instructor / Uploader)
exports.deleteResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const resource = await prisma.courseResource.findUnique({
      where: { id },
      select: { id: true, uploadedBy: true, courseId: true, status: true },
    });

    if (!resource) {
      return next(new AppError("Resource not found", 404, "RESOURCE_NOT_FOUND"));
    }

    if (resource.status === "deleted") {
      return next(new AppError("Resource already deleted", 400, "VALIDATION_ERROR"));
    }

    // Authorization
    const isAdmin = req.user.role === "admin";
    const isUploader = resource.uploadedBy === userId;
    const course = await prisma.course.findUnique({
      where: { id: resource.courseId },
      select: { instructorId: true },
    });
    const isInstructor = course?.instructorId === userId;

    if (!isAdmin && !isUploader && !isInstructor) {
      return next(
        new AppError("Not authorized to delete this resource", 403, "AUTHORIZATION_ERROR")
      );
    }

    const deleted = await prisma.courseResource.update({
      where: { id },
      data: { status: "deleted" },
    });

    logger.info({ resourceId: id, userId }, "Course resource soft-deleted");

    res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore a soft-deleted resource
// @route   PATCH /api/v1/resources/:id/restore
// @access  Private (Admin / Instructor)
exports.restoreResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const resource = await prisma.courseResource.findUnique({
      where: { id },
      select: { id: true, courseId: true, status: true },
    });

    if (!resource) {
      return next(new AppError("Resource not found", 404, "RESOURCE_NOT_FOUND"));
    }

    const isAdmin = req.user.role === "admin";
    const course = await prisma.course.findUnique({
      where: { id: resource.courseId },
      select: { instructorId: true },
    });
    const isInstructor = course?.instructorId === userId;

    if (!isAdmin && !isInstructor) {
      return next(
        new AppError("Not authorized to restore this resource", 403, "AUTHORIZATION_ERROR")
      );
    }

    const restored = await prisma.courseResource.update({
      where: { id },
      data: { status: "active" },
    });

    logger.info({ resourceId: id, userId }, "Course resource restored");

    res.status(200).json({
      success: true,
      message: "Resource restored successfully",
      data: restored,
    });
  } catch (error) {
    next(error);
  }
};
