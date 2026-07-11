import { apiRequest } from './apiClient';

export function createCheckout(payload) {
  return apiRequest('/payments/checkout', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export function getOrder(orderId) {
  return apiRequest(`/payments/orders/${orderId}`, {
    auth: true,
  });
}

export function requestRefund(orderId, reason) {
  return apiRequest(`/payments/orders/${orderId}/refund`, {
    method: 'POST',
    body: { reason },
    auth: true,
  });
}
