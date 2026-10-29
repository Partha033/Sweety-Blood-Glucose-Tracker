const ApiError = require("../utils/ApiError");
const {
  isValidDateString,
  isFutureDate,
  TIME_SLOTS,
  TIME_SLOT_LABELS,
} = require("../utils/dateUtils");

const ALLOWED_SLOTS = Object.values(TIME_SLOTS);

function validateGlucoseReading(req, res, next) {
  const { readingDate, timeSlot, glucoseValue } = req.body;

  // 1. Validate glucoseValue
  if (
    glucoseValue === undefined ||
    glucoseValue === null ||
    glucoseValue === "" ||
    (typeof glucoseValue === "string" && glucoseValue.trim() === "")
  ) {
    return next(ApiError.badRequest("Please enter a glucose value."));
  }

  const numValue = Number(glucoseValue);

  // Must be integer, finite, between 40 and 600 inclusive
  if (
    typeof glucoseValue === "boolean" ||
    isNaN(numValue) ||
    !Number.isFinite(numValue) ||
    !Number.isInteger(numValue) ||
    numValue < 40 ||
    numValue > 600
  ) {
    return next(ApiError.badRequest("Value must be between 40 and 600 mg/dl."));
  }

  // 2. Validate readingDate
  if (!readingDate || typeof readingDate !== "string" || !isValidDateString(readingDate)) {
    return next(ApiError.badRequest("Please enter a valid calendar date in YYYY-MM-DD format."));
  }

  if (isFutureDate(readingDate)) {
    return next(ApiError.badRequest("Date cannot be in the future."));
  }

  // 3. Validate timeSlot
  if (!timeSlot || !ALLOWED_SLOTS.includes(timeSlot)) {
    return next(
      ApiError.badRequest("Please select a valid time slot.")
    );
  }

  // Store normalized values
  req.body.glucoseValue = numValue;
  req.body.readingDate = readingDate;
  req.body.timeSlot = timeSlot;

  next();
}

function validateReportDate(req, res, next) {
  const { date } = req.query;

  if (!date || typeof date !== "string" || !isValidDateString(date)) {
    return next(ApiError.badRequest("Please enter a valid calendar date in YYYY-MM-DD format."));
  }

  if (isFutureDate(date)) {
    return next(ApiError.badRequest("Date cannot be in the future."));
  }

  next();
}

module.exports = {
  validateGlucoseReading,
  validateReportDate,
};
