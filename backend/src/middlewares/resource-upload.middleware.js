const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const AppError = require("../utils/AppError");

// Ensure resources upload directory exists
const uploadDir = path.join(__dirname, "../../uploads/resources");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Build a nested directory path from a courseId to avoid
 * dumping everything into a single flat folder.
 */
const resolveCourseDir = (courseId) => {
  // shard by first 2 chars of courseId for filesystem efficiency
  const shard = courseId.slice(0, 2);
  const dir = path.join(uploadDir, shard, courseId);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // courseId is expected in req.body (validated after multer runs,
    // so we fall back to a temp folder if missing)
    const courseId = req.body?.courseId || "unclassified";
    cb(null, resolveCourseDir(courseId));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `res-${uniqueSuffix}${ext}`);
  },
});

/**
 * Allowed MIME types for course resources.
 */
const ALLOWED_MIME_TYPES = [
  // Video
  "video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-matroska",
  // Document
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain", "text/markdown",
  // Image
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/avif",
  // Audio
  "audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", "audio/flac",
  // Archive
  "application/zip", "application/x-rar-compressed", "application/x-7z-compressed", "application/gzip",
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `File type "${file.mimetype}" is not allowed. Allowed types: video, document, image, audio, archive.`,
        400,
        "VALIDATION_ERROR"
      ),
      false
    );
  }
};

/**
 * Multer error handler wrapper — converts MulterError into AppError
 * so the global error middleware responds uniformly.
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(
        new AppError("File too large. Maximum allowed size is 500 MB.", 413, "VALIDATION_ERROR")
      );
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return next(
        new AppError(`Unexpected field: "${err.field}". Use "file" as the field name.`, 400, "VALIDATION_ERROR")
      );
    }
    return next(new AppError(err.message, 400, "VALIDATION_ERROR"));
  }
  if (err) {
    return next(err);
  }
  next();
};

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB hard ceiling
    files: 1,
  },
  fileFilter,
});

module.exports = upload;
module.exports.handleMulterError = handleMulterError;
