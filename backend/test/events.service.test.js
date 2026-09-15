import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  apiKey: { value: null },
}));

vi.mock('../src/config/index.js', () => ({
  config: {
    externalApis: {
      get ticketmasterApiKey() {
        return mocks.apiKey.value;
      },
    },
    redis: { url: null },
  },
}));

import {
  DESTINATION_EVENT_AREAS,
  dedupeByName,
  formatTicketmasterEvent,
  listDestinationEvents,
} from '../src/modules/events/events.service.js';
import { encodeGeohash } from '../src/modules/events/geohash.js';

function makeTicketmasterEvent(overrides = {}) {
  return {
    id: 'evt-1',
    name: 'Sigur Rós Live',
    url: 'https://www.ticketmaster.com/event/evt-1',
    dates: { start: { localDate: '2026-08-01', localTime: '20:00:00' } },
    classifications: [{ segment: { name: 'Music' } }],
    images: [
      { ratio: '4_3', width: 305, url: 'https://img.example/small.jpg' },
      { ratio: '16_9', width: 1024, url: 'https://img.example/wide.jpg' },
    ],
    _embedded: { venues: [{ name: 'Harpa Concert Hall' }] },
    ...overrides,
  };
}

describe('events service', () => {
  beforeEach(() => {
    mocks.apiKey.value = null;
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('formats a Ticketmaster event into the public shape', () => {
    const formatted = formatTicketmasterEvent(makeTicketmasterEvent());

    expect(formatted).toEqual({
      id: 'evt-1',
      name: 'Sigur Rós Live',
      url: 'https://www.ticketmaster.com/event/evt-1',
      date: '2026-08-01',
      time: '20:00:00',
      venue: 'Harpa Concert Hall',
      imageUrl: 'https://img.example/wide.jpg',
      category: 'Music',
    });
  });

  it('tolerates missing optional fields', () => {
    const formatted = formatTicketmasterEvent({ id: 'evt-2', name: 'Mystery Show' });

    expect(formatted.venue).toBeNull();
    expect(formatted.imageUrl).toBeNull();
    expect(formatted.date).toBeNull();
    expect(formatted.category).toBe('Event');
  });

  it('dedupes repeat performances by name', () => {
    const events = [
      { id: '1', name: 'Same Show' },
      { id: '2', name: 'same show' },
      { id: '3', name: 'Other Show' },
    ];

    expect(dedupeByName(events).map(event => event.id)).toEqual(['1', '3']);
  });

  it('returns an empty list without an API key', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    await expect(listDestinationEvents({ destination: 'reykjavik' })).resolves.toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns an empty list for unsupported destinations', async () => {
    mocks.apiKey.value = 'test-key';
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    await expect(listDestinationEvents({ destination: 'atlantis' })).resolves.toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('fetches, dedupes, and limits events for a supported destination', async () => {
    mocks.apiKey.value = 'test-key';
    const payload = {
      _embedded: {
        events: [
          makeTicketmasterEvent({ id: 'a', name: 'Concert A' }),
          makeTicketmasterEvent({ id: 'a2', name: 'Concert A' }),
          makeTicketmasterEvent({ id: 'b', name: 'Concert B' }),
          makeTicketmasterEvent({ id: 'c', name: 'Concert C' }),
        ],
      },
    };
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => payload });
    vi.stubGlobal('fetch', fetchSpy);

    const events = await listDestinationEvents({ destination: 'reykjavik', limit: 2 });

    expect(events.map(event => event.id)).toEqual(['a', 'b']);
    const calledUrl = fetchSpy.mock.calls[0][0];
    expect(calledUrl).toContain(`geoPoint=${encodeGeohash(64.1466, -21.9426)}`);
    expect(calledUrl).toContain('radius=25');
    expect(calledUrl).toContain('unit=km');
    expect(calledUrl).toContain('apikey=test-key');
  });

  // Searching by Ticketmaster's text `city` param returned nothing for cities
  // whose venues carry a local name (Praha, Firenze), and the default locale
  // filter hid most non-English listings. Both are easy to reintroduce.
  it('searches by coordinates across every locale, not by city name', async () => {
    mocks.apiKey.value = 'test-key';
    const fetchSpy = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ _embedded: { events: [] } }) });
    vi.stubGlobal('fetch', fetchSpy);

    await listDestinationEvents({ destination: 'prague' });

    const url = decodeURIComponent(fetchSpy.mock.calls[0][0]);
    expect(url).toContain('locale=*');
    expect(url).toContain(`geoPoint=${encodeGeohash(50.0755, 14.4378)}`);
    expect(url).not.toContain('city=');
    expect(url).not.toContain('countryCode=');
  });

  it('covers every shipped destination with coordinates', () => {
    for (const [slug, area] of Object.entries(DESTINATION_EVENT_AREAS)) {
      expect(Number.isFinite(area.lat), `${slug} lat`).toBe(true);
      expect(Number.isFinite(area.lng), `${slug} lng`).toBe(true);
      expect(Math.abs(area.lat), `${slug} lat range`).toBeLessThanOrEqual(90);
      expect(Math.abs(area.lng), `${slug} lng range`).toBeLessThanOrEqual(180);
    }
  });

  it('scopes the search to a trip window when dates are given', async () => {
    mocks.apiKey.value = 'test-key';
    const fetchSpy = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ _embedded: { events: [] } }) });
    vi.stubGlobal('fetch', fetchSpy);

    await listDestinationEvents({
      destination: 'barcelona',
      startDate: new Date('2099-06-10T00:00:00Z'),
      endDate: new Date('2099-06-14T00:00:00Z'),
    });

    const url = decodeURIComponent(fetchSpy.mock.calls[0][0]);
    expect(url).toContain('startDateTime=2099-06-10T00:00:00Z');
    // The departure day is inclusive, so the window runs to its last second.
    expect(url).toContain('endDateTime=2099-06-14T23:59:59Z');
  });

  it('never asks for events before now, even with a stale start date', async () => {
    mocks.apiKey.value = 'test-key';
    const fetchSpy = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ _embedded: { events: [] } }) });
    vi.stubGlobal('fetch', fetchSpy);

    await listDestinationEvents({
      destination: 'barcelona',
      startDate: new Date('2000-01-01T00:00:00Z'),
    });

    const url = decodeURIComponent(fetchSpy.mock.calls[0][0]);
    expect(url).not.toContain('startDateTime=2000-01-01');
    expect(url).not.toContain('endDateTime=');
    const sent = new Date(url.match(/startDateTime=([^&]+)/)[1]);
    expect(sent.getTime()).toBeGreaterThan(new Date('2020-01-01').getTime());
  });

  it('returns an empty list when Ticketmaster fails', async () => {
    mocks.apiKey.value = 'test-key';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }));

    await expect(listDestinationEvents({ destination: 'lisbon' })).resolves.toEqual([]);
  });
});
