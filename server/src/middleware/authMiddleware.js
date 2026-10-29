const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const { query } = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_sweety_app_replace_in_production";

async function authenticate(req, res, next) {
  try {
    let token = null;

    // 1. Check HttpOnly cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Check Bearer Authorization header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(ApiError.unauthorized("Authentication required. Please log in."));
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(ApiError.unauthorized("Session expired. Please log in again."));
      }
      return next(ApiError.unauthorized("Invalid token. Please log in again."));
    }

    if (!decoded || !decoded.id) {
      return next(ApiError.unauthorized("Invalid token payload."));
    }

    // Verify user exists in database
    const userResult = await query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return next(ApiError.unauthorized("User account no longer exists."));
    }

    req.user = userResult.rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authenticate;
