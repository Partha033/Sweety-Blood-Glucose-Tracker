const request = require("supertest");
const jwt = require("jsonwebtoken");
const { getPreviousMonthRange, getDaysInMonth, isLeapYear } = require("../src/utils/dateUtils");
const { computeStats } = require("../src/services/reportService");

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_sweety_app_replace_in_production";

// Mock database module for reports
jest.mock("../src/config/database", () => {
  const users = [
    { id: "user-1", name: "User One", email: "user1@example.com" },
    { id: "user-2", name: "User Two", email: "user2@example.com" },
  ];

  const readings = [
    // User 1 readings on 2026-10-15 (Daily report dataset: 90, 120, 150)
    {
      id: "r1",
      user_id: "user-1",
      reading_date: "2026-10-15",
      time_slot: "morning_fasting",
      glucose_value: 90,
      created_at: new Date().toISOString(),
    },
    {
      id: "r2",
      user_id: "user-1",
      reading_date: "2026-10-15",
      time_slot: "after_breakfast",
      glucose_value: 120,
      created_at: new Date().toISOString(),
    },
    {
      id: "r3",
      user_id: "user-1",
      reading_date: "2026-10-15",
      time_slot: "after_lunch",
      glucose_value: 150,
      created_at: new Date().toISOString(),
    },

    // User 1 earlier in October (Month-to-Date)
    {
      id: "r4",
      user_id: "user-1",
      reading_date: "2026-10-02",
      time_slot: "morning_fasting",
      glucose_value: 100,
      created_at: new Date().toISOString(),
    },

    // User 1 in September (Previous month)
    {
      id: "r5",
      user_id: "user-1",
      reading_date: "2026-09-10",
      time_slot: "morning_fasting",
      glucose_value: 110,
      created_at: new Date().toISOString(),
    },
    {
      id: "r6",
      user_id: "user-1",
      reading_date: "2026-09-20",
      time_slot: "after_lunch",
      glucose_value: 130,
      created_at: new Date().toISOString(),
    },

    // User 2 reading (for isolation test)
    {
      id: "r7",
      user_id: "user-2",
      reading_date: "2026-10-15",
      time_slot: "morning_fasting",
      glucose_value: 200,
      created_at: new Date().toISOString(),
    },
  ];

  return {
    pool: {
      connect: jest.fn().mockResolvedValue({ query: jest.fn(), release: jest.fn() }),
      end: jest.fn().mockResolvedValue(true),
    },
    query: jest.fn(async (text, params) => {
      const lower = text.toLowerCase();

      // Auth middleware lookup
      if (lower.includes("from users where id = $1")) {
        const user = users.find((u) => u.id === params[0]);
        return { rows: user ? [user] : [] };
      }

      // Aggregate query for Daily (user_id = $1 and reading_date = $2)
      if (lower.includes("select \n      count(*)::int as count") || lower.includes("max(glucose_value)")) {
        const userId = params[0];
        let filtered;

        if (params.length === 2) {
          // Daily
          const date = params[1];
          filtered = readings.filter((r) => r.user_id === userId && r.reading_date === date);
        } else if (params.length === 3) {
          // Range (MTD or Monthly)
          const start = params[1];
          const end = params[2];
          filtered = readings.filter(
            (r) => r.user_id === userId && r.reading_date >= start && r.reading_date <= end
          );
        } else {
          filtered = [];
        }

        if (filtered.length === 0) {
          return {
            rows: [
              {
                count: 0,
                max_glucose: null,
                min_glucose: null,
                avg_glucose: null,
              },
            ],
          };
        }

        const values = filtered.map((r) => r.glucose_value);
        const max = Math.max(...values);
        const min = Math.min(...values);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;

        return {
          rows: [
            {
              count: filtered.length,
              max_glucose: max,
              min_glucose: min,
              avg_glucose: avg,
            },
          ],
        };
      }

      // Readings list query for Daily / MTD / Monthly
      if (lower.includes("from readings")) {
        const userId = params[0];
        let filtered;

        if (params.length === 2) {
          // Daily
          const date = params[1];
          filtered = readings.filter((r) => r.user_id === userId && r.reading_date === date);
        } else if (params.length === 3) {
          // Range
          const start = params[1];
          const end = params[2];
          filtered = readings.filter(
            (r) => r.user_id === userId && r.reading_date >= start && r.reading_date <= end
          );
        } else {
          filtered = [];
        }

        return { rows: filtered };
      }

      return { rows: [] };
    }),
  };
});

const app = require("../src/app");

describe("Reporting Calculation and API Tests", () => {
  const tokenUser1 = jwt.sign({ id: "user-1", email: "user1@example.com" }, JWT_SECRET);
  const tokenUser2 = jwt.sign({ id: "user-2", email: "user2@example.com" }, JWT_SECRET);

  test("GET /api/reports/daily - Accurately calculates statistics (90, 120, 150)", async () => {
    const res = await request(app)
      .get("/api/reports/daily?date=2026-10-15")
      .set("Authorization", `Bearer ${tokenUser1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const stats = res.body.data.statistics;
    expect(stats.highest).toBe(150);
    expect(stats.lowest).toBe(90);
    expect(stats.average).toBe(120.0);
    expect(stats.count).toBe(3);

    // Verify readings list is included and ordered
    expect(res.body.data.readings.length).toBe(3);
    expect(res.body.data.readings[0].timeSlot).toBe("morning_fasting");
    expect(res.body.data.readings[1].timeSlot).toBe("after_breakfast");
    expect(res.body.data.readings[2].timeSlot).toBe("after_lunch");
  });

  test("GET /api/reports/daily - Handles empty report with nulls and count 0 (never NaN/0)", async () => {
    const res = await request(app)
      .get("/api/reports/daily?date=2026-10-01")
      .set("Authorization", `Bearer ${tokenUser1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const stats = res.body.data.statistics;
    expect(stats.highest).toBeNull();
    expect(stats.lowest).toBeNull();
    expect(stats.average).toBeNull();
    expect(stats.count).toBe(0);
    expect(res.body.data.readings).toEqual([]);
  });

  test("GET /api/reports/month-to-date - Calculates month-to-date range (1st to selected date)", async () => {
    const res = await request(app)
      .get("/api/reports/month-to-date?date=2026-10-15")
      .set("Authorization", `Bearer ${tokenUser1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.effectiveRange.startDate).toBe("2026-10-01");
    expect(res.body.data.effectiveRange.endDate).toBe("2026-10-15");

    // 4 readings in Oct: 100, 90, 120, 150 -> Max 150, Min 90, Avg 115.0, Count 4
    const stats = res.body.data.statistics;
    expect(stats.highest).toBe(150);
    expect(stats.lowest).toBe(90);
    expect(stats.average).toBe(115.0);
    expect(stats.count).toBe(4);
  });

  test("GET /api/reports/monthly - Calculates entire previous calendar month", async () => {
    const res = await request(app)
      .get("/api/reports/monthly?date=2026-10-15")
      .set("Authorization", `Bearer ${tokenUser1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.effectiveRange.startDate).toBe("2026-09-01");
    expect(res.body.data.effectiveRange.endDate).toBe("2026-09-30");

    // 2 readings in Sept: 110, 130 -> Max 130, Min 110, Avg 120.0, Count 2
    const stats = res.body.data.statistics;
    expect(stats.highest).toBe(130);
    expect(stats.lowest).toBe(110);
    expect(stats.average).toBe(120.0);
    expect(stats.count).toBe(2);
  });

  test("Date Boundary: Year boundary handles January selecting December of previous year", () => {
    const range = getPreviousMonthRange("2026-01-15");
    expect(range.startDate).toBe("2025-12-01");
    expect(range.endDate).toBe("2025-12-31");
    expect(range.year).toBe(2025);
    expect(range.month).toBe("12");
  });

  test("Date Boundary: Leap year February correctly calculates 29 days vs 28 days", () => {
    // 2024 is leap year
    expect(isLeapYear(2024)).toBe(true);
    expect(getDaysInMonth(2024, 2)).toBe(29);

    const leapRange = getPreviousMonthRange("2024-03-10");
    expect(leapRange.startDate).toBe("2024-02-01");
    expect(leapRange.endDate).toBe("2024-02-29");

    // 2025 is not leap year
    expect(isLeapYear(2025)).toBe(false);
    expect(getDaysInMonth(2025, 2)).toBe(28);

    const nonLeapRange = getPreviousMonthRange("2025-03-10");
    expect(nonLeapRange.startDate).toBe("2025-02-01");
    expect(nonLeapRange.endDate).toBe("2025-02-28");
  });

  test("User Isolation: User 2 reports only include User 2 data", async () => {
    const res = await request(app)
      .get("/api/reports/daily?date=2026-10-15")
      .set("Authorization", `Bearer ${tokenUser2}`);

    expect(res.status).toBe(200);
    const stats = res.body.data.statistics;
    expect(stats.count).toBe(1);
    expect(stats.highest).toBe(200);
    expect(stats.lowest).toBe(200);
    expect(stats.average).toBe(200.0);
  });

  test("GET /api/reports/daily - Rejects future date with exact error", async () => {
    const res = await request(app)
      .get("/api/reports/daily?date=2099-01-01")
      .set("Authorization", `Bearer ${tokenUser1}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Date cannot be in the future.");
  });
});
