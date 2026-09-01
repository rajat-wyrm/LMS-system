const express = require("express");
const {
  uploadResource,
  getResourcesByCourse,
  getResourceById,
  updateResource,
  deleteResource,
  restoreResource,
} = require("../../controllers/resource.controller");
const { protect, authorize } = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validate.middleware");
const upload = require("../../middlewares/resource-upload.middleware");
const {
  uploadResourceSchema,
  updateResourceSchema,
  listResourcesQuerySchema,
} = require("../../validations/resource.validation");

const router = express.Router();

// ─── Upload ──────────────────────────────────────────────────
router.post(
  "/upload",
  protect,
  authorize("admin", "instructor"),
  upload.single("file"),
  validate(uploadResourceSchema),
  uploadResource
);

// ─── List by Course ──────────────────────────────────────────
router.get(
  "/course/:courseId",
  protect,
  validate(listResourcesQuerySchema),
  getResourcesByCourse
);

// ─── Single Resource ─────────────────────────────────────────
router
  .route("/:id")
  .get(protect, getResourceById)
  .patch(protect, validate(updateResourceSchema), updateResource)
  .delete(protect, deleteResource);

// ─── Restore ─────────────────────────────────────────────────
router.patch("/:id/restore", protect, authorize("admin", "instructor"), restoreResource);

module.exports = router;
