const notificationService = require('../services/notification.service');
const AppError = require('../utils/AppError');

// @desc    Get paginated notifications for the logged-in user
// @route   GET /api/v1/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const data = await notificationService.listNotifications(req.user.id, { page, limit });
    res.status(200).json({
      success: true,
      data: data.notifications,
      unreadCount: data.unreadCount,
      meta: data.meta,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread notification count for the logged-in user
// @route   GET /api/v1/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    const unreadCount = await notificationService.getUnreadCount(req.user.id);
    res.status(200).json({ success: true, data: { unreadCount } });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/v1/notifications/:id/read
// @access  Private
exports.markRead = async (req, res, next) => {
  try {
    const updated = await notificationService.markAsRead(req.user.id, req.params.id);
    if (!updated) {
      return next(new AppError('Notification not found', 404, 'RESOURCE_NOT_FOUND'));
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read for the logged-in user
// @route   PATCH /api/v1/notifications/read-all
// @access  Private
exports.markAllRead = async (req, res, next) => {
  try {
    const data = await notificationService.markAllAsRead(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a notification to all users, or to specific roles
// @route   POST /api/v1/admin/notifications/broadcast
// @access  Private/Admin
exports.broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, category, link, roles } = req.body;

    if (!title || !String(title).trim() || !message || !String(message).trim()) {
      return next(new AppError('Title and message are required', 400, 'VALIDATION_ERROR'));
    }

    const allowedRoles = ['user', 'instructor', 'admin'];
    if (roles !== undefined) {
      if (!Array.isArray(roles) || roles.some((r) => !allowedRoles.includes(r))) {
        return next(
          new AppError(
            `Invalid roles. Allowed values are: ${allowedRoles.join(', ')}`,
            400,
            'VALIDATION_ERROR'
          )
        );
      }
    }

    const result = await notificationService.createBroadcast({
      title: title.trim(),
      message: message.trim(),
      category,
      link,
      roles,
    });

    res.status(201).json({
      success: true,
      message: `Broadcast sent to ${result.count} user(s)`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
