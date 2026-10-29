/**
 * Date utilities for Sweety Blood Glucose Tracker
 * Adheres to calendar date-only operations (YYYY-MM-DD) avoiding timezone shifts
 */

const TIME_SLOTS = {
  MORNING_FASTING: "morning_fasting",
  AFTER_BREAKFAST: "after_breakfast",
  AFTER_LUNCH: "after_lunch",
  AFTER_DINNER: "after_dinner",
};

const TIME_SLOT_LABELS = {
  morning_fasting: "Morning (fasting)",
  after_breakfast: "After breakfast",
  after_lunch: "After lunch",
  after_dinner: "After dinner",
};

const TIME_SLOT_ORDER = [
  "morning_fasting",
  "after_breakfast",
  "after_lunch",
  "after_dinner",
];

/**
 * Checks if a year is a leap year
 */
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Returns number of days in a given month (1-12) of a year
 */
function getDaysInMonth(year, month) {
  const daysInMonths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return daysInMonths[month - 1];
}

/**
 * Validates strictly YYYY-MM-DD format and actual calendar existence
 */
function isValidDateString(dateStr) {
  if (typeof dateStr !== "string") return false;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;

  const maxDays = getDaysInMonth(year, month);
  if (day < 1 || day > maxDays) return false;

  return true;
}

/**
 * Gets today's calendar date as YYYY-MM-DD string
 */
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a date string is in the future relative to today
 */
function isFutureDate(dateStr) {
  const today = getTodayDateString();
  return dateStr > today;
}

/**
 * Calculates Month-to-Date range for a given date
 * Range: 1st of selected month to selected date inclusive
 */
function getMonthToDateRange(dateStr) {
  const [year, month] = dateStr.split("-");
  const startDate = `${year}-${month}-01`;
  const endDate = dateStr;
  return { startDate, endDate };
}

/**
 * Calculates Previous Month range for a given date
 * Example: 2026-10-15 -> 2026-09-01 to 2026-09-30
 * Example: 2026-01-15 -> 2025-12-01 to 2025-12-31
 * Example: 2024-03-10 -> 2024-02-01 to 2024-02-29 (leap year)
 */
function getPreviousMonthRange(dateStr) {
  const parts = dateStr.split("-");
  let year = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10);

  // Previous month calculation
  if (month === 1) {
    month = 12;
    year -= 1;
  } else {
    month -= 1;
  }

  const prevMonthStr = String(month).padStart(2, "0");
  const daysInPrevMonth = getDaysInMonth(year, month);
  const startDate = `${year}-${prevMonthStr}-01`;
  const endDate = `${year}-${prevMonthStr}-${String(daysInPrevMonth).padStart(2, "0")}`;

  return { startDate, endDate, year, month: prevMonthStr };
}

module.exports = {
  TIME_SLOTS,
  TIME_SLOT_LABELS,
  TIME_SLOT_ORDER,
  isLeapYear,
  getDaysInMonth,
  isValidDateString,
  getTodayDateString,
  isFutureDate,
  getMonthToDateRange,
  getPreviousMonthRange,
};
