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
  dedupeByName,
  formatTicketmasterEvent,
  listDestinationEvents,
} from '../src/modules/events/events.service.js';

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
    expect(calledUrl).toContain('city=Reykjavik');
    expect(calledUrl).toContain('countryCode=IS');
    expect(calledUrl).toContain('apikey=test-key');
  });

  it('returns an empty list when Ticketmaster fails', async () => {
    mocks.apiKey.value = 'test-key';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }));

    await expect(listDestinationEvents({ destination: 'lisbon' })).resolves.toEqual([]);
  });
});
