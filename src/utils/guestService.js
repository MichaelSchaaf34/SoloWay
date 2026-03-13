import { apiRequest } from './apiClient';

const BUDDY_BASE = '/buddy';

export function previewInvite(token) {
  return apiRequest(`${BUDDY_BASE}/join/${token}`);
}
export const getInviteInfo = previewInvite;

export function requestVerification(token, phoneNumber, displayName) {
  return apiRequest(`${BUDDY_BASE}/join/${token}/verify`, {
    method: 'POST',
    body: {
      phone_number: phoneNumber,
      display_name: displayName,
    },
  });
}
export const startVerification = requestVerification;

export function confirmVerification(token, phoneNumber, code) {
  return apiRequest(`${BUDDY_BASE}/join/${token}/confirm`, {
    method: 'POST',
    body: {
      phone_number: phoneNumber,
      code,
    },
  });
}
export const confirmCode = confirmVerification;
