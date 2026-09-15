import { config } from '../../config/index.js';
import { cache } from '../../shared/cache/redis.js';
import { encodeGeohash } from './geohash.js';

/**
 * Live "what's happening" events via the Ticketmaster Discovery API.
 *
 * Informational only — SoloWay takes no commission and adds no affiliate
 * params; events link out to the ticket seller. Results are filtered to
 * solo-friendly spectator categories (music, arts, sports) and cached in
 * Redis per destination. Without TICKETMASTER_API_KEY the service returns
 * an empty list so the frontend hides the section entirely.
 *
 * Ticketmaster has no inventory at all in several countries we ship
 * destinations for, so an empty list is an expected outcome rather than a
 * fault. `npm run events:probe` reports live coverage per destination.
 */

const TICKETMASTER_BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';

// Spectator-style events are the easiest things to attend alone.
const SOLO_FRIENDLY_CLASSIFICATIONS = 'Music,Arts & Theatre,Sports';

// City-scale. 75km was measured to drag in neighbouring towns (Barcelona went
// from 22 events to 144), which is not "happening in this city".
const SEARCH_RADIUS_KM = 25;

const CACHE_TTL_SECONDS = 6 * 60 * 60;
const EMPTY_CACHE_TTL_SECONDS = 30 * 60;

/**
 * Destination slug → city centre, searched geographically.
 *
 * Ticketmaster's text `city` param matches the venue's own city label, so it
 * silently misses cities listed under a local name — measured 0 results for
 * `city=Prague` (venues say "Praha") and `city=Florence` ("Firenze") against
 * 470 and 149 for the same coordinates. Coordinates mirror
 * `src/data/destinationCoordinates.js`; frontend and backend are separate
 * packages and cannot share the module.
 */
export const DESTINATION_EVENT_AREAS = {
  medellin: { label: 'Medellín', lat: 6.2476, lng: -75.5658 },
  lisbon: { label: 'Lisbon', lat: 38.7223, lng: -9.1393 },
  kyoto: { label: 'Kyoto', lat: 35.0116, lng: 135.7681 },
  'cape-town': { label: 'Cape Town', lat: -33.9249, lng: 18.4241 },
  barcelona: { label: 'Barcelona', lat: 41.3874, lng: 2.1686 },
  reykjavik: { label: 'Reykjavik', lat: 64.1466, lng: -21.9426 },
  florence: { label: 'Florence', lat: 43.7696, lng: 11.2558 },
  bangkok: { label: 'Bangkok', lat: 13.7563, lng: 100.5018 },
  bali: { label: 'Bali', lat: -8.4095, lng: 115.1889 },
  marrakech: { label: 'Marrakech', lat: 31.6295, lng: -7.9811 },
  'new-york': { label: 'New York', lat: 40.7128, lng: -74.006 },
  paris: { label: 'Paris', lat: 48.8566, lng: 2.3522 },
  'buenos-aires': { label: 'Buenos Aires', lat: -34.6037, lng: -58.3816 },
  seoul: { label: 'Seoul', lat: 37.5665, lng: 126.978 },
  prague: { label: 'Prague', lat: 50.0755, lng: 14.4378 },
};

function pickImage(images = []) {
  const wide = images.find(image => image.ratio === '16_9' && image.width >= 640);
  return (wide || images[0])?.url || null;
}

export function formatTicketmasterEvent(event) {
  const venue = event._embedded?.venues?.[0];
  return {
    id: event.id,
    name: event.name,
    url: event.url || null,
    date: event.dates?.start?.localDate || null,
    time: event.dates?.start?.localTime || null,
    venue: venue?.name || null,
    imageUrl: pickImage(event.images),
    category: event.classifications?.[0]?.segment?.name || 'Event',
  };
}

/** Ticketmaster lists each performance date separately; keep one per name. */
export function dedupeByName(events) {
  const seen = new Set();
  return events.filter(event => {
    const key = event.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Discovery API rejects fractional seconds in its date params. */
function toDiscoveryStamp(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

// Exported so `npm run events:probe` can measure real coverage through the
// exact request this module sends, without the Redis cache in the way.
export async function fetchTicketmasterEvents(area, limit, { startDate, endDate } = {}) {
  const now = new Date();
  // Never ask for events that already happened, even if a stale trip start
  // date is passed in.
  const start = startDate && startDate > now ? startDate : now;

  const params = new URLSearchParams({
    apikey: config.externalApis.ticketmasterApiKey,
    geoPoint: encodeGeohash(area.lat, area.lng),
    radius: String(SEARCH_RADIUS_KM),
    unit: 'km',
    // Without this Ticketmaster returns only English-locale listings, which
    // hides most of a non-English city's calendar: Paris measured 1 event
    // without it and 7,000+ with it.
    locale: '*',
    classificationName: SOLO_FRIENDLY_CLASSIFICATIONS,
    startDateTime: toDiscoveryStamp(start),
    sort: 'date,asc',
    // Over-fetch so deduping repeat performances still fills the limit.
    size: String(Math.min(limit * 3, 60)),
  });

  if (endDate) {
    // The picker sends a calendar day; include everything up to its last
    // moment so an event on the departure date still counts.
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 0);
    params.set('endDateTime', toDiscoveryStamp(end));
  }

  const response = await fetch(`${TICKETMASTER_BASE_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Ticketmaster responded with ${response.status}`);
  }

  const payload = await response.json();
  const events = payload?._embedded?.events || [];
  return dedupeByName(events.map(formatTicketmasterEvent)).slice(0, limit);
}

export async function listDestinationEvents({ destination, limit = 8, startDate, endDate }) {
  const area = DESTINATION_EVENT_AREAS[destination];
  if (!area || !config.externalApis.ticketmasterApiKey) return [];

  // Date-scoped results are a different result set, so they need their own
  // cache entry — otherwise a trip window would serve the undated list.
  const window = startDate
    ? `${startDate.toISOString().slice(0, 10)}:${endDate ? endDate.toISOString().slice(0, 10) : 'open'}`
    : 'any';
  const cacheKey = `events:${destination}:${limit}:${window}`;
  const cached = await cache.get(cacheKey);
  if (cached !== null) return cached;

  try {
    const events = await fetchTicketmasterEvents(area, limit, { startDate, endDate });
    await cache.set(
      cacheKey,
      events,
      events.length > 0 ? CACHE_TTL_SECONDS : EMPTY_CACHE_TTL_SECONDS
    );
    return events;
  } catch (error) {
    // Never fail the destination page over a third-party event feed.
    console.warn(`Events lookup failed for ${destination}:`, error.message);
    await cache.set(cacheKey, [], EMPTY_CACHE_TTL_SECONDS);
    return [];
  }
}
