/**
 * Geohash encoder for Ticketmaster's `geoPoint` parameter.
 *
 * The Discovery API marks `latlong` deprecated in favour of `geoPoint`, which
 * takes a geohash. Precision 9 (~5m cells) measured identical result counts to
 * `latlong`; precision 5 lost events, so do not lower the default.
 */

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

export function encodeGeohash(latitude, longitude, precision = 9) {
  let latMin = -90;
  let latMax = 90;
  let lngMin = -180;
  let lngMax = 180;

  let hash = '';
  let bits = 0;
  let bitCount = 0;
  let bisectLongitude = true;

  while (hash.length < precision) {
    if (bisectLongitude) {
      const mid = (lngMin + lngMax) / 2;
      if (longitude >= mid) {
        bits = (bits << 1) + 1;
        lngMin = mid;
      } else {
        bits <<= 1;
        lngMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (latitude >= mid) {
        bits = (bits << 1) + 1;
        latMin = mid;
      } else {
        bits <<= 1;
        latMax = mid;
      }
    }

    bisectLongitude = !bisectLongitude;

    // Base32 packs five bits per character.
    if (++bitCount === 5) {
      hash += BASE32[bits];
      bits = 0;
      bitCount = 0;
    }
  }

  return hash;
}
