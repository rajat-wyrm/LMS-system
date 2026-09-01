const { z } = require("zod");

// ─── Constants ───────────────────────────────────────────────
const ALLOWED_RESOURCE_TYPES = ["video", "document", "image", "audio", "archive", "other"];

const MIME_TYPE_MAP = {
  video: ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-matroska"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/markdown",
  ],
  image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/avif"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", "audio/flac"],
  archive: ["application/zip", "application/x-rar-compressed", "application/x-7z-compressed", "application/gzip"],
};

// Max sizes per type (bytes)
const MAX_SIZE_MAP = {
  video: 500 * 1024 * 1024,      // 500 MB
  document: 50 * 1024 * 1024,    // 50 MB
  image: 10 * 1024 * 1024,       // 10 MB
  audio: 100 * 1024 * 1024,      // 100 MB
  archive: 200 * 1024 * 1024,    // 200 MB
  other: 50 * 1024 * 1024,       // 50 MB
};

// ─── Helpers ─────────────────────────────────────────────────
const getResourceTypeFromMime = (mimeType) => {
  for (const [type, mimes] of Object.entries(MIME_TYPE_MAP)) {
    if (mimes.includes(mimeType)) return type;
  }
  return "other";
};

const isValidMimeForType = (mimeType, resourceType) => {
  if (resourceType === "other") return true;
  const allowed = MIME_TYPE_MAP[resourceType] || [];
  return allowed.includes(mimeType);
};

const getMaxSizeForType = (resourceType) => {
  return MAX_SIZE_MAP[resourceType] || MAX_SIZE_MAP.other;
};

// ─── Zod Schemas ─────────────────────────────────────────────
const uploadResourceSchema = z.object({
  body: z.object({
    courseId: z.string({ required_error: "courseId is required" }).min(1, "courseId cannot be empty"),
    lessonId: z.string().optional().nullable(),
    resourceType: z
      .enum(ALLOWED_RESOURCE_TYPES, { required_error: "resourceType is required" })
      .optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

const updateResourceSchema = z.object({
  body: z.object({
    fileName: z.string().min(1).max(255).optional(),
    resourceType: z.enum(ALLOWED_RESOURCE_TYPES).optional(),
    status: z.enum(["active", "archived"]).optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

const listResourcesQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().default("1"),
    limit: z.string().regex(/^\d+$/).optional().default("20"),
    resourceType: z.enum(ALLOWED_RESOURCE_TYPES).optional(),
    status: z.enum(["active", "archived", "deleted"]).optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "fileName", "size"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

module.exports = {
  uploadResourceSchema,
  updateResourceSchema,
  listResourcesQuerySchema,
  ALLOWED_RESOURCE_TYPES,
  MIME_TYPE_MAP,
  MAX_SIZE_MAP,
  getResourceTypeFromMime,
  isValidMimeForType,
  getMaxSizeForType,
};
