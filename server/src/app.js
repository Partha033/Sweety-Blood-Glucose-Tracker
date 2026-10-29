const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const readingRoutes = require("./routes/readingRoutes");
const reportRoutes = require("./routes/reportRoutes");
const errorHandler = require("./middleware/errorMiddleware");
const ApiError = require("./utils/ApiError");

const app = express();

// Security middleware
app.use(helmet());

// Cross-Origin Resource Sharing
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body and cookie parsing
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Sweety Blood Glucose Tracker API",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/readings", readingRoutes);
app.use("/api/reports", reportRoutes);

// 404 Handler for undefined API routes
app.use("*", (req, res, next) => {
  next(ApiError.notFound(`Endpoint ${req.originalUrl} not found.`));
});

// Global Centralized Error Handler
app.use(errorHandler);

module.exports = app;
