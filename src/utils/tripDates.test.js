import { describe, expect, it } from 'vitest';
import { formatDateRange, parseISODate, toISODate } from './tripDates';

describe('tripDates', () => {
  it('formats a date using local time, not UTC', () => {
    // Late-evening local time is already the next day in UTC. Using
    // toISOString here would send the wrong calendar day for anyone
    // west of UTC.
    const lateEvening = new Date(2026, 7, 7, 23, 30);
    expect(toISODate(lateEvening)).toBe('2026-08-07');
  });

  it('pads single-digit months and days', () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('round-trips through parse without shifting the day', () => {
    const parsed = parseISODate('2026-08-07');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(7);
    expect(parsed.getDate()).toBe(7);
    expect(toISODate(parsed)).toBe('2026-08-07');
  });

  it('rejects malformed and impossible dates', () => {
    expect(parseISODate('')).toBeNull();
    expect(parseISODate(null)).toBeNull();
    expect(parseISODate('not-a-date')).toBeNull();
    expect(parseISODate('2026-8-7')).toBeNull();
    // Date would silently roll this forward to March 3rd.
    expect(parseISODate('2026-02-31')).toBeNull();
  });

  it('labels a full range, a single date, and no date', () => {
    expect(formatDateRange('2026-08-07', '2026-08-12')).toBe('Aug 7 – Aug 12');
    expect(formatDateRange('2026-08-07', '')).toBe('Aug 7');
    expect(formatDateRange('', '')).toBe('Anytime');
    expect(formatDateRange(null, null)).toBe('Anytime');
  });

  it('accepts Date objects as well as ISO strings', () => {
    expect(formatDateRange(new Date(2026, 7, 7), new Date(2026, 7, 12))).toBe('Aug 7 – Aug 12');
  });
});
