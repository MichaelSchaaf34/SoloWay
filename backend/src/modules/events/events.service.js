import { config } from '../../config/index.js';
import { cache } from '../../shared/cache/redis.js';

/**
 * Live "what's happening" events via the Ticketmaster Discovery API.
 *
 * Informational only — SoloWay takes no commission and adds no affiliate
 * params; events link out to the ticket seller. Results are filtered to
 * solo-friendly spectator categories (music, arts, sports) and cached in
 * Redis per destination. Without TICKETMASTER_API_KEY the service returns
 * an empty list so the frontend hides the section entirely.
 */

const TICKETMASTER_BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';

// Spectator-style events are the easiest things to attend alone.
const SOLO_FRIENDLY_CLASSIFICATIONS = 'Music,Arts & Theatre,Sports';

const CACHE_TTL_SECONDS = 6 * 60 * 60;
const EMPTY_CACHE_TTL_SECONDS = 30 * 60;

// Destination slug → Ticketmaster city search. Plain-ASCII city names —
// the Discovery API city param is text-based.
export const DESTINATION_CITIES = {
  medellin: { city: 'Medellin', countryCode: 'CO' },
  lisbon: { city: 'Lisbon', countryCode: 'PT' },
  kyoto: { city: 'Kyoto', countryCode: 'JP' },
  'cape-town': { city: 'Cape Town', countryCode: 'ZA' },
  barcelona: { city: 'Barcelona', countryCode: 'ES' },
  reykjavik: { city: 'Reykjavik', countryCode: 'IS' },
  florence: { city: 'Florence', countryCode: 'IT' },
  bangkok: { city: 'Bangkok', countryCode: 'TH' },
  bali: { city: 'Denpasar', countryCode: 'ID' },
  marrakech: { city: 'Marrakech', countryCode: 'MA' },
  'new-york': { city: 'New York', countryCode: 'US' },
  paris: { city: 'Paris', countryCode: 'FR' },
  'buenos-aires': { city: 'Buenos Aires', countryCode: 'AR' },
  seoul: { city: 'Seoul', countryCode: 'KR' },
  prague: { city: 'Prague', countryCode: 'CZ' },
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

async function fetchTicketmasterEvents(location, limit) {
  // Discovery API rejects fractional seconds in startDateTime.
  const startDateTime = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

  const params = new URLSearchParams({
    apikey: config.externalApis.ticketmasterApiKey,
    city: location.city,
    countryCode: location.countryCode,
    classificationName: SOLO_FRIENDLY_CLASSIFICATIONS,
    startDateTime,
    sort: 'date,asc',
    // Over-fetch so deduping repeat performances still fills the limit.
    size: String(Math.min(limit * 3, 60)),
  });

  const response = await fetch(`${TICKETMASTER_BASE_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Ticketmaster responded with ${response.status}`);
  }

  const payload = await response.json();
  const events = payload?._embedded?.events || [];
  return dedupeByName(events.map(formatTicketmasterEvent)).slice(0, limit);
}

export async function listDestinationEvents({ destination, limit = 8 }) {
  const location = DESTINATION_CITIES[destination];
  if (!location || !config.externalApis.ticketmasterApiKey) return [];

  const cacheKey = `events:${destination}:${limit}`;
  const cached = await cache.get(cacheKey);
  if (cached !== null) return cached;

  try {
    const events = await fetchTicketmasterEvents(location, limit);
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
