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
      const check = await executeQuery(`
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      `);

      if (check.rows.length === 0) {
        console.log("[AutoInit] Database tables not found. Running automatic setup...");

        // 2. Apply migrations
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
        console.log("[AutoInit] Tables (users, readings) created successfully.");

        // 3. Run seed
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
