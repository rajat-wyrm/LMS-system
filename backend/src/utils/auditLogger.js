const { prisma } = require("../config/db");

const logAdminAction = async ({
  adminId,
  action,
 resource,
  resourceId = null,
  details = null,
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        adminId,
        action,
        resource,
        resourceId,
        details,
      },
    });
  } catch (err) {
    console.error("Audit log failed:", err);
  }
};

module.exports = {
  logAdminAction,
};