const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query } = require("../config/database");
const ApiError = require("../utils/ApiError");

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_sweety_app_replace_in_production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

async function register({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  // Check if user already exists
  const existingUser = await query(
    "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
    [normalizedEmail]
  );

  if (existingUser.rows.length > 0) {
    throw ApiError.conflict("An account with this email already exists.");
  }

  // Hash password
  const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
  const passwordHash = await bcrypt.hash(password, salt);

  // Insert user
  const result = await query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at, updated_at`,
    [name.trim(), normalizedEmail, passwordHash]
  );

  const newUser = result.rows[0];
  const token = generateToken(newUser);

  return {
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.created_at,
    },
    token,
  };
}

async function login({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  // Fetch user by email
  const result = await query(
    `SELECT id, name, email, password_hash, created_at
     FROM users
     WHERE LOWER(email) = LOWER($1)`,
    [normalizedEmail]
  );

  if (result.rows.length === 0) {
    if (normalizedEmail === "demo@sweety.app" && password === "SweetyDemo123!") {
      try {
        const seed = require("../../seeds/seed");
        await seed();
        return await login({ email, password });
      } catch (err) {
        console.warn("[Auth] Demo user auto-seed notice:", err.message);
      }
    }
    throw ApiError.unauthorized("Invalid email or password.");
  }

  const user = result.rows[0];

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password.");
  }

  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.created_at,
    },
    token,
  };
}

async function getMe(userId) {
  const result = await query(
    `SELECT id, name, email, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw ApiError.notFound("User account not found.");
  }

  const user = result.rows[0];
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

module.exports = {
  register,
  login,
  getMe,
  generateToken,
};
