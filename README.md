<<<<<<< HEAD
# Sweety-Blood-Glucose-Tracker
=======
# Sweety – Blood Glucose Tracker
> A full-stack web application for individuals managing diabetes to record daily blood glucose readings, track trends, and analyze clinical reports.

[![Tech Stack](https://img.shields.io/badge/Stack-React_|_Express_|_PostgreSQL-rose.svg)](#technology-stack)
[![Database](https://img.shields.io/badge/Database-PostgreSQL_16%2F18-blue.svg)](#postgresql-database-design)
[![Security](https://img.shields.io/badge/Auth-JWT_+_HttpOnly_Cookies-green.svg)](#security-and-privacy)

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Features Implemented](#features-implemented)
4. [Technology Stack](#technology-stack)
5. [Architecture Overview](#architecture-overview)
6. [Folder Structure](#folder-structure)
7. [Screenshots & Demo Guide](#screenshots--demo-guide)
8. [Prerequisites](#prerequisites)
9. [Installation & Setup](#installation--setup)
10. [Environment Variables](#environment-variables)
11. [Database Migrations & Seeding](#database-migrations--seeding)
12. [Running the Application](#running-the-application)
13. [Docker Setup](#docker-setup)
14. [Demo Credentials](#demo-credentials)
15. [Complete API Documentation](#complete-api-documentation)
16. [Validation Rules & Exact Error Messages](#validation-rules--exact-error-messages)
17. [Reporting Date-Range Definitions](#reporting-date-range-definitions)
18. [Automated Testing](#automated-testing)
19. [Security & Privacy](#security--privacy)
20. [Architectural Decisions & Notes](#architectural-decisions--notes)
21. [Known Limitations & Future Improvements](#known-limitations--future-improvements)
22. [Submission Checklist](#submission-checklist)

---

## Project Overview
**Sweety – Blood Glucose Tracker** is a secure, user-centric healthcare web application tailored for individuals with Type 1 or Type 2 diabetes. It empowers users to record up to four structured blood glucose readings per day, manage historical records with granular filtering and pagination, and view accurate statistical reports (Daily, Month-to-Date, and Previous Month) accompanied by dynamic trend visualizations.

---

## Problem Statement
Diabetes management requires consistent, structured blood glucose monitoring tied to daily meal timings (fasting, post-breakfast, post-lunch, post-dinner). Unstructured logging often leads to duplicate entries, inaccurate calculations, missed readings, and lack of historical perspective.

**Sweety** solves these pain points through:
1. **Enforced Meal Slots**: Four medical time slots (`morning_fasting`, `after_breakfast`, `after_lunch`, `after_dinner`).
2. **Double-Entry & Daily Overfill Prevention**: Database and application-level constraints preventing duplicate slot entries and capping daily logs to 4 per user.
3. **Rigorous Clinical Calculations**: Mathematical aggregates (highest, lowest, average rounded to 1 decimal place, count) without `NaN` or misleading zero-values.
4. **Data Isolation & Security**: Complete patient privacy where users only access their own records.

---

## Features Implemented
- **Authentication & User Management**:
  - Secure registration with email normalization and bcrypt password hashing (12 rounds).
  - Secure login with JWT stored in HttpOnly, SameSite cookies (with Bearer header fallback).
  - Profile session verification (`GET /api/auth/me`) preserving login state across page reloads.
  - Strict user data isolation across all endpoints.
- **Blood Glucose Management (CRUD)**:
  - Create, read, edit, and delete blood glucose readings.
  - Strict range validation: whole numbers between 40 and 600 mg/dL inclusive.
  - Calendar date validation preventing future dates.
  - Maximum 4 readings per day per user constraint.
  - Slot uniqueness constraint per day per user.
- **Filtering & Pagination**:
  - Filter by date range (From Date, To Date) and Time Slot.
  - Deterministic sorting by `reading_date DESC, created_at DESC`.
  - Pagination controls (`page`, `limit`, Previous/Next buttons).
- **Comprehensive Clinical Reports**:
  - **Daily Report**: Selected calendar date statistics + sorted chronological slot breakdown.
  - **Month-to-Date Report**: 1st of month through selected date inclusive.
  - **Previous Month Report**: Entire previous calendar month with leap year (Feb 29/28) and year boundary handling (Jan looking back to Dec of previous year).
  - Recharts monthly trend line chart with target normal glucose reference bands (70–140 mg/dL).
  - Friendly empty states displaying `--` instead of 0 or `NaN`.
- **UI/UX Design**:
  - Soft healthcare palette (Rose pink, pastel lavender, white, neutral slate).
  - Fully responsive on mobile, tablet, and desktop.
  - Accessible modal dialogs for delete confirmations and quick-entry forms.
  - Real-time inline field validation errors.

---

## Technology Stack

### Frontend
- **Framework**: React.js 18 with Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios (configured with `withCredentials: true` and interceptors)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Testing**: Vitest & React Testing Library

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database Driver**: `pg` (node-postgres connection pool)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Security**: `helmet`, `cookie-parser`, `cors`, `express-rate-limit`
- **Testing**: Jest & Supertest

### Database
- **Engine**: PostgreSQL 16 / 18
- **Schema Management**: Pure SQL migrations with tracking (`schema_migrations`)
- **Key Constraints**: Unique composite constraint on `(user_id, reading_date, time_slot)`, CHECK constraint on `glucose_value BETWEEN 40 AND 600`, Foreign key CASCADE.

---

## Architecture Overview
The application follows a clean **Monorepo** structure separating client and server, utilizing a modular **Controller-Service-Data Access** pattern on the backend:

```
[ Client (React + Vite + Tailwind) ]
                |  (HTTP / JSON with HttpOnly Cookie)
                v
[ Express App (app.js) ]
  ├── Security Middleware (Helmet, CORS, Rate Limiting, Cookie Parser)
  ├── Route Handlers (/api/auth, /api/readings, /api/reports)
  ├── Auth Middleware (JWT Verification & User Isolation)
  ├── Validation Middleware (Exact Error Messaging)
  ├── Controllers (Request / Response Orchestration)
  ├── Services (Business Logic & Mathematical Calculations)
  └── Centralized Error Middleware (PostgreSQL Error Mapping)
                |
                v  (Parameterized SQL Queries via pg Pool)
[ PostgreSQL Database (users, readings, schema_migrations) ]
```

---

## Folder Structure

```
sweety-blood-glucose-tracker/
├── .editorconfig
├── .env.example
├── .gitignore
├── .prettierrc.json
├── docker-compose.yml
├── package.json
├── README.md
├── screenshots/
│   └── README.md
├── client/
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── Dockerfile
│   ├── public/
│   │   └── favicon.svg
│   └── src/
│       ├── api/
│       │   ├── axios.js
│       │   ├── authApi.js
│       │   ├── readingsApi.js
│       │   └── reportsApi.js
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── LoadingSpinner.jsx
│       │   ├── ErrorMessage.jsx
│       │   ├── EmptyState.jsx
│       │   ├── ConfirmDialog.jsx
│       │   ├── GlucoseReadingForm.jsx
│       │   ├── ReadingTable.jsx
│       │   ├── ReportSummary.jsx
│       │   └── ReportChart.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── hooks/
│       │   └── useAuth.js
│       ├── layouts/
│       │   ├── AuthLayout.jsx
│       │   └── DashboardLayout.jsx
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Readings.jsx
│       │   ├── Reports.jsx
│       │   └── NotFound.jsx
│       ├── utils/
│       │   ├── dateUtils.js
│       │   └── glucoseUtils.js
│       ├── tests/
│       │   ├── setup.js
│       │   └── GlucoseReadingForm.test.jsx
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
└── server/
    ├── .env.example
    ├── package.json
    ├── jest.config.js
    ├── Dockerfile
    ├── migrations/
    │   ├── 001_create_users.sql
    │   ├── 002_create_readings.sql
    │   └── runMigrations.js
    ├── seeds/
    │   └── seed.js
    ├── src/
    │   ├── app.js
    │   ├── server.js
    │   ├── config/
    │   │   └── database.js
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   ├── readingController.js
    │   │   └── reportController.js
    │   ├── middleware/
    │   │   ├── authMiddleware.js
    │   │   ├── errorMiddleware.js
    │   │   ├── validateRequest.js
    │   │   └── rateLimitMiddleware.js
    │   ├── routes/
    │   │   ├── authRoutes.js
    │   │   ├── readingRoutes.js
    │   │   └── reportRoutes.js
    │   ├── services/
    │   │   ├── authService.js
    │   │   ├── readingService.js
    │   │   └── reportService.js
    │   ├── validators/
    │   │   ├── authValidator.js
    │   │   └── readingValidator.js
    │   └── utils/
    │       ├── dateUtils.js
    │       └── ApiError.js
    └── tests/
        ├── auth.test.js
        ├── readings.test.js
        └── reports.test.js
```

---

## Screenshots & Demo Guide
See [screenshots/README.md](screenshots/README.md) for the complete screenshot checklist and the 2–3 minute demonstration sequence.

---

## Prerequisites
- **Node.js**: v18.x or v20.x LTS
- **npm**: v9.x or v10.x
- **PostgreSQL**: v14, v15, v16, or v18
- **Git**: v2.x+
- *(Optional)* **Docker & Docker Compose**: v2.20+

---

## Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/sweety-blood-glucose-tracker.git
cd sweety-blood-glucose-tracker
```

### 2. Configure Environment Files

**Root**:
```powershell
# Windows PowerShell
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

**Server**:
```powershell
# Windows PowerShell
Copy-Item server\.env.example server\.env

# macOS / Linux
cp server/.env.example server/.env
```

**Client**:
```powershell
# Windows PowerShell
Copy-Item client\.env.example client\.env

# macOS / Linux
cp client/.env.example client/.env
```

### 3. Install Dependencies
From the repository root:
```bash
npm install
npm install --prefix server
npm install --prefix client
```

---

## Database Migrations & Seeding

### 1. Create PostgreSQL Database
Using `psql` or pgAdmin:
```sql
CREATE DATABASE sweety_db;
CREATE DATABASE sweety_test_db; -- For running tests
```

### 2. Execute SQL Migrations
Runs `001_create_users.sql` and `002_create_readings.sql` in order with idempotent tracking:
```bash
# From root
npm run migrate

# Or directly inside server/
cd server
npm run migrate
```

### 3. Seed Demo Data
Creates the demo patient account and populated sample readings across today, previous week, and previous month:
```bash
# From root
npm run seed

# Or directly inside server/
cd server
npm run seed
```

---

## Running the Application

### Option A: Run Both Concurrently (Recommended)
From root:
```bash
npm run dev
```

### Option B: Run Individually

**Terminal 1 (Backend Server)**:
```bash
cd server
npm run dev
# Server listens on http://localhost:5000 (API at http://localhost:5000/api)
```

**Terminal 2 (Frontend Client)**:
```bash
cd client
npm run dev
# Vite runs on http://localhost:5173
```

---

## Docker Setup
A functional `docker-compose.yml` is provided to spin up PostgreSQL, the Express API, and the React frontend in containers.

```bash
# Start all services in the background
docker-compose up -d --build

# Run migrations inside the server container
docker-compose exec server npm run migrate

# Run seed script inside the server container
docker-compose exec server npm run seed

# Stop services without deleting database volumes
docker-compose down

# Stop services and remove persistent volume
docker-compose down -v
```

Services exposed:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- PostgreSQL: `localhost:5432`

---

## Demo Credentials
Use these pre-seeded credentials to explore the application:

- **Email**: `demo@sweety.app`
- **Password**: `SweetyDemo123!`

> [!NOTE]
> The login screen includes a one-click **"Fill Demo Credentials"** button for quick evaluation.

---

## Complete API Documentation

### Authentication Endpoints

#### 1. Register User
- **Method / Route**: `POST /api/auth/register`
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword123!"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "user": {
      "id": "c1f7b022-7981-4b2a-880c-7b47b74f3299",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2026-10-29T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

#### 2. Login User
- **Method / Route**: `POST /api/auth/login`
- **Request Body**:
```json
{
  "email": "demo@sweety.app",
  "password": "SweetyDemo123!"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "e883ba56-912a-4315-9c87-8d07e600d89a",
      "name": "Demo Patient",
      "email": "demo@sweety.app"
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

#### 3. Current User Profile
- **Method / Route**: `GET /api/auth/me`
- **Headers / Cookie**: `Authorization: Bearer <token>` or HttpOnly `token` cookie
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "e883ba56-912a-4315-9c87-8d07e600d89a",
      "name": "Demo Patient",
      "email": "demo@sweety.app"
    }
  }
}
```

#### 4. Logout User
- **Method / Route**: `POST /api/auth/logout`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

---

### Reading Endpoints

#### 1. Create Reading
- **Method / Route**: `POST /api/readings`
- **Request Body**:
```json
{
  "readingDate": "2026-10-15",
  "timeSlot": "after_lunch",
  "glucoseValue": 135
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Reading created successfully.",
  "data": {
    "id": "a93bd105-0e32-474c-83b0-6f97ef78f0b7",
    "userId": "e883ba56-912a-4315-9c87-8d07e600d89a",
    "readingDate": "2026-10-15",
    "timeSlot": "after_lunch",
    "timeSlotLabel": "After lunch",
    "glucoseValue": 135,
    "createdAt": "2026-10-15T14:30:00.000Z",
    "updatedAt": "2026-10-15T14:30:00.000Z"
  }
}
```

#### 2. List Readings (with Filtering & Pagination)
- **Method / Route**: `GET /api/readings?page=1&limit=20&startDate=2026-10-01&endDate=2026-10-31&timeSlot=morning_fasting`
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "readings": [
      {
        "id": "a93bd105-0e32-474c-83b0-6f97ef78f0b7",
        "readingDate": "2026-10-15",
        "timeSlot": "morning_fasting",
        "timeSlotLabel": "Morning (fasting)",
        "glucoseValue": 95
      }
    ],
    "pagination": {
      "totalCount": 1,
      "currentPage": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

#### 3. Update Reading
- **Method / Route**: `PUT /api/readings/:id`
- **Request Body**:
```json
{
  "readingDate": "2026-10-15",
  "timeSlot": "after_lunch",
  "glucoseValue": 140
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Reading updated successfully.",
  "data": {
    "id": "a93bd105-0e32-474c-83b0-6f97ef78f0b7",
    "glucoseValue": 140,
    "updatedAt": "2026-10-15T15:00:00.000Z"
  }
}
```

#### 4. Delete Reading
- **Method / Route**: `DELETE /api/readings/:id`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Reading deleted successfully.",
  "data": {
    "id": "a93bd105-0e32-474c-83b0-6f97ef78f0b7"
  }
}
```

---

### Report Endpoints

#### 1. Daily Report
- **Method / Route**: `GET /api/reports/daily?date=2026-10-15`
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "reportType": "daily",
    "selectedDate": "2026-10-15",
    "effectiveRange": {
      "startDate": "2026-10-15",
      "endDate": "2026-10-15"
    },
    "statistics": {
      "highest": 150,
      "lowest": 90,
      "average": 120.0,
      "count": 3
    },
    "readings": [
      {
        "id": "r1",
        "readingDate": "2026-10-15",
        "timeSlot": "morning_fasting",
        "timeSlotLabel": "Morning (fasting)",
        "glucoseValue": 90
      },
      {
        "id": "r2",
        "readingDate": "2026-10-15",
        "timeSlot": "after_breakfast",
        "timeSlotLabel": "After breakfast",
        "glucoseValue": 120
      },
      {
        "id": "r3",
        "readingDate": "2026-10-15",
        "timeSlot": "after_lunch",
        "timeSlotLabel": "After lunch",
        "glucoseValue": 150
      }
    ]
  }
}
```

#### 2. Month-to-Date Report
- **Method / Route**: `GET /api/reports/month-to-date?date=2026-10-15`
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "reportType": "month_to_date",
    "selectedDate": "2026-10-15",
    "effectiveRange": {
      "startDate": "2026-10-01",
      "endDate": "2026-10-15"
    },
    "statistics": {
      "highest": 150,
      "lowest": 90,
      "average": 115.0,
      "count": 4
    }
  }
}
```

#### 3. Monthly Report (Entire Previous Month)
- **Method / Route**: `GET /api/reports/monthly?date=2026-10-15`
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "reportType": "monthly_previous",
    "selectedDate": "2026-10-15",
    "targetMonth": "2026-09",
    "effectiveRange": {
      "startDate": "2026-09-01",
      "endDate": "2026-09-30"
    },
    "statistics": {
      "highest": 155,
      "lowest": 89,
      "average": 118.4,
      "count": 12
    }
  }
}
```

---

## Validation Rules & Exact Error Messages

| Condition | Field / Scenario | Exact Error Message |
| :--- | :--- | :--- |
| Empty glucose value | `glucoseValue` | `"Please enter a glucose value."` |
| Non-numeric / Decimal / <40 or >600 | `glucoseValue` | `"Value must be between 40 and 600 mg/dl."` |
| Duplicate slot for same date & user | `timeSlot`, `readingDate` | `"You already have an After lunch reading for this date."` *(dynamic slot label)* |
| Exceeding 4 readings per day | Daily count limit | `"You can add only 4 readings per day."` |
| Future calendar date | `readingDate` or `date` query | `"Date cannot be in the future."` |
| Invalid date string | `readingDate` | `"Please enter a valid calendar date in YYYY-MM-DD format."` |
| Invalid slot option | `timeSlot` | `"Please select a valid time slot."` |
| Duplicate email | Registration | `"An account with this email already exists."` |
| Invalid credentials | Login | `"Invalid email or password."` |

---

## Reporting Date-Range Definitions

1. **Daily Report**:
   - `startDate`: `YYYY-MM-DD`
   - `endDate`: `YYYY-MM-DD`
   - Scope: The single requested calendar day.
2. **Month-to-Date Report**:
   - `startDate`: `YYYY-MM-01` (1st day of the selected date's month)
   - `endDate`: `YYYY-MM-DD` (selected date, inclusive)
3. **Monthly Report (Previous Calendar Month)**:
   - `startDate`: `YYYY-prevMonth-01`
   - `endDate`: `YYYY-prevMonth-lastDay`
   - Scope: The entire preceding month regardless of which day in the current month is selected.
   - Example 1: `2026-10-15` -> `2026-09-01` to `2026-09-30`.
   - Example 2 (Year Boundary): `2026-01-15` -> `2025-12-01` to `2025-12-31`.
   - Example 3 (Leap Year): `2024-03-10` -> `2024-02-01` to `2024-02-29`.

---

## Automated Testing

### Backend API Tests (Jest & Supertest)
```bash
# Run all server tests
npm run test:server

# Or inside server directory
cd server
npm test
```
**Test Coverage**:
- `tests/auth.test.js`: Registration, duplicate emails, password validation, login, wrong passwords, HttpOnly cookie emission, Bearer fallback, profile lookup, logout.
- `tests/readings.test.js`: Create reading, exact validation errors (<40, >600, decimals, future dates, missing values), duplicate slot conflict, daily 4-reading limit, user isolation (User A cannot access/edit/delete User B's records), updates, deletes.
- `tests/reports.test.js`: Daily stats calculation (dataset 90, 120, 150), empty state (nulls, count 0, no NaN), Month-to-Date range, previous month range, year boundary (Jan -> Dec), leap year Feb 29 vs 28, user isolation.

### Frontend Component Tests (Vitest & React Testing Library)
```bash
# Run all client tests
npm run test:client

# Or inside client directory
cd client
npm test
```
**Test Coverage**:
- `GlucoseReadingForm.test.jsx`: Required value validation, min/max bounds, decimal rejection, future date prevention, button disabling while saving, server error banner rendering, valid submission handler invocation.

---

## Security & Privacy
1. **Password Hashing**: Stored with bcrypt using 12 salt rounds; plaintext passwords never saved.
2. **Token Security**: JWT issued via `HttpOnly`, `SameSite=Lax` (or `None` with `Secure` in production) cookies, mitigating XSS token harvesting.
3. **User Isolation**: All database queries parameterize `user_id` sourced exclusively from the verified JWT payload (`req.user.id`). Client-provided IDs are never trusted.
4. **SQL Injection Prevention**: 100% parameterized queries using the `pg` driver; zero string interpolation.
5. **Brute Force Protection**: Rate limiting (`express-rate-limit`) on `/api/auth/*` endpoints (100 requests per 15 minutes).
6. **HTTP Security Headers**: `helmet` enforces Content-Security-Policy, HSTS, X-Frame-Options, and XSS filtering.
7. **Production Error Masking**: Centralized error middleware ensures stack traces, database credentials, and system details are never exposed to clients.
8. **Clinical Disclaimer**: Informational wellness tracking tool only; does not provide automated clinical diagnosis or prescriptions.

---

## Architectural Decisions & Notes

### Why PostgreSQL instead of MongoDB?
PostgreSQL provides ACID transactions, composite unique constraints (`user_id, reading_date, time_slot`), CHECK constraints (`glucose_value BETWEEN 40 AND 600`), and performant native aggregates (`MAX`, `MIN`, `AVG`, `COUNT`), making it vastly superior for medical record integrity.

### Calendar Date vs. UTC Instant
Blood glucose logs are calendar-based daily events. To prevent timezone-induced off-by-one shifts (e.g., UTC conversion turning Oct 15 01:00 AM into Oct 14 19:30 PM), dates are strictly modeled and stored as PostgreSQL `DATE` types (`YYYY-MM-DD`).

### How Duplicate Slots and the 4-Reading Daily Limit Are Enforced
1. **Duplicate Slots**: Enforced at the application level via checking query and at the database level via `CONSTRAINT unique_user_date_slot UNIQUE (user_id, reading_date, time_slot)`.
2. **Daily 4-Reading Limit**: Enforced via application pre-insert verification `SELECT COUNT(*)` on the target date. Because there are exactly four permitted slots (`morning_fasting`, `after_breakfast`, `after_lunch`, `after_dinner`) and each slot can only be used once, the composite constraint reinforces the 4-reading limit even under race conditions.

### Handling Empty Report Values
When no readings exist in the requested date range:
- `highest`: `null` (not 0)
- `lowest`: `null` (not 0)
- `average`: `null` (not 0 or `NaN`)
- `count`: `0`
The frontend renders `--` or `N/A` with an informative empty state illustration.

---

## Known Limitations & Future Improvements
1. **Multi-device Biometric Authentication**: WebAuthn / Passkeys could be added for frictionless mobile sign-in.
2. **Continuous Glucose Monitor (CGM) Integration**: Future versions could ingest CSV/API data from Dexcom or Abbott FreeStyle Libre devices.
3. **Doctor-Patient Delegation**: Role-based access control (RBAC) permitting healthcare providers to view assigned patient trend charts with patient consent.
4. **Offline Sync**: Service Worker with IndexedDB storage for offline field logging with automatic synchronization when online.

---

## Submission Checklist

- [x] Monorepo structure with `client/` and `server/`
- [x] Complete PostgreSQL database schema with UUID keys, constraints, and indexes
- [x] SQL migration runner with schema tracking
- [x] Repeatable demo seed script with dynamic dates (`demo@sweety.app` / `SweetyDemo123!`)
- [x] Secure authentication with bcrypt (12 rounds) and JWT
- [x] User data isolation across all endpoints
- [x] Complete Blood Glucose CRUD operations
- [x] Exact validation error messages implemented
- [x] Daily report with sorted chronological meal slots
- [x] Month-to-date calculation
- [x] Previous month report with leap year and year boundary logic
- [x] Recharts trend visualization
- [x] Pagination and filtering on readings list
- [x] Automated backend tests with Supertest (auth, readings, reports)
- [x] Automated frontend tests with React Testing Library
- [x] Soft healthcare UI design with Tailwind CSS
- [x] Functional Docker Compose setup
- [x] Complete environment examples (`.env.example`)
>>>>>>> 7d093ae (docs: add demo seed script, screenshot walkthrough guide, and complete documentation)
