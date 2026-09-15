import { describe, expect, it } from 'vitest';
import { encodeGeohash } from '../src/modules/events/geohash.js';

describe('encodeGeohash', () => {
  it('matches the canonical reference vector', () => {
    // The textbook example: 57.64911, 10.40744 → u4pruydqqvj
    expect(encodeGeohash(57.64911, 10.40744, 11)).toBe('u4pruydqqvj');
  });

  it('encodes the null island', () => {
    expect(encodeGeohash(0, 0, 9)).toBe('s00000000');
  });

  it('places known cities in their expected cells', () => {
    expect(encodeGeohash(40.7128, -74.006, 4)).toBe('dr5r'); // Manhattan
    expect(encodeGeohash(48.8566, 2.3522, 3)).toBe('u09'); // Paris
    expect(encodeGeohash(-33.9249, 18.4241, 3)).toBe('k3v'); // Cape Town
  });

  it('respects the requested precision', () => {
    expect(encodeGeohash(48.8566, 2.3522, 9)).toHaveLength(9);
    expect(encodeGeohash(48.8566, 2.3522, 5)).toBe(encodeGeohash(48.8566, 2.3522, 9).slice(0, 5));
  });

  it('handles the poles and the antimeridian without drifting out of base32', () => {
    for (const [lat, lng] of [
      [90, 180],
      [-90, -180],
      [0, 179.999],
    ]) {
      expect(encodeGeohash(lat, lng, 9)).toMatch(/^[0-9bcdefghjkmnpqrstuvwxyz]{9}$/);
    }
  });
});
