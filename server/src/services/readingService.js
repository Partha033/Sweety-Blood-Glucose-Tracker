const { query } = require("../config/database");
const ApiError = require("../utils/ApiError");
const { TIME_SLOT_LABELS, TIME_SLOTS } = require("../utils/dateUtils");

/**
 * Format a database row into a standardized clean response object
 */
function formatReading(row) {
  if (!row) return null;

  // Format date safely as YYYY-MM-DD
  let dateStr = row.reading_date;
  if (row.reading_date instanceof Date) {
    const y = row.reading_date.getFullYear();
    const m = String(row.reading_date.getMonth() + 1).padStart(2, "0");
    const d = String(row.reading_date.getDate()).padStart(2, "0");
    dateStr = `${y}-${m}-${d}`;
  } else if (typeof dateStr === "string" && dateStr.includes("T")) {
    dateStr = dateStr.split("T")[0];
  }

  return {
    id: row.id,
    userId: row.user_id,
    readingDate: dateStr,
    timeSlot: row.time_slot,
    timeSlotLabel: TIME_SLOT_LABELS[row.time_slot] || row.time_slot,
    glucoseValue: parseInt(row.glucose_value, 10),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function createReading(userId, { readingDate, timeSlot, glucoseValue }) {
  // Check if a reading for this slot already exists on this date
  const slotConflict = await query(
    `SELECT id FROM readings 
     WHERE user_id = $1 AND reading_date = $2 AND time_slot = $3`,
    [userId, readingDate, timeSlot]
  );

  const slotLabel = TIME_SLOT_LABELS[timeSlot] || timeSlot;

  if (slotConflict.rows.length > 0) {
    throw ApiError.conflict(`You already have an ${slotLabel} reading for this date.`);
  }

  // Check 4-readings daily limit
  const countResult = await query(
    `SELECT COUNT(*)::int AS count 
     FROM readings 
     WHERE user_id = $1 AND reading_date = $2`,
    [userId, readingDate]
  );

  if (countResult.rows[0].count >= 4) {
    throw ApiError.badRequest("You can add only 4 readings per day.");
  }

  // Insert reading
  const result = await query(
    `INSERT INTO readings (user_id, reading_date, time_slot, glucose_value)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, reading_date, time_slot, glucose_value, created_at, updated_at`,
    [userId, readingDate, timeSlot, glucoseValue]
  );

  return formatReading(result.rows[0]);
}

async function getReadings(userId, filters = {}) {
  const page = Math.max(1, parseInt(filters.page || 1, 10));
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit || 20, 10)));
  const offset = (page - 1) * limit;

  const conditions = ["user_id = $1"];
  const params = [userId];
  let paramIndex = 2;

  if (filters.startDate) {
    conditions.push(`reading_date >= $${paramIndex}`);
    params.push(filters.startDate);
    paramIndex++;
  }

  if (filters.endDate) {
    conditions.push(`reading_date <= $${paramIndex}`);
    params.push(filters.endDate);
    paramIndex++;
  }

  if (filters.timeSlot && Object.values(TIME_SLOTS).includes(filters.timeSlot)) {
    conditions.push(`time_slot = $${paramIndex}`);
    params.push(filters.timeSlot);
    paramIndex++;
  }

  const whereClause = conditions.join(" AND ");
  const sortDirection = filters.sortOrder && filters.sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

  // Total count query
  const countQuery = `SELECT COUNT(*)::int AS total FROM readings WHERE ${whereClause}`;
  const countResult = await query(countQuery, params);
  const totalCount = countResult.rows[0].total;
  const totalPages = Math.ceil(totalCount / limit) || 1;

  // Data query with deterministic sorting
  const dataQuery = `
    SELECT id, user_id, reading_date, time_slot, glucose_value, created_at, updated_at
    FROM readings
    WHERE ${whereClause}
    ORDER BY reading_date ${sortDirection}, created_at ${sortDirection}, id DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  params.push(limit, offset);
  const dataResult = await query(dataQuery, params);

  return {
    readings: dataResult.rows.map(formatReading),
    pagination: {
      totalCount,
      currentPage: page,
      limit,
      totalPages,
    },
  };
}

async function getReadingById(userId, readingId) {
  const result = await query(
    `SELECT id, user_id, reading_date, time_slot, glucose_value, created_at, updated_at
     FROM readings
     WHERE id = $1 AND user_id = $2`,
    [readingId, userId]
  );

  if (result.rows.length === 0) {
    throw ApiError.notFound("Reading not found.");
  }

  return formatReading(result.rows[0]);
}

async function updateReading(userId, readingId, { readingDate, timeSlot, glucoseValue }) {
  // Check ownership
  const existing = await query(
    `SELECT id, reading_date, time_slot FROM readings WHERE id = $1 AND user_id = $2`,
    [readingId, userId]
  );

  if (existing.rows.length === 0) {
    throw ApiError.notFound("Reading not found.");
  }

  const slotLabel = TIME_SLOT_LABELS[timeSlot] || timeSlot;

  // Check conflict if target date/slot is already taken by another reading
  const conflict = await query(
    `SELECT id FROM readings 
     WHERE user_id = $1 AND reading_date = $2 AND time_slot = $3 AND id != $4`,
    [userId, readingDate, timeSlot, readingId]
  );

  if (conflict.rows.length > 0) {
    throw ApiError.conflict(`You already have an ${slotLabel} reading for this date.`);
  }

  // Format existing date safely
  let existingDateStr = existing.rows[0].reading_date;
  if (existingDateStr instanceof Date) {
    const y = existingDateStr.getFullYear();
    const m = String(existingDateStr.getMonth() + 1).padStart(2, "0");
    const d = String(existingDateStr.getDate()).padStart(2, "0");
    existingDateStr = `${y}-${m}-${d}`;
  }

  // If date changed, check 4-readings daily limit on the target date
  if (existingDateStr !== readingDate) {
    const targetCountResult = await query(
      `SELECT COUNT(*)::int AS count FROM readings WHERE user_id = $1 AND reading_date = $2`,
      [userId, readingDate]
    );

    if (targetCountResult.rows[0].count >= 4) {
      throw ApiError.badRequest("You can add only 4 readings per day.");
    }
  }

  // Perform update
  const result = await query(
    `UPDATE readings
     SET reading_date = $1, time_slot = $2, glucose_value = $3, updated_at = CURRENT_TIMESTAMP
     WHERE id = $4 AND user_id = $5
     RETURNING id, user_id, reading_date, time_slot, glucose_value, created_at, updated_at`,
    [readingDate, timeSlot, glucoseValue, readingId, userId]
  );

  return formatReading(result.rows[0]);
}

async function deleteReading(userId, readingId) {
  const result = await query(
    `DELETE FROM readings WHERE id = $1 AND user_id = $2 RETURNING id`,
    [readingId, userId]
  );

  if (result.rows.length === 0) {
    throw ApiError.notFound("Reading not found.");
  }

  return { id: readingId };
}

module.exports = {
  createReading,
  getReadings,
  getReadingById,
  updateReading,
  deleteReading,
  formatReading,
};
