/**
 * Temporal correctness utilities
 * All dates are handled in LOCAL timezone, never UTC
 */

/**
 * Get today's date in local timezone as YYYY-MM-DD
 */
export function getToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get user's timezone (IANA format)
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Check if we need to refresh "today" (for midnight rollover)
 */
export function shouldRefreshToday(lastActiveDate: string | undefined): boolean {
  if (!lastActiveDate) return true;
  const today = getToday();
  return today !== lastActiveDate;
}

/**
 * Get ISO week start (Monday or Sunday)
 */
export function getStartOfISOWeek(date: string, weekStartsOn: 0 | 1 = 1): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === weekStartsOn ? 0 : (day < weekStartsOn ? 7 - weekStartsOn + day : day - weekStartsOn);
  d.setDate(d.getDate() - diff);
  return getTodayFromDate(d);
}

/**
 * Format date as YYYY-MM-DD
 */
function getTodayFromDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate days between two dates (local)
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get days left in current week
 */
export function daysLeftInWeek(weekStartsOn: 0 | 1 = 1): number {
  const today = new Date();
  const day = today.getDay();
  if (weekStartsOn === 1) {
    // Monday = 0 days left if Monday, ..., Sunday = 6 days left
    return day === 0 ? 6 : day - 1;
  } else {
    // Sunday = 0 days left if Sunday, ..., Saturday = 6 days left
    return day === 0 ? 0 : 7 - day;
  }
}

/**
 * Add days to a date
 */
export function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return getTodayFromDate(d);
}
