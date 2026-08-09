
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const pinoHttp = require("pino-http");
const path = require("path");

const logger = require("./utils/logger");
const { errorHandler } = require("./middlewares/error.middleware");
const setupSwagger = require("./docs/swagger");
const redisClient = require("./services/redis.service");
const { prisma } = require("./config/db");
const requestLogger = require("./middlewares/requestLogger");

const app = express();

// ============================================================
// Swagger Documentation
// ============================================================

setupSwagger(app);

// ============================================================
// Compression
// ============================================================

app.use(compression());

// ============================================================
// HTTP Request Logging
// ============================================================

app.use(pinoHttp({ logger }));

// ============================================================
// Security
// ============================================================

app.use(helmet());

app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin",
  })
);

// ============================================================
// Rate Limiting
// ============================================================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
});

app.use("/api", limiter);

// ============================================================
// CORS
// ============================================================

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:8080",
  "http://localhost:8081",
  "http://localhost:8082",
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header
      // and configured development origins.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Preserve existing development behavior.
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// ============================================================
// Body Parsers
// ============================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// Request Logger
// ============================================================

app.use(requestLogger);

// ============================================================
// Static Uploads
// ============================================================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

// ============================================================
// API V1 ROUTES
// ============================================================

const authRoutesV1 = require("./routes/v1/auth.routes");
const courseRoutesV1 = require("./routes/v1/courses.routes");
const enrollmentRoutesV1 = require("./routes/v1/enrollment.routes");
const userRoutesV1 = require("./routes/v1/users.routes");
const adminRoutesV1 = require("./routes/v1/admin.routes");
const profileRoutesV1 = require("./routes/v1/profile.routes");
const uploadRoutesV1 = require("./routes/v1/upload.routes");
const wishlistRoutesV1 = require("./routes/v1/wishlist.routes");
const categoryRoutesV1 = require("./routes/v1/categories.routes");

// IMPORTANT:
// The filename is review.routes.js.
// Do NOT use review\.routes.js.
const reviewRoutesV1 = require("./routes/v1/review.routes");

const analyticsRoutes = require("./analytics/analytics.routes");
const auditRoutes = require("./routes/v1/audit.routes");

// ============================================================
// V1 API Routes
// ============================================================

app.use("/api/v1/auth", authRoutesV1);
app.use("/api/v1/courses", courseRoutesV1);
app.use("/api/v1/enrollments", enrollmentRoutesV1);
app.use("/api/v1/users", userRoutesV1);
app.use("/api/v1/admin", adminRoutesV1);
app.use("/api/v1/profile", profileRoutesV1);
app.use("/api/v1/upload", uploadRoutesV1);
app.use("/api/v1/wishlist", wishlistRoutesV1);
app.use("/api/v1/categories", categoryRoutesV1);

// ============================================================
// REVIEW ROUTES
// ============================================================

app.use("/api/v1/reviews", reviewRoutesV1);

app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/audit-logs", auditRoutes);

// ============================================================
// BACKWARD COMPATIBILITY ROUTES
// ============================================================

app.use("/api/auth", authRoutesV1);
app.use("/api/courses", courseRoutesV1);
app.use("/api/enrollments", enrollmentRoutesV1);
app.use("/api/users", userRoutesV1);
app.use("/api/admin", adminRoutesV1);
app.use("/api/profile", profileRoutesV1);
app.use("/api/upload", uploadRoutesV1);
app.use("/api/wishlist", wishlistRoutesV1);
app.use("/api/categories", categoryRoutesV1);
app.use("/api/reviews", reviewRoutesV1);
app.use("/api/analytics", analyticsRoutes);

// ============================================================
// Default Route
// ============================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to LMS Backend API",
  });
});

// ============================================================
// Health Check
// ============================================================

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    const redisStatus = await redisClient.ping();

    res.status(200).json({
      status: "ok",
      db: "ok",
      redis: redisStatus === "PONG" ? "ok" : redisStatus,
    });
  } catch (error) {
    logger.error({ err: error }, "Health check failed");

    res.status(503).json({
      status: "error",
      details: error.message,
    });
  }
});

// ============================================================
// 404 HANDLER
// ============================================================

app.use((req, res, next) => {
  const AppError = require("./utils/AppError");

  next(
    new AppError(
      `Not Found - ${req.originalUrl}`,
      404,
      "RESOURCE_NOT_FOUND"
    )
  );
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(errorHandler);

module.exports = app;

