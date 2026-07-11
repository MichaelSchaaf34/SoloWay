import { describe, expect, it } from 'vitest';
import {
  millisecondsUntilNextLocalDay,
  rotateForDate,
} from './destinationRotation';

describe('destination rotation', () => {
  const destinations = ['kyoto', 'lisbon', 'medellin', 'cape-town'];

  it('keeps the same order throughout a local calendar day', () => {
    const morning = rotateForDate(destinations, new Date(2026, 6, 11, 8, 0));
    const evening = rotateForDate(destinations, new Date(2026, 6, 11, 22, 30));

    expect(evening).toEqual(morning);
  });

  it('moves to the next destination on the next day without mutating input', () => {
    const today = rotateForDate(destinations, new Date(2026, 6, 11, 12, 0));
    const tomorrow = rotateForDate(destinations, new Date(2026, 6, 12, 12, 0));

    expect(tomorrow[0]).toBe(today[1]);
    expect(destinations).toEqual(['kyoto', 'lisbon', 'medellin', 'cape-town']);
  });

  it('calculates the remaining time until local midnight', () => {
    const almostMidnight = new Date(2026, 6, 11, 23, 59, 59, 500);

    expect(millisecondsUntilNextLocalDay(almostMidnight)).toBe(500);
  });
});
