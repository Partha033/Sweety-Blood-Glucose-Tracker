const { query } = require("../config/database");
const {
  getMonthToDateRange,
  getPreviousMonthRange,
  TIME_SLOT_ORDER,
  TIME_SLOT_LABELS,
} = require("../utils/dateUtils");
const { formatReading } = require("./readingService");

/**
 * Safely compute report statistics from PostgreSQL aggregate results
 */
function computeStats(row) {
  const count = parseInt(row.count, 10) || 0;

  if (count === 0) {
    return {
      highest: null,
      lowest: null,
      average: null,
      count: 0,
    };
  }

  const highest = parseInt(row.max_glucose, 10);
  const lowest = parseInt(row.min_glucose, 10);
  const rawAvg = parseFloat(row.avg_glucose);
  // Round to exactly one decimal place
  const average = Number((Math.round(rawAvg * 10) / 10).toFixed(1));

  return {
    highest,
    lowest,
    average,
    count,
  };
}

async function getDailyReport(userId, dateStr) {
  // Aggregate stats query
  const statsQuery = `
    SELECT 
      COUNT(*)::int AS count,
      MAX(glucose_value) AS max_glucose,
      MIN(glucose_value) AS min_glucose,
      AVG(glucose_value) AS avg_glucose
    FROM readings
    WHERE user_id = $1 AND reading_date = $2
  `;

  const statsResult = await query(statsQuery, [userId, dateStr]);
  const stats = computeStats(statsResult.rows[0]);

  // Daily readings query
  const readingsQuery = `
    SELECT id, user_id, reading_date, time_slot, glucose_value, created_at, updated_at
    FROM readings
    WHERE user_id = $1 AND reading_date = $2
  `;

  const readingsResult = await query(readingsQuery, [userId, dateStr]);
  const readings = readingsResult.rows.map(formatReading);

  // Sort readings in the standard medical slot order
  readings.sort((a, b) => {
    return TIME_SLOT_ORDER.indexOf(a.timeSlot) - TIME_SLOT_ORDER.indexOf(b.timeSlot);
  });

  return {
    reportType: "daily",
    selectedDate: dateStr,
    effectiveRange: {
      startDate: dateStr,
      endDate: dateStr,
    },
    statistics: stats,
    readings,
  };
}

async function getMonthToDateReport(userId, dateStr) {
  const { startDate, endDate } = getMonthToDateRange(dateStr);

  const statsQuery = `
    SELECT 
      COUNT(*)::int AS count,
      MAX(glucose_value) AS max_glucose,
      MIN(glucose_value) AS min_glucose,
      AVG(glucose_value) AS avg_glucose
    FROM readings
    WHERE user_id = $1 AND reading_date >= $2 AND reading_date <= $3
  `;

  const statsResult = await query(statsQuery, [userId, startDate, endDate]);
  const stats = computeStats(statsResult.rows[0]);

  // Also fetch list of readings in this range for optional detailed view / charts
  const readingsQuery = `
    SELECT id, user_id, reading_date, time_slot, glucose_value, created_at, updated_at
    FROM readings
    WHERE user_id = $1 AND reading_date >= $2 AND reading_date <= $3
    ORDER BY reading_date ASC, created_at ASC
  `;

  const readingsResult = await query(readingsQuery, [userId, startDate, endDate]);
  const readings = readingsResult.rows.map(formatReading);

  return {
    reportType: "month_to_date",
    selectedDate: dateStr,
    effectiveRange: {
      startDate,
      endDate,
    },
    statistics: stats,
    readings,
  };
}

async function getMonthlyReport(userId, dateStr) {
  // Monthly report is defined as the entire PREVIOUS calendar month
  const { startDate, endDate, year, month } = getPreviousMonthRange(dateStr);

  const statsQuery = `
    SELECT 
      COUNT(*)::int AS count,
      MAX(glucose_value) AS max_glucose,
      MIN(glucose_value) AS min_glucose,
      AVG(glucose_value) AS avg_glucose
    FROM readings
    WHERE user_id = $1 AND reading_date >= $2 AND reading_date <= $3
  `;

  const statsResult = await query(statsQuery, [userId, startDate, endDate]);
  const stats = computeStats(statsResult.rows[0]);

  // Fetch all readings in previous month for chart data points
  const readingsQuery = `
    SELECT id, user_id, reading_date, time_slot, glucose_value, created_at, updated_at
    FROM readings
    WHERE user_id = $1 AND reading_date >= $2 AND reading_date <= $3
    ORDER BY reading_date ASC, created_at ASC
  `;

  const readingsResult = await query(readingsQuery, [userId, startDate, endDate]);
  const readings = readingsResult.rows.map(formatReading);

  return {
    reportType: "monthly_previous",
    selectedDate: dateStr,
    targetMonth: `${year}-${month}`,
    effectiveRange: {
      startDate,
      endDate,
    },
    statistics: stats,
    readings,
  };
}

module.exports = {
  getDailyReport,
  getMonthToDateReport,
  getMonthlyReport,
  computeStats,
};
