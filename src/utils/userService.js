import { apiRequest } from './apiClient';

export function getProfile() {
  return apiRequest('/users/profile', {
    method: 'GET',
    auth: true,
  });
}
