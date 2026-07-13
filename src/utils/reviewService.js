import { apiRequest } from './apiClient';

export function listReviews({ destination, limit } = {}) {
  const params = new URLSearchParams();
  if (destination) params.set('destination', destination);
  if (limit) params.set('limit', String(limit));
  const query = params.toString();
  return apiRequest(`/reviews${query ? `?${query}` : ''}`);
}

export function createReview(payload) {
  return apiRequest('/reviews', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export function deleteReview(reviewId) {
  return apiRequest(`/reviews/${reviewId}`, {
    method: 'DELETE',
    auth: true,
  });
}
