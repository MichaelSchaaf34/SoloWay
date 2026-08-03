import { apiRequest } from './apiClient';

/**
 * Live local events for a destination ("Happening in {city}").
 * Returns [] when the backend has no events API key configured,
 * in which case callers should hide the section.
 *
 * `startDate`/`endDate` are `YYYY-MM-DD` strings; when present the backend
 * scopes the search to that trip window. `endDate` is only honoured
 * alongside a `startDate`.
 */
export function listDestinationEvents(destination, { limit, startDate, endDate } = {}) {
  const params = new URLSearchParams({ destination });
  if (limit) params.set('limit', String(limit));
  if (startDate) {
    params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
  }
  return apiRequest(`/events?${params}`);
}
