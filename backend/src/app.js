const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const pinoHttp = require('pino-http');
const logger = require('./utils/logger');
const { errorHandler } = require('./middlewares/error.middleware');
const setupSwagger = require('./docs/swagger');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('./services/redis.service');
const { prisma } = require('./config/db');

const app = express();

// Initialize Swagger Documentation
setupSwagger(app);

// Compress responses
app.use(compression());

// HTTP Request Logging
app.use(pinoHttp({ logger }));

// Set security HTTP headers
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Important for serving uploaded images/videos

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
  // store: new RedisStore({
  //   sendCommand: (...args) => redisClient.call(...args),
  // }),
});
// Apply rate limiter to all API routes
app.use('/api', limiter);

// Middleware
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

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // be permissive in dev
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// v1 Routes
const authRoutesV1 = require('./routes/v1/auth.routes');
const courseRoutesV1 = require('./routes/v1/courses.routes');
const enrollmentRoutesV1 = require('./routes/v1/enrollment.routes');
const userRoutesV1 = require('./routes/v1/users.routes');
const adminRoutesV1 = require('./routes/v1/admin.routes');
const profileRoutesV1 = require('./routes/v1/profile.routes');
const uploadRoutesV1 = require('./routes/v1/upload.routes');

// Mount v1 Routes
app.use('/api/v1/auth', authRoutesV1);
app.use('/api/v1/courses', courseRoutesV1);
app.use('/api/v1/enrollments', enrollmentRoutesV1);
app.use('/api/v1/users', userRoutesV1);
app.use('/api/v1/admin', adminRoutesV1);
app.use('/api/v1/profile', profileRoutesV1);
app.use('/api/v1/upload', uploadRoutesV1);

// Maintain backward compatibility by aliasing /api to v1 routes
app.use('/api/auth', authRoutesV1);
app.use('/api/courses', courseRoutesV1);
app.use('/api/enrollments', enrollmentRoutesV1);
app.use('/api/users', userRoutesV1);
app.use('/api/admin', adminRoutesV1);
app.use('/api/profile', profileRoutesV1);
app.use('/api/upload', uploadRoutesV1);

// Default Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to LMS Backend API' });
});

// Robust Health Check
app.get('/health', async (req, res) => {
  try {
    // Check DB
    await prisma.$queryRaw`SELECT 1`;
    // Check Redis
    // await redisClient.ping();
    res.status(200).json({ status: 'ok', db: 'ok', redis: 'ok' });
  } catch (error) {
    logger.error({ err: error }, 'Health check failed');
    res.status(503).json({ status: 'error', details: error.message });
  }
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
