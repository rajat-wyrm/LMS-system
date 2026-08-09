const router = require("express").Router();
const { protect, authorize } = require("../../middlewares/auth.middleware");
const controller = require("../../controllers/audit.controller");

router.get(
  "/",
  protect,
  authorize("admin"),
  controller.getAuditLogs
);

module.exports = router;