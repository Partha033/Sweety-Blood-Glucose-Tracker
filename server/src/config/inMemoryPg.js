const { newDb } = require("pg-mem");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { getTodayDateString, getPreviousMonthRange } = require("../utils/dateUtils");

let inMemoryDb = null;
let inMemoryPool = null;

function setupInMemoryPostgres() {
  if (inMemoryPool) return inMemoryPool;

  const db = newDb();

  // Register required PostgreSQL extensions & functions with impure: true so it generates a fresh UUID every call
  db.public.registerFunction({
    name: "gen_random_uuid",
    returns: db.public.getType("uuid"),
    impure: true,
    implementation: () => crypto.randomUUID(),
  });

  // Create Schema
  db.public.none(`
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE readings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reading_date DATE NOT NULL,
      time_slot VARCHAR(30) NOT NULL,
      glucose_value INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_user_date_slot UNIQUE (user_id, reading_date, time_slot)
    );
  `);

  const pg = db.adapters.createPg();
  const pool = new pg.Pool();

  // Seed demo patient and clinical readings synchronously/asynchronously
  (async () => {
    try {
      const demoEmail = "demo@sweety.app";
      const demoPassword = "SweetyDemo123!";
      const demoName = "Demo Patient";
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(demoPassword, salt);

      const userRes = await pool.query(
        "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
        [demoName, demoEmail, passwordHash]
      );
      const userId = userRes.rows[0].id;

      // Seed 25 clinical readings across today, this month, and previous month
      const todayStr = getTodayDateString();
      const todayDate = new Date();
      function getRelDate(daysAgo) {
        const d = new Date(todayDate);
        d.setDate(d.getDate() - daysAgo);
        return d.toISOString().split("T")[0];
      }

      const prevMonth = getPreviousMonthRange(todayStr);
      const prevMid = `${prevMonth.year}-${String(prevMonth.month).padStart(2, "0")}-15`;
      const prevLate = `${prevMonth.year}-${String(prevMonth.month).padStart(2, "0")}-20`;

      const seedRows = [
        // Today (3 readings)
        { date: todayStr, slot: "morning_fasting", val: 95 },
        { date: todayStr, slot: "after_breakfast", val: 135 },
        { date: todayStr, slot: "after_lunch", val: 120 },

        // Yesterday (4 readings - full day)
        { date: getRelDate(1), slot: "morning_fasting", val: 92 },
        { date: getRelDate(1), slot: "after_breakfast", val: 142 },
        { date: getRelDate(1), slot: "after_lunch", val: 118 },
        { date: getRelDate(1), slot: "after_dinner", val: 130 },

        // 2 days ago (3 readings)
        { date: getRelDate(2), slot: "morning_fasting", val: 104 },
        { date: getRelDate(2), slot: "after_breakfast", val: 155 },
        { date: getRelDate(2), slot: "after_dinner", val: 128 },

        // 3 days ago (2 readings)
        { date: getRelDate(3), slot: "morning_fasting", val: 88 },
        { date: getRelDate(3), slot: "after_lunch", val: 110 },

        // 4 days ago (1 low reading)
        { date: getRelDate(4), slot: "morning_fasting", val: 65 },

        // 5 days ago (1 high reading)
        { date: getRelDate(5), slot: "after_dinner", val: 215 },

        // 6 days ago (2 readings)
        { date: getRelDate(6), slot: "morning_fasting", val: 98 },
        { date: getRelDate(6), slot: "after_lunch", val: 124 },

        // 7 days ago (1 reading)
        { date: getRelDate(7), slot: "after_breakfast", val: 140 },

        // Previous month mid (4 readings)
        { date: prevMid, slot: "morning_fasting", val: 94 },
        { date: prevMid, slot: "after_breakfast", val: 138 },
        { date: prevMid, slot: "after_lunch", val: 115 },
        { date: prevMid, slot: "after_dinner", val: 125 },

        // Previous month late (4 readings)
        { date: prevLate, slot: "morning_fasting", val: 100 },
        { date: prevLate, slot: "after_breakfast", val: 145 },
        { date: prevLate, slot: "after_lunch", val: 122 },
        { date: prevLate, slot: "after_dinner", val: 132 },
      ];

      for (const r of seedRows) {
        await pool.query(
          "INSERT INTO readings (user_id, reading_date, time_slot, glucose_value) VALUES ($1, $2, $3, $4)",
          [userId, r.date, r.slot, r.val]
        );
      }
      console.log("[InMemoryPostgreSQL] Seeded 25 records for demo@sweety.app");
    } catch (err) {
      console.error("[InMemoryPostgreSQL] Seed error:", err);
    }
  })();

  inMemoryDb = db;
  inMemoryPool = pool;
  return pool;
}

module.exports = { setupInMemoryPostgres };
