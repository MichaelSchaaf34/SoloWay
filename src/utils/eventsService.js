import { apiRequest } from './apiClient';

/**
 * Live local events for a destination ("Happening in {city}").
 * Returns [] when the backend has no events API key configured,
 * in which case callers should hide the section.
 */
export function listDestinationEvents(destination, { limit } = {}) {
  const params = new URLSearchParams({ destination });
  if (limit) params.set('limit', String(limit));
  return apiRequest(`/events?${params}`);
}
