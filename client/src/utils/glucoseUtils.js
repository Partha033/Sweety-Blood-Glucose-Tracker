/**
 * Informational helpers for glucose status tags
 * Note: Non-diagnostic, strictly for user convenience and visual categorization
 */

export function getGlucoseStatus(value, slot) {
  const num = parseInt(value, 10);
  if (isNaN(num)) return { label: "Unknown", color: "gray" };

  if (num < 70) {
    return {
      label: "Low",
      color: "amber",
      badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    };
  }

  const isFasting = slot === "morning_fasting";

  if (isFasting) {
    if (num <= 99) {
      return {
        label: "Normal",
        color: "emerald",
        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
      };
    }
    if (num <= 125) {
      return {
        label: "Elevated",
        color: "orange",
        badgeClass: "bg-orange-100 text-orange-800 border-orange-200",
      };
    }
    return {
      label: "High",
      color: "rose",
      badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
    };
  } else {
    // Post-prandial (after meals)
    if (num < 140) {
      return {
        label: "Normal",
        color: "emerald",
        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
      };
    }
    if (num <= 199) {
      return {
        label: "Elevated",
        color: "orange",
        badgeClass: "bg-orange-100 text-orange-800 border-orange-200",
      };
    }
    return {
      label: "High",
      color: "rose",
      badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
    };
  }
}
