const bcrypt = require("bcryptjs");
const { pool, query } = require("../src/config/database");
const { getTodayDateString, getPreviousMonthRange } = require("../src/utils/dateUtils");

async function seed() {
  const client = await pool.connect();

  try {
    console.log("=========================================");
    console.log(" Starting Sweety Demo Data Seeding");
    console.log("=========================================");

    const demoEmail = "demo@sweety.app";
    const demoPassword = "SweetyDemo123!";
    const demoName = "Demo Patient";

    // 1. Create or retrieve demo user
    let userResult = await client.query(
      "SELECT id, name, email FROM users WHERE LOWER(email) = LOWER($1)",
      [demoEmail]
    );

    let userId;

    if (userResult.rows.length === 0) {
      console.log(`Creating demo user: ${demoEmail}...`);
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(demoPassword, salt);

      const insertUserResult = await client.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, name, email`,
        [demoName, demoEmail, passwordHash]
      );
      userId = insertUserResult.rows[0].id;
      console.log(`Demo user created with ID: ${userId}`);
    } else {
      userId = userResult.rows[0].id;
      console.log(`Demo user already exists with ID: ${userId}`);
    }

    // 2. Prepare sample readings
    // Calculate dates relative to today
    const todayStr = getTodayDateString();
    const todayDate = new Date();

    function getRelativeDateStr(daysAgo) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - daysAgo);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }

    // Previous month range
    const prevMonthInfo = getPreviousMonthRange(todayStr);
    const prevMonthYear = prevMonthInfo.year;
    const prevMonthStr = prevMonthInfo.month;

    const sampleReadings = [
      // Today (2 readings: demonstrates today's count 2/4 and active dashboard)
      { date: todayStr, slot: "morning_fasting", value: 92 },
      { date: todayStr, slot: "after_breakfast", value: 135 },

      // Yesterday (3 readings)
      { date: getRelativeDateStr(1), slot: "morning_fasting", value: 104 },
      { date: getRelativeDateStr(1), slot: "after_lunch", value: 142 },
      { date: getRelativeDateStr(1), slot: "after_dinner", value: 128 },

      // 3 days ago (4 readings: full day)
      { date: getRelativeDateStr(3), slot: "morning_fasting", value: 88 },
      { date: getRelativeDateStr(3), slot: "after_breakfast", value: 122 },
      { date: getRelativeDateStr(3), slot: "after_lunch", value: 138 },
      { date: getRelativeDateStr(3), slot: "after_dinner", value: 115 },

      // 7 days ago
      { date: getRelativeDateStr(7), slot: "morning_fasting", value: 96 },
      { date: getRelativeDateStr(7), slot: "after_lunch", value: 148 },

      // 12 days ago
      { date: getRelativeDateStr(12), slot: "morning_fasting", value: 101 },
      { date: getRelativeDateStr(12), slot: "after_dinner", value: 134 },

      // Readings across previous calendar month for monthly report & Recharts line chart
      { date: `${prevMonthYear}-${prevMonthStr}-02`, slot: "morning_fasting", value: 94 },
      { date: `${prevMonthYear}-${prevMonthStr}-02`, slot: "after_lunch", value: 136 },
      { date: `${prevMonthYear}-${prevMonthStr}-06`, slot: "morning_fasting", value: 98 },
      { date: `${prevMonthYear}-${prevMonthStr}-06`, slot: "after_dinner", value: 145 },
      { date: `${prevMonthYear}-${prevMonthStr}-11`, slot: "morning_fasting", value: 105 },
      { date: `${prevMonthYear}-${prevMonthStr}-11`, slot: "after_breakfast", value: 140 },
      { date: `${prevMonthYear}-${prevMonthStr}-16`, slot: "morning_fasting", value: 91 },
      { date: `${prevMonthYear}-${prevMonthStr}-16`, slot: "after_lunch", value: 132 },
      { date: `${prevMonthYear}-${prevMonthStr}-21`, slot: "morning_fasting", value: 89 },
      { date: `${prevMonthYear}-${prevMonthStr}-21`, slot: "after_dinner", value: 126 },
      { date: `${prevMonthYear}-${prevMonthStr}-25`, slot: "morning_fasting", value: 102 },
      { date: `${prevMonthYear}-${prevMonthStr}-25`, slot: "after_lunch", value: 155 },
    ];

    let insertedCount = 0;

    for (const reading of sampleReadings) {
      // Use ON CONFLICT DO NOTHING to ensure idempotence
      const insertResult = await client.query(
        `INSERT INTO readings (user_id, reading_date, time_slot, glucose_value)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, reading_date, time_slot) DO NOTHING
         RETURNING id`,
        [userId, reading.date, reading.slot, reading.value]
      );

      if (insertResult.rows.length > 0) {
        insertedCount++;
      }
    }

    console.log(`Seeding complete. Inserted ${insertedCount} new sample readings.`);
    console.log("-----------------------------------------");
    console.log(" Demo Credentials:");
    console.log(` Email:    ${demoEmail}`);
    console.log(` Password: ${demoPassword}`);
    console.log("-----------------------------------------");
  } catch (err) {
    console.error("Seeding failed with error:", err);
    process.exitCode = 1;
    throw err;
  } finally {
    client.release();
    if (require.main === module) {
      await pool.end();
    }
  }
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seed;
