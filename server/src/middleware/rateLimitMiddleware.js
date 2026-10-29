const rateLimit = require("express-rate-limit");
const ApiError = require("../utils/ApiError");

const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10), // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(ApiError.tooManyRequests("Too many requests from this IP. Please try again after 15 minutes."));
  },
});

module.exports = {
  authLimiter,
};
