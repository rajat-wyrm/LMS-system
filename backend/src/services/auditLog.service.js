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
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
};

module.exports = {
  logAdminAction,
};
