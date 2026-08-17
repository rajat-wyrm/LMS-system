```js
require('dotenv').config();
const app = require('./src/app');
// Initialize workers
// require('./src/workers/email.worker');
const { connectDB, prisma } = require('./src/config/db');

const logger = require('./src/utils/logger');
const redisClient = require('./src/services/redis.service');

const PORT = process.env.PORT || 5000;
let server;

connectDB().then(() => {
  server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}).catch((err) => {
  logger.error({ err }, 'Failed to connect to database. Server not started.');
});
```

// Graceful Shutdown Handler
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        await prisma.$disconnect();
        logger.info('Prisma disconnected.');
        await redisClient.quit();
        logger.info('Redis disconnected.');
        process.exit(0);
      } catch (err) {
        logger.error({ err }, 'Error during disconnect');
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};
Socket.IO needs to attach to the raw `http.Server`, not to the Express `app`
directly, so `app.listen(...)` becomes `http.createServer(app).listen(...)`.
```js
require('dotenv').config();
const http = require('http');
const app = require('./src/app');
// Initialize workers
// require('./src/workers/email.worker');
const { connectDB, prisma } = require('./src/config/db');
const { initSocket } = require('./src/services/socket.service');

const logger = require('./src/utils/logger');
const redisClient = require('./src/services/redis.service');

const PORT = process.env.PORT || 5000;
let server;

connectDB().then(() => {
  const httpServer = http.createServer(app);
  initSocket(httpServer);

  server = httpServer.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    logger.info('Socket.IO real-time notifications enabled');
  });
}).catch((err) => {
  logger.error({ err }, 'Failed to connect to database. Server not started.');
});
```

The rest of the file (graceful shutdown handlers) is unchanged — `server.close()`
still works the same way on the wrapped `http.Server`.
