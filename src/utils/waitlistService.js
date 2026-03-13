import { apiRequest } from './apiClient';

export function joinWaitlist(payload) {
  return apiRequest('/waitlist', {
    method: 'POST',
    body: payload,
  });
}
