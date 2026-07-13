import { describe, expect, it } from 'vitest';
import {
  millisecondsUntilNextRotation,
  rotateForDate,
} from './destinationRotation';

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
