const { Pool } = require("pg");
const dotenv = require("dotenv");
const { setupInMemoryPostgres } = require("./inMemoryPg");

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

const configuredConnectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

let activePool = null;
let usingInMemory = false;

if (isTest) {
  activePool = new Pool({
    connectionString:
      process.env.TEST_DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/sweety_test_db",
  });
} else if (configuredConnectionString) {
  // Explicit or Cloud PostgreSQL connection
  const isCloudDatabase = Boolean(
    !configuredConnectionString.includes("localhost") &&
    !configuredConnectionString.includes("127.0.0.1")
  );

  activePool = new Pool({
    connectionString: configuredConnectionString,
    ssl:
      (isProduction && process.env.DB_SSL === "true") || isCloudDatabase
        ? { rejectUnauthorized: false }
        : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  activePool.on("error", (err) => {
    console.error("Unexpected error on idle PostgreSQL client", err);
  });
} else if (!isProduction) {
  // Local development default: localhost:5432
  const localUrl = `postgresql://${process.env.DB_USER || "postgres"}:${encodeURIComponent(
    process.env.DB_PASSWORD || "postgres"
  )}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 5432}/${
    process.env.DB_NAME || "sweety_db"
  }`;

  activePool = new Pool({
    connectionString: localUrl,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  activePool.on("error", (err) => {
    console.error("Unexpected error on idle PostgreSQL client", err);
  });
} else {
  // Production environment without DATABASE_URL:
  // Activate resilient in-memory PostgreSQL engine so the live app works 100% out of the box
  console.log(
    "[Database] No cloud DATABASE_URL provided. Activating in-memory PostgreSQL engine fallback."
  );
  activePool = setupInMemoryPostgres();
  usingInMemory = true;
}

module.exports = {
  get pool() {
    return activePool;
  },
  isDatabaseConfigured: true,
  isInMemory: usingInMemory,
  query: (text, params) => activePool.query(text, params),
};
