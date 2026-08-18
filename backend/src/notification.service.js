const { prisma } = require('../config/db');
const { emitToUser, emitToUsers } = require('./socket.service');
const logger = require('../utils/logger');

const NOTIFICATION_CATEGORIES = [
  'COURSE',
  'ASSIGNMENT',
  'QUIZ',
  'ANNOUNCEMENT',
  'SYSTEM',
  'PAYMENT',
  'MESSAGE',
];

const toSafeCategory = (category) =>
  NOTIFICATION_CATEGORIES.includes(category) ? category : 'SYSTEM';

/**
 * Create a single notification for one user, persist it, and push it live
 * over the socket if they're connected. Safe to call from anywhere in the
 * app (e.g. after an enrollment, a certificate approval, a review reply...).
 */
const createNotification = async ({ userId, title, message, category, link, isBroadcast = false }) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      category: toSafeCategory(category),
      link: link || null,
      isBroadcast,
    },
  });

  try {
    const unreadCount = await getUnreadCount(userId);
    emitToUser(userId, 'notification:new', notification);
    emitToUser(userId, 'notification:count', { unreadCount });
  } catch (err) {
    // Real-time delivery is best-effort; the notification is already persisted
    logger.error({ err }, 'Failed to emit real-time notification');
  }

  return notification;
};

/**
 * Fan a notification out to every user, or to a specific set of roles.
 * Each recipient gets their own persisted row so isRead stays per-user.
 */
const createBroadcast = async ({ title, message, category, link, roles }) => {
  const where = roles?.length ? { role: { in: roles } } : {};
  const recipients = await prisma.user.findMany({ where, select: { id: true } });

  if (recipients.length === 0) {
    return { count: 0 };
  }

  const safeCategory = toSafeCategory(category);

  const result = await prisma.notification.createMany({
    data: recipients.map((r) => ({
      userId: r.id,
      title,
      message,
      category: safeCategory,
      link: link || null,
      isBroadcast: true,
    })),
  });

  const payload = {
    title,
    message,
    category: safeCategory,
    link: link || null,
    isBroadcast: true,
    createdAt: new Date().toISOString(),
  };

  const userIds = recipients.map((r) => r.id);

  // One lightweight event so every connected client can render the toast/list entry
  emitToUsers(userIds, 'notification:broadcast', payload);

  // Badge counts differ per user (depends on their existing unread notifications),
  // so refresh each one individually rather than emitting a single shared number.
  await Promise.all(
    userIds.map(async (id) => {
      const unreadCount = await getUnreadCount(id);
      emitToUser(id, 'notification:count', { unreadCount });
    })
  );

  return { count: result.count };
};

const listNotifications = async (userId, { page = 1, limit = 20 } = {}) => {
  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (pageNumber - 1) * limitNumber;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNumber,
    }),
    prisma.notification.count({ where: { userId } }),
    getUnreadCount(userId),
  ]);

  return {
    notifications,
    unreadCount,
    meta: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber) || 1,
    },
  };
};

const getUnreadCount = async (userId) =>
  prisma.notification.count({ where: { userId, isRead: false } });

const markAsRead = async (userId, notificationId) => {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });

  if (!notification || notification.userId !== userId) {
    return null;
  }

  const updated = notification.isRead
    ? notification
    : await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

  const unreadCount = await getUnreadCount(userId);

  // Push the read state to every other open tab/device for this user
  emitToUser(userId, 'notification:read', { id: notificationId });
  emitToUser(userId, 'notification:count', { unreadCount });

  return updated;
};

const markAllAsRead = async (userId) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  emitToUser(userId, 'notification:read-all', {});
  emitToUser(userId, 'notification:count', { unreadCount: 0 });

  return { unreadCount: 0 };
};

module.exports = {
  NOTIFICATION_CATEGORIES,
  createNotification,
  createBroadcast,
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
