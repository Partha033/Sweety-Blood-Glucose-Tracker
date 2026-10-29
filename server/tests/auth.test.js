const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Mock database module for isolated fast automated tests
jest.mock("../src/config/database", () => {
  const usersTable = [];
  const readingsTable = [];

  return {
    pool: {
      connect: jest.fn().mockResolvedValue({
        query: jest.fn(),
        release: jest.fn(),
      }),
      end: jest.fn().mockResolvedValue(true),
    },
    query: jest.fn(async (text, params) => {
      const lowerText = text.toLowerCase();

      // INSERT INTO users
      if (lowerText.includes("insert into users")) {
        const [name, email, password_hash] = params;
        const newUser = {
          id: `user-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          name,
          email: email.toLowerCase(),
          password_hash,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        usersTable.push(newUser);
        return { rows: [newUser] };
      }

      // SELECT from users by ID (must check where id first before where email)
      if (lowerText.includes("where id = $1")) {
        const id = params[0];
        const found = usersTable.filter((u) => u.id === id);
        return { rows: found };
      }

      // SELECT from users by email
      if (lowerText.includes("where lower(email)")) {
        const email = params[0].toLowerCase();
        const found = usersTable.filter((u) => u.email === email);
        return { rows: found };
      }

      return { rows: [] };
    }),
    _usersTable: usersTable,
  };
});

const app = require("../src/app");

describe("Authentication API Tests", () => {
  const testUser = {
    name: "Jane Doe",
    email: "jane.doe@example.com",
    password: "Password123!",
  };

  test("POST /api/auth/register - Successfully registers a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.user.name).toBe(testUser.name);
    expect(res.body.data.user.password_hash).toBeUndefined();
    expect(res.body.data.token).toBeDefined();
    // Check HttpOnly cookie
    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.includes("token="))).toBe(true);
  });

  test("POST /api/auth/register - Rejects duplicate email registration", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test("POST /api/auth/register - Rejects missing name", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "noname@example.com",
        password: "Password123!",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/name is required/i);
  });

  test("POST /api/auth/register - Rejects invalid email format", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "not-an-email",
        password: "Password123!",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/valid email/i);
  });

  test("POST /api/auth/register - Rejects password shorter than 8 characters", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "shortpass@example.com",
        password: "123",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/at least 8 characters/i);
  });

  test("POST /api/auth/login - Successfully logs in with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.token).toBeDefined();
  });

  test("POST /api/auth/login - Rejects incorrect password with generic error", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: "WrongPassword!",
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid email or password.");
  });

  test("GET /api/auth/me - Rejects request without authentication token", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/auth/me - Successfully retrieves profile with valid Bearer token", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    const token = loginRes.body.data.token;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
  });

  test("POST /api/auth/logout - Clears authentication cookie", async () => {
    const res = await request(app).post("/api/auth/logout");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
