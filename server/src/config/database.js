const { Pool } = require("pg");
const dotenv = require("dotenv");

// Load appropriate .env file
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";
const configuredConnectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

const connectionString = isTest
  ? process.env.TEST_DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/sweety_test_db"
  : configuredConnectionString ||
    (isProduction
      ? undefined
      : `postgresql://${process.env.DB_USER || "postgres"}:${encodeURIComponent(process.env.DB_PASSWORD || "postgres")}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || "sweety_db"}`);

const isCloudDatabase = Boolean(
  connectionString &&
  !connectionString.includes("localhost") &&
  !connectionString.includes("127.0.0.1")
);

const pool = new Pool({
  connectionString,
  ssl:
    (isProduction && process.env.DB_SSL === "true") || isCloudDatabase
      ? { rejectUnauthorized: false }
      : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
});

module.exports = {
  pool,
  isDatabaseConfigured: isTest || Boolean(configuredConnectionString) || !isProduction,
  query: (text, params) => {
    if (isProduction && !configuredConnectionString) {
      return Promise.reject(new Error("DATABASE_URL or POSTGRES_URL must be configured in production."));
    }
    return pool.query(text, params);
  },
};
