import { describe, expect, it } from 'vitest';
import {
  ATLAS_CARD_COUNT,
  millisecondsUntilNextRotation,
  rotateForDate,
  selectForDate,
} from './destinationRotation';
import { DESTINATIONS } from '../components/Destinations';

const HOUR = 60 * 60 * 1000;

// All fixtures are UTC instants mapped to known US Eastern wall-clock times,
// so these tests pass regardless of the machine's local timezone.
describe('destination rotation (anchored to midnight US Eastern)', () => {
  const destinations = ['kyoto', 'lisbon', 'medellin', 'cape-town'];

  it('keeps the same order throughout an Eastern calendar day', () => {
    // 2026-07-11 00:00 EDT and 23:30 EDT
    const justAfterMidnight = rotateForDate(destinations, new Date('2026-07-11T04:00:00Z'));
    const lateEvening = rotateForDate(destinations, new Date('2026-07-12T03:30:00Z'));

    expect(lateEvening).toEqual(justAfterMidnight);
  });

  it('moves to the next destination after midnight Eastern without mutating input', () => {
    // Noon EDT July 11 vs noon EDT July 12
    const today = rotateForDate(destinations, new Date('2026-07-11T16:00:00Z'));
    const tomorrow = rotateForDate(destinations, new Date('2026-07-12T16:00:00Z'));

    expect(tomorrow[0]).toBe(today[1]);
    expect(destinations).toEqual(['kyoto', 'lisbon', 'medellin', 'cape-town']);
  });

  it('rotates at the same instant for visitors in other timezones', () => {
    // 23:59 EDT July 11 vs 00:01 EDT July 12 — a flip at a fixed UTC instant
    const beforeFlip = rotateForDate(destinations, new Date('2026-07-12T03:59:00Z'));
    const afterFlip = rotateForDate(destinations, new Date('2026-07-12T04:01:00Z'));

    expect(afterFlip[0]).toBe(beforeFlip[1]);
  });

  it('calculates the remaining time until midnight Eastern', () => {
    // 23:59:59.500 EDT on July 11
    const almostMidnight = new Date('2026-07-12T03:59:59.500Z');

    expect(millisecondsUntilNextRotation(almostMidnight)).toBe(500);
  });

  it('handles the 23-hour spring-forward day', () => {
    // 2026-03-08 01:00 EST — clocks jump to 3:00 EDT at 2am, so only 22
    // real hours remain until midnight Eastern.
    const beforeSpringForward = new Date('2026-03-08T06:00:00Z');

    expect(millisecondsUntilNextRotation(beforeSpringForward)).toBe(22 * HOUR);
  });
});

describe('selectForDate (daily atlas window from a larger pool)', () => {
  const pool = DESTINATIONS.map(destination => destination.id);

  it('keeps a pool larger than the card count so new cities can appear', () => {
    expect(pool.length).toBeGreaterThan(ATLAS_CARD_COUNT);
  });

  it('shows exactly ATLAS_CARD_COUNT destinations', () => {
    const today = selectForDate(DESTINATIONS, ATLAS_CARD_COUNT, new Date('2026-07-18T16:00:00Z'));

    expect(today).toHaveLength(ATLAS_CARD_COUNT);
  });

  it('keeps the same city set throughout an Eastern calendar day', () => {
    const morning = selectForDate(DESTINATIONS, ATLAS_CARD_COUNT, new Date('2026-07-18T04:00:00Z'));
    const evening = selectForDate(DESTINATIONS, ATLAS_CARD_COUNT, new Date('2026-07-19T03:30:00Z'));

    expect(evening.map(d => d.id)).toEqual(morning.map(d => d.id));
  });

  it('surfaces a different set of cities the next Eastern day', () => {
    const today = selectForDate(DESTINATIONS, ATLAS_CARD_COUNT, new Date('2026-07-18T16:00:00Z'));
    const tomorrow = selectForDate(DESTINATIONS, ATLAS_CARD_COUNT, new Date('2026-07-19T16:00:00Z'));

    const todayIds = new Set(today.map(d => d.id));
    const tomorrowIds = new Set(tomorrow.map(d => d.id));
    const overlap = [...todayIds].filter(id => tomorrowIds.has(id));

    // Window advances by the full card count, so consecutive days should not
    // share the same six cities (overlap is empty when pool % count !== 0
    // wrap is partial — allow at most a wrap-around minority).
    expect(overlap.length).toBeLessThan(ATLAS_CARD_COUNT);
    expect(today[0].id).not.toBe(tomorrow[0].id);
  });

  it('changes the featured lead across several consecutive days', () => {
    const leads = [0, 1, 2, 3, 4].map(offsetDays => {
      const date = new Date(Date.UTC(2026, 6, 18 + offsetDays, 16, 0, 0));
      return selectForDate(DESTINATIONS, ATLAS_CARD_COUNT, date)[0].id;
    });

    expect(new Set(leads).size).toBeGreaterThanOrEqual(3);
  });

  it('does not mutate the input pool', () => {
    const before = DESTINATIONS.map(d => d.id);
    selectForDate(DESTINATIONS, ATLAS_CARD_COUNT, new Date('2026-07-18T16:00:00Z'));
    expect(DESTINATIONS.map(d => d.id)).toEqual(before);
  });

  it('falls back to one-step rotate when pool size equals count', () => {
    const smallPool = DESTINATIONS.slice(0, ATLAS_CARD_COUNT);
    const today = selectForDate(smallPool, ATLAS_CARD_COUNT, new Date('2026-07-18T16:00:00Z'));
    const tomorrow = selectForDate(smallPool, ATLAS_CARD_COUNT, new Date('2026-07-19T16:00:00Z'));

    expect(today).toHaveLength(ATLAS_CARD_COUNT);
    expect(tomorrow[0].id).toBe(today[1].id);
  });
});
