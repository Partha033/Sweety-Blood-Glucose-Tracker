const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const { pool } = require("./config/database");

// Validate essential environment variables
function validateEnv() {
  const required = ["JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(
      `[Warning] Missing recommended environment variables: ${missing.join(", ")}. Using default development values.`
    );
  }
}

validateEnv();

const PORT = parseInt(process.env.PORT || "5000", 10);

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` Sweety – Blood Glucose Tracker Server Running`);
  console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(` Listening on port: ${PORT}`);
  console.log(` API Endpoint: http://localhost:${PORT}/api`);
  console.log(`===============================================`);
});

// Graceful shutdown
async function gracefulShutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log("HTTP server closed.");
    try {
      await pool.end();
      console.log("PostgreSQL connection pool closed.");
      process.exit(0);
    } catch (err) {
      console.error("Error closing PostgreSQL pool:", err);
      process.exit(1);
    }
  });

  // Force close if graceful shutdown takes too long
  setTimeout(() => {
    console.error("Shutdown timed out. Forcing process exit.");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
