/** The platform serves India only — every date/time shown or entered follows IST regardless of the browser's own time zone. */
export const APP_TIME_ZONE = "Asia/Kolkata";

/** India has no daylight saving, so IST is always a fixed UTC+05:30. */
const IST_OFFSET = "+05:30";

/** YYYY-MM-DD of a date as seen in India (for <input type="date"> min/max and same-day comparisons). */
export function toIstDateKey(d: Date | number): string {
  return new Date(d).toLocaleDateString("en-CA", { timeZone: APP_TIME_ZONE });
}

/** Epoch ms for a wall-clock date + time ("2026-09-20", "06:00") entered as Indian time. */
export function istTimestamp(date: string, time: string): number {
  return new Date(`${date}T${time}:00${IST_OFFSET}`).getTime();
}

/** en-IN formats am/pm in lowercase ("6:15 am"); the platform shows it uppercase ("6:15 AM"). */
export function upperAmPm(formatted: string): string {
  return formatted.replace(/\b(am|pm)\b/gi, (m) => m.toUpperCase());
}
