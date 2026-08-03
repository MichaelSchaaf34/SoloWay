/**
 * Trip-date helpers shared by the home search bar and destination pages.
 *
 * Dates travel through the URL as `YYYY-MM-DD` calendar days. Conversion is
 * deliberately local-time (not `toISOString`), which would shift the day
 * backwards for anyone west of UTC and show the wrong date.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Date → `YYYY-MM-DD` in the viewer's own timezone. */
export function toISODate(date) {
  if (!date) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** `YYYY-MM-DD` → local Date at midnight, or null when malformed. */
export function parseISODate(value) {
  if (!value || !ISO_DATE.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  // Rejects impossible days like 2026-02-31, which Date would roll forward.
  return date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

const toDate = value => (typeof value === 'string' ? parseISODate(value) : value);

/** Short display label, e.g. "Aug 7 – Aug 12". Accepts Dates or ISO strings. */
export function formatDateRange(start, end) {
  const startDate = toDate(start);
  if (!startDate) return 'Anytime';
  const endDate = toDate(end);
  const short = date => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return endDate ? `${short(startDate)} – ${short(endDate)}` : short(startDate);
}
