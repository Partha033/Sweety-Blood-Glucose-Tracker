export const TIME_SLOTS = [
  { value: "morning_fasting", label: "Morning (fasting)" },
  { value: "after_breakfast", label: "After breakfast" },
  { value: "after_lunch", label: "After lunch" },
  { value: "after_dinner", label: "After dinner" },
];

export const TIME_SLOT_LABELS = {
  morning_fasting: "Morning (fasting)",
  after_breakfast: "After breakfast",
  after_lunch: "After lunch",
  after_dinner: "After dinner",
};

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a date string is in the future relative to today
 */
export function isFutureDate(dateStr) {
  if (!dateStr) return false;
  return dateStr > getTodayDateString();
}

/**
 * Formats a calendar YYYY-MM-DD string nicely for UI display
 */
export function formatDateDisplay(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;

  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
