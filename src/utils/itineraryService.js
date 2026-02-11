import { apiRequest } from './apiClient';

export function getMyItineraries(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.limit) query.set('limit', String(params.limit));
  if (params.cursor) query.set('cursor', params.cursor);
  const suffix = query.toString() ? `?${query.toString()}` : '';

  return apiRequest(`/itineraries${suffix}`, {
    method: 'GET',
    auth: true,
  });
}

export function createItinerary(payload) {
  return apiRequest('/itineraries', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export function getItinerary(itineraryId) {
  return apiRequest(`/itineraries/${itineraryId}`, {
    method: 'GET',
    auth: true,
  });
}

export function updateItinerary(itineraryId, payload) {
  return apiRequest(`/itineraries/${itineraryId}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export function deleteItinerary(itineraryId) {
  return apiRequest(`/itineraries/${itineraryId}`, {
    method: 'DELETE',
    auth: true,
  });
}

export function addItineraryItem(itineraryId, payload) {
  return apiRequest(`/itineraries/${itineraryId}/items`, {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export function updateItineraryItem(itineraryId, itemId, payload) {
  return apiRequest(`/itineraries/${itineraryId}/items/${itemId}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export function deleteItineraryItem(itineraryId, itemId) {
  return apiRequest(`/itineraries/${itineraryId}/items/${itemId}`, {
    method: 'DELETE',
    auth: true,
  });
}
