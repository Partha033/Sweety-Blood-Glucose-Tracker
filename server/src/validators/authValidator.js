const ApiError = require("../utils/ApiError");

function validateRegistration(req, res, next) {
  let { name, email, password } = req.body;

  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    errors.push({ field: "name", message: "Full name is required." });
  }

  if (!email || typeof email !== "string" || email.trim().length === 0) {
    errors.push({ field: "email", message: "Email is required." });
  } else {
    email = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push({ field: "email", message: "Please provide a valid email address." });
    }
  }

  if (!password || typeof password !== "string") {
    errors.push({ field: "password", message: "Password is required." });
  } else if (password.length < 8) {
    errors.push({
      field: "password",
      message: "Password must be at least 8 characters long.",
    });
  }

  if (errors.length > 0) {
    return next(new ApiError(400, errors[0].message, errors));
  }

  // Normalize email and trimmed name
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  next();
}

function validateLogin(req, res, next) {
  let { email, password } = req.body;

  const errors = [];

  if (!email || typeof email !== "string" || email.trim().length === 0) {
    errors.push({ field: "email", message: "Email is required." });
  }

  if (!password || typeof password !== "string" || password.length === 0) {
    errors.push({ field: "password", message: "Password is required." });
  }

  if (errors.length > 0) {
    return next(new ApiError(400, errors[0].message, errors));
  }

  req.body.email = email.trim().toLowerCase();
  next();
}

module.exports = {
  validateRegistration,
  validateLogin,
};
