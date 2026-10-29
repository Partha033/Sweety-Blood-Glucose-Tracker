const path = require("path");
const fs = require("fs");
const db = require("../config/database");

let initialized = false;
let initializing = null;

async function executeQuery(text, params) {
  if (typeof db.query === "function") {
    return db.query(text, params);
  }
  if (db.pool && typeof db.pool.query === "function") {
    return db.pool.query(text, params);
  }
  throw new Error("No database connection available");
}

async function autoInitDb() {
  // Never auto-init during automated test runs
  if (process.env.NODE_ENV === "test") return;
  if (initialized) return;
  if (initializing) return initializing;

  initializing = (async () => {
    try {
      // 1. Check if users table exists
      const checkTables = await executeQuery(`
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      `);

      if (checkTables.rows.length === 0) {
        console.log("[AutoInit] Database tables not found. Creating schema...");

        const migration1 = fs.readFileSync(
          path.join(__dirname, "../../migrations/001_create_users.sql"),
          "utf8"
        );
        const migration2 = fs.readFileSync(
          path.join(__dirname, "../../migrations/002_create_readings.sql"),
          "utf8"
        );

        await executeQuery(migration1);
        await executeQuery(migration2);
        console.log("[AutoInit] Schema (users, readings) created.");
      }

      // 2. Check if demo user exists
      const checkDemo = await executeQuery(`
        SELECT 1 FROM users WHERE LOWER(email) = 'demo@sweety.app'
      `);

      if (checkDemo.rows.length === 0) {
        console.log("[AutoInit] Demo user missing. Running initial seed...");
        const seed = require("../../seeds/seed");
        await seed();
        console.log("[AutoInit] Demo data seeded successfully.");
      }

      initialized = true;
    } catch (err) {
      console.warn("[AutoInit] Database check notice:", err.message);
    } finally {
      initializing = null;
    }
  })();

  return initializing;
}

module.exports = { autoInitDb };
