import { apiRequest } from './apiClient';

export function listExperiences({ destination, category, limit } = {}) {
  const params = new URLSearchParams();
  if (destination) params.set('destination', destination);
  if (category) params.set('category', category);
  if (limit) params.set('limit', String(limit));
  const query = params.toString();
  return apiRequest(`/experiences${query ? `?${query}` : ''}`);
}

export function createExperience(payload) {
  return apiRequest('/experiences', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}
