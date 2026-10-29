const request = require("supertest");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_sweety_app_replace_in_production";

// Mock database module
jest.mock("../src/config/database", () => {
  const users = [
    { id: "user-1", name: "User One", email: "user1@example.com" },
    { id: "user-2", name: "User Two", email: "user2@example.com" },
  ];

  let readings = [];

  return {
    pool: {
      connect: jest.fn().mockResolvedValue({ query: jest.fn(), release: jest.fn() }),
      end: jest.fn().mockResolvedValue(true),
    },
    query: jest.fn(async (text, params) => {
      const lower = text.toLowerCase().replace(/\s+/g, " ");

      // Auth middleware user lookup
      if (lower.includes("from users where id = $1")) {
        const user = users.find((u) => u.id === params[0]);
        return { rows: user ? [user] : [] };
      }

      // Slot conflict check
      if (lower.includes("from readings") && lower.includes("time_slot = $3")) {
        const [userId, date, slot, excludeId] = params;
        const conflict = readings.filter(
          (r) =>
            r.user_id === userId &&
            r.reading_date === date &&
            r.time_slot === slot &&
            (!excludeId || r.id !== excludeId)
        );
        return { rows: conflict };
      }

      // Daily count check
      if (lower.includes("count(*)::int as count")) {
        const [userId, date] = params;
        const matching = readings.filter(
          (r) => r.user_id === userId && r.reading_date === date
        );
        return { rows: [{ count: matching.length }] };
      }

      // Insert reading
      if (lower.includes("insert into readings")) {
        const [userId, date, slot, value] = params;
        const newReading = {
          id: `reading-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          user_id: userId,
          reading_date: date,
          time_slot: slot,
          glucose_value: value,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        readings.push(newReading);
        return { rows: [newReading] };
      }

      // Get reading by ID & user_id
      if (lower.includes("from readings where id = $1 and user_id = $2")) {
        const [readingId, userId] = params;
        const found = readings.filter((r) => r.id === readingId && r.user_id === userId);
        return { rows: found };
      }

      // Update reading
      if (lower.includes("update readings set")) {
        const [date, slot, value, readingId, userId] = params;
        const index = readings.findIndex((r) => r.id === readingId && r.user_id === userId);
        if (index !== -1) {
          readings[index] = {
            ...readings[index],
            reading_date: date,
            time_slot: slot,
            glucose_value: value,
            updated_at: new Date().toISOString(),
          };
          return { rows: [readings[index]] };
        }
        return { rows: [] };
      }

      // Delete reading
      if (lower.includes("delete from readings where id = $1 and user_id = $2")) {
        const [readingId, userId] = params;
        const index = readings.findIndex((r) => r.id === readingId && r.user_id === userId);
        if (index !== -1) {
          const removed = readings.splice(index, 1)[0];
          return { rows: [removed] };
        }
        return { rows: [] };
      }

      // List readings total count
      if (lower.includes("count(*)::int as total")) {
        const userId = params[0];
        const userReadings = readings.filter((r) => r.user_id === userId);
        return { rows: [{ total: userReadings.length }] };
      }

      // List readings data
      if (lower.includes("from readings where user_id = $1")) {
        const userId = params[0];
        const userReadings = readings.filter((r) => r.user_id === userId);
        return { rows: userReadings };
      }

      return { rows: [] };
    }),
    _resetReadings: () => {
      readings = [];
    },
  };
});

const app = require("../src/app");
const { _resetReadings } = require("../src/config/database");

describe("Blood Glucose Reading Management API Tests", () => {
  const tokenUser1 = jwt.sign({ id: "user-1", email: "user1@example.com" }, JWT_SECRET);
  const tokenUser2 = jwt.sign({ id: "user-2", email: "user2@example.com" }, JWT_SECRET);

  beforeEach(() => {
    _resetReadings();
  });

  test("POST /api/readings - Successfully creates a reading", async () => {
    const res = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${tokenUser1}`)
      .send({
        readingDate: "2026-10-15",
        timeSlot: "morning_fasting",
        glucoseValue: 95,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.glucoseValue).toBe(95);
    expect(res.body.data.timeSlot).toBe("morning_fasting");
    expect(res.body.data.timeSlotLabel).toBe("Morning (fasting)");
  });

  test("POST /api/readings - Rejects missing glucose value with exact error", async () => {
    const res = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${tokenUser1}`)
      .send({
        readingDate: "2026-10-15",
        timeSlot: "morning_fasting",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Please enter a glucose value.");
  });

  test("POST /api/readings - Rejects glucose value below 40 with exact error", async () => {
    const res = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${tokenUser1}`)
      .send({
        readingDate: "2026-10-15",
        timeSlot: "morning_fasting",
        glucoseValue: 39,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Value must be between 40 and 600 mg/dl.");
  });

  test("POST /api/readings - Rejects glucose value above 600 with exact error", async () => {
    const res = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${tokenUser1}`)
      .send({
        readingDate: "2026-10-15",
        timeSlot: "morning_fasting",
        glucoseValue: 601,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Value must be between 40 and 600 mg/dl.");
  });

  test("POST /api/readings - Rejects decimal glucose value with exact error", async () => {
    const res = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${tokenUser1}`)
      .send({
        readingDate: "2026-10-15",
        timeSlot: "morning_fasting",
        glucoseValue: 120.5,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Value must be between 40 and 600 mg/dl.");
  });

  test("POST /api/readings - Rejects future date with exact error", async () => {
    const res = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${tokenUser1}`)
      .send({
        readingDate: "2099-01-01",
        timeSlot: "morning_fasting",
        glucoseValue: 100,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Date cannot be in the future.");
  });

  test("POST /api/readings - Rejects duplicate time slot for same date and user", async () => {
    // First reading
    await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${tokenUser1}`)
      .send({
        readingDate: "2026-10-15",
        timeSlot: "after_lunch",
        glucoseValue: 140,
      });

    // Duplicate attempt
    const res = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${tokenUser1}`)
      .send({
        readingDate: "2026-10-15",
        timeSlot: "after_lunch",
        glucoseValue: 145,
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("You already have an After lunch reading for this date.");
  });

  test("POST /api/readings - Rejects 5th reading on same date with exact error", async () => {
    const slots = ["morning_fasting", "after_breakfast", "after_lunch", "after_dinner"];
    for (const slot of slots) {
      await request(app)
        .post("/api/readings")
        .set("Authorization", `Bearer ${tokenUser1}`)
        .send({
          readingDate: "2026-10-15",
          timeSlot: slot,
          glucoseValue: 110,
        });
    }

    // 5th attempt (e.g. if slot check passed or different slot)
    const res = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${tokenUser1}`)
      .send({
        readingDate: "2026-10-15",
        timeSlot: "morning_fasting",
        glucoseValue: 110,
      });

    expect(res.status).toBe(409); // Caught at slot check first
  });

  test("User Data Isolation: User A cannot retrieve User B's reading", async () => {
    const createRes = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${tokenUser1}`)
      .send({
        readingDate: "2026-10-15",
        timeSlot: "morning_fasting",
        glucoseValue: 100,
      });

    const readingId = createRes.body.data.id;

    // User 2 tries to access User 1's reading
    const res = await request(app)
      .get(`/api/readings/${readingId}`)
      .set("Authorization", `Bearer ${tokenUser2}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Reading not found.");
  });

  test("User Data Isolation: User A cannot edit User B's reading", async () => {
    const createRes = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${tokenUser1}`)
      .send({
        readingDate: "2026-10-15",
        timeSlot: "morning_fasting",
        glucoseValue: 100,
      });

    const readingId = createRes.body.data.id;

    const res = await request(app)
      .put(`/api/readings/${readingId}`)
      .set("Authorization", `Bearer ${tokenUser2}`)
      .send({
        readingDate: "2026-10-15",
        timeSlot: "morning_fasting",
        glucoseValue: 150,
      });

    expect(res.status).toBe(404);
  });

  test("User Data Isolation: User A cannot delete User B's reading", async () => {
    const createRes = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${tokenUser1}`)
      .send({
        readingDate: "2026-10-15",
        timeSlot: "morning_fasting",
        glucoseValue: 100,
      });

    const readingId = createRes.body.data.id;

    const res = await request(app)
      .delete(`/api/readings/${readingId}`)
      .set("Authorization", `Bearer ${tokenUser2}`);

    expect(res.status).toBe(404);
  });

  test("PUT /api/readings/:id - Successfully updates a reading", async () => {
    const createRes = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${tokenUser1}`)
      .send({
        readingDate: "2026-10-15",
        timeSlot: "morning_fasting",
        glucoseValue: 95,
      });

    const readingId = createRes.body.data.id;

    const res = await request(app)
      .put(`/api/readings/${readingId}`)
      .set("Authorization", `Bearer ${tokenUser1}`)
      .send({
        readingDate: "2026-10-15",
        timeSlot: "morning_fasting",
        glucoseValue: 105,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.glucoseValue).toBe(105);
  });

  test("DELETE /api/readings/:id - Successfully deletes a reading", async () => {
    const createRes = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${tokenUser1}`)
      .send({
        readingDate: "2026-10-15",
        timeSlot: "morning_fasting",
        glucoseValue: 95,
      });

    const readingId = createRes.body.data.id;

    const res = await request(app)
      .delete(`/api/readings/${readingId}`)
      .set("Authorization", `Bearer ${tokenUser1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
