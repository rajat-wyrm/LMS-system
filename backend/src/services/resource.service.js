const crypto = require("crypto");
const path = require("path");
const {
  getResourceTypeFromMime,
  isValidMimeForType,
  getMaxSizeForType,
} = require("../validations/resource.validation");
const AppError = require("../utils/AppError");

/**
 * Generate a unique storage key for a course resource.
 * Format: {courseId}/{timestamp}-{random}-{sanitizedName}
 */
const generateStorageKey = (courseId, originalName) => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString("hex");
  const ext = path.extname(originalName).toLowerCase();
  const base = path.basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 40);
  return `${courseId}/${timestamp}-${random}-${base}${ext}`;
};

/**
 * Generate a unique storage path (public URL segment).
 */
const generateStoragePath = (storageKey) => {
  return `/uploads/resources/${storageKey}`;
};

/**
 * Validate file metadata against type/size rules.
 * Throws AppError on violation.
 */
const validateFileMetadata = (file, declaredType = null) => {
  const { mimetype, size, originalname } = file;

  // Infer or verify resource type
  const inferredType = getResourceTypeFromMime(mimetype);
  const effectiveType = declaredType || inferredType;

  if (declaredType && !isValidMimeForType(mimetype, declaredType)) {
    throw new AppError(
      `MIME type "${mimetype}" is not allowed for resource type "${declaredType}"`,
      400,
      "VALIDATION_ERROR"
    );
  }

  // Size check
  const maxSize = getMaxSizeForType(effectiveType);
  if (size > maxSize) {
    const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
    const sizeMB = (size / (1024 * 1024)).toFixed(2);
    throw new AppError(
      `File size ${sizeMB} MB exceeds the ${maxMB} MB limit for ${effectiveType} resources`,
      413,
      "VALIDATION_ERROR"
    );
  }

  // Extension validation (basic safety)
  const ext = path.extname(originalname).toLowerCase();
  const dangerousExts = [".exe", ".bat", ".cmd", ".sh", ".dll", ".msi"];
  if (dangerousExts.includes(ext)) {
    throw new AppError(
      `File extension "${ext}" is not allowed for security reasons`,
      400,
      "VALIDATION_ERROR"
    );
  }

  return { effectiveType, maxSize };
};

/**
 * Sanitize metadata object — strip unknown keys, enforce max depth.
 */
const sanitizeMetadata = (metadata = {}) => {
  if (typeof metadata !== "object" || metadata === null) return {};
  const allowedKeys = ["title", "description", "tags", "language", "duration", "resolution", "transcriptUrl"];
  const sanitized = {};
  for (const key of allowedKeys) {
    if (key in metadata) {
      const val = metadata[key];
      if (typeof val === "string" || typeof val === "number" || Array.isArray(val)) {
        sanitized[key] = val;
      }
    }
  }
  return sanitized;
};

/**
 * Build Prisma where clause for resource listing.
 */
const buildResourceWhere = (courseId, filters = {}) => {
  const where = { courseId };
  if (filters.resourceType) where.resourceType = filters.resourceType;
  if (filters.status) where.status = filters.status;
  else where.status = { not: "deleted" }; // default: exclude soft-deleted
  return where;
};

module.exports = {
  generateStorageKey,
  generateStoragePath,
  validateFileMetadata,
  sanitizeMetadata,
  buildResourceWhere,
};
