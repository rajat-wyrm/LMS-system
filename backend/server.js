require('dotenv').config();

const app = require('./src/app');
const { connectDB, prisma } = require('./src/config/db');
const logger = require('./src/utils/logger');
const redisClient = require('./src/services/redis.service');

const PORT = process.env.PORT || 5000;

let server;

// Handle startup
const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
    });

  } catch (err) {
    logger.error({ err }, '❌ Failed to connect to database. Server not started.');
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`⚠️ Received ${signal}. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      try {
        logger.info('HTTP server closed.');

        if (prisma) {
          await prisma.$disconnect();
          logger.info('Prisma disconnected.');
        }

        if (redisClient) {
          await redisClient.quit();
          logger.info('Redis disconnected.');
        }

        process.exit(0);

      } catch (err) {
        logger.error({ err }, '❌ Error during shutdown');
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));