import { apiRequest } from './apiClient';

function toQueryString(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value);
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export async function getStats() {
  const response = await apiRequest('/admin/stats', { auth: true });
  return response.data.stats;
}

export async function listUsers(params) {
  const response = await apiRequest(`/admin/users${toQueryString(params)}`, { auth: true });
  return response.data;
}

export async function getUserDetail(userId) {
  const response = await apiRequest(`/admin/users/${userId}`, { auth: true });
  return response.data.user;
}

export async function deleteUser(userId) {
  await apiRequest(`/admin/users/${userId}`, { method: 'DELETE', auth: true });
}

export async function listWaitlist(params) {
  const response = await apiRequest(`/admin/waitlist${toQueryString(params)}`, { auth: true });
  return response.data;
}

export async function listProviders() {
  const response = await apiRequest('/admin/providers', { auth: true });
  return response.data.providers;
}

export async function listExperiences(params) {
  const response = await apiRequest(`/admin/experiences${toQueryString(params)}`, { auth: true });
  return response.data;
}

export async function setExperienceActive(experienceId, isActive) {
  const response = await apiRequest(`/admin/experiences/${experienceId}`, {
    method: 'PATCH',
    auth: true,
    body: { isActive },
  });
  return response.data.experience;
}

export async function listOrders(params) {
  const response = await apiRequest(`/admin/orders${toQueryString(params)}`, { auth: true });
  return response.data;
}

export async function getOrderDetail(orderId) {
  const response = await apiRequest(`/admin/orders/${orderId}`, { auth: true });
  return response.data.order;
}

export async function refundOrder(orderId, reason) {
  const response = await apiRequest(`/admin/orders/${orderId}/refund`, {
    method: 'POST',
    auth: true,
    body: { reason: reason || '' },
  });
  return response.data.refund;
}

export async function listReviews(params) {
  const response = await apiRequest(`/admin/reviews${toQueryString(params)}`, { auth: true });
  return response.data;
}

export async function deleteReview(reviewId) {
  await apiRequest(`/admin/reviews/${reviewId}`, { method: 'DELETE', auth: true });
}

export async function listAuditLog(params) {
  const response = await apiRequest(`/admin/audit-log${toQueryString(params)}`, { auth: true });
  return response.data;
}
