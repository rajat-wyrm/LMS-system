const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');
const logger = require('../utils/logger');

let io = null;

// Mirrors the CORS allow-list used by the REST API in src/app.js
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL,
].filter(Boolean);

const userRoom = (userId) => `user:${userId}`;
const roleRoom = (role) => `role:${role}`;

/**
 * Attach Socket.IO to the existing HTTP server. Call this once from server.js
 * before the server starts listening.
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        // Preserve existing dev-friendly CORS behavior used elsewhere in the app
        callback(null, true);
      },
      credentials: true,
    },
  });

  // Authenticate every socket connection with the same JWT issued by /auth/login
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, role: true, name: true },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const { id: userId, role } = socket.user;

    // Every notification for this user is delivered to their private room only
    socket.join(userRoom(userId));
    if (role) socket.join(roleRoom(role));

    logger.info(`[socket] user ${userId} connected (${socket.id})`);

    socket.on('disconnect', (reason) => {
      logger.info(`[socket] user ${userId} disconnected (${reason})`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized. Call initSocket(httpServer) first.');
  }
  return io;
};

const emitToUser = (userId, event, payload) => {
  if (!io || !userId) return;
  io.to(userRoom(userId)).emit(event, payload);
};

const emitToUsers = (userIds, event, payload) => {
  if (!io || !userIds?.length) return;
  io.to(userIds.map(userRoom)).emit(event, payload);
};

const emitToRole = (role, event, payload) => {
  if (!io || !role) return;
  io.to(roleRoom(role)).emit(event, payload);
};

const emitToAll = (event, payload) => {
  if (!io) return;
  io.emit(event, payload);
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToUsers,
  emitToRole,
  emitToAll,
};
