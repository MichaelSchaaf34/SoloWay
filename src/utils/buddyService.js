import { apiRequest } from './apiClient';

const BUDDY_BASE = '/buddy';

export function createInvite(itineraryItemId, options = {}) {
  return apiRequest(`${BUDDY_BASE}/invite`, {
    method: 'POST',
    body: {
      itinerary_item_id: itineraryItemId,
      party_size_cap: options.partySizeCap || 5,
      token_ttl_minutes: options.tokenTtlMinutes || 15,
    },
    auth: true,
  });
}

export function getInviteDetails(token) {
  return apiRequest(`${BUDDY_BASE}/invite/${token}`, {
    method: 'GET',
    auth: true,
  });
}

export function cancelInvite(token) {
  return apiRequest(`${BUDDY_BASE}/invite/${token}`, {
    method: 'DELETE',
    auth: true,
  });
}

export function closeLink(linkId) {
  return apiRequest(`${BUDDY_BASE}/link/${linkId}/close`, {
    method: 'PATCH',
    auth: true,
  });
}

export function getHistory({ page = 1, limit = 20, status } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (status) params.append('status', status);
  return apiRequest(`${BUDDY_BASE}/history?${params}`, {
    method: 'GET',
    auth: true,
  });
}
export const getUserHistory = getHistory;

export function getHistoryDetail(linkId) {
  return apiRequest(`${BUDDY_BASE}/history/${linkId}`, {
    method: 'GET',
    auth: true,
  });
}
export const getLinkDetail = getHistoryDetail;

export function requestConnection(linkId) {
  return apiRequest(`${BUDDY_BASE}/connect/${linkId}`, {
    method: 'POST',
    auth: true,
  });
}

export function respondToConnection(connectionId, action) {
  return apiRequest(`${BUDDY_BASE}/connect/${connectionId}/respond`, {
    method: 'PATCH',
    body: { action },
    auth: true,
  });
}
