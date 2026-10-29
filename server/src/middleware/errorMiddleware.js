const ApiError = require("../utils/ApiError");

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "An unexpected error occurred.";
  let errors = err.errors || [];

  // Handle PostgreSQL specific error codes
  if (err.code === "23505") {
    // Unique violation
    statusCode = 409;
    if (err.constraint && err.constraint.includes("email")) {
      message = "An account with this email already exists.";
    } else if (err.constraint && err.constraint.includes("unique_user_date_slot")) {
      message = "You already have a reading for this slot on this date.";
    } else {
      message = "A record with this information already exists.";
    }
  } else if (err.code === "23514") {
    // Check constraint violation
    statusCode = 400;
    if (err.constraint && err.constraint.includes("glucose")) {
      message = "Value must be between 40 and 600 mg/dl.";
    } else if (err.constraint && err.constraint.includes("slot")) {
      message = "Please select a valid time slot.";
    } else {
      message = "Invalid input values violate database constraints.";
    }
  } else if (err.code === "22P02") {
    // Invalid UUID format
    statusCode = 400;
    message = "Invalid resource identifier.";
  }

  // Handle JSON parse errors from body-parser
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    message = "Malformed JSON payload.";
  }

  // Hide internal server error details in production
  const isProduction = process.env.NODE_ENV === "production";
  if (statusCode >= 500) {
    console.error(`[API] ${req.method} ${req.originalUrl} failed`, {
      code: err.code || "UNKNOWN",
      message: err.message,
    });
  }
  if (statusCode === 500 && isProduction) {
    message = "Internal server error. Please try again later.";
  }

  const response = {
    success: false,
    message,
    errors,
  };

  if (!isProduction && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
